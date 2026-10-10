import { prisma } from '../db/prisma';
import { UserRole } from '@prisma/client';

export interface SourceCitation {
  id: string;
  sourceType: 'DOCUMENT' | 'HEARING' | 'ORDER' | 'DEPOSITION';
  title: string;
  pageNumber?: number;
  date?: string;
  exactSnippet: string;
  confidenceScore?: number;
}

export interface AIQueryResponse {
  answer: string;
  citations: SourceCitation[];
  disclaimer: string;
  suggestedActions: string[];
}

export class AIService {
  /**
   * Execute case-specific Retrieval-Augmented Generation (RAG)
   */
  async queryCase(
    caseId: string,
    prompt: string,
    userId: string,
    userRole: UserRole
  ): Promise<AIQueryResponse> {
    const caseRecord = await prisma.case.findUnique({
      where: { id: caseId },
      include: {
        court: true,
        parties: true,
        hearings: {
          orderBy: { hearingDate: 'desc' },
          take: 5,
        },
        orders: {
          orderBy: { orderDate: 'desc' },
          where: userRole === UserRole.CLIENT ? { isSharedWithClient: true } : {},
        },
        witnesses: {
          include: { depositions: true },
        },
        documents: {
          where:
            userRole === UserRole.CLIENT
              ? { visibility: 'CLIENT_VISIBLE', isDeleted: false }
              : { isDeleted: false },
          include: {
            category: true,
            extractedPages: true,
          },
        },
      },
    });

    if (!caseRecord) {
      throw new Error('Case not found or access unauthorized.');
    }

    const cleanPrompt = prompt.trim().toLowerCase();
    const citations: SourceCitation[] = [];
    let answer = '';
    const suggestedActions: string[] = [];

    // 1. HEARINGS QUERY PATTERN
    if (
      cleanPrompt.includes('hearing') ||
      cleanPrompt.includes('what happened') ||
      cleanPrompt.includes('last three') ||
      cleanPrompt.includes('chronology')
    ) {
      const recentHearings = caseRecord.hearings.slice(0, 3);
      if (recentHearings.length === 0) {
        answer = `No completed hearing proceedings have been recorded yet for ${caseRecord.caseNumber}. The matter is currently at stage **${caseRecord.proceduralStage.replace(/_/g, ' ')}**.`;
      } else {
        answer = `### Chronological Summary of Recent Hearings for ${caseRecord.caseNumber}:\n\n`;
        recentHearings.forEach((h, idx) => {
          const dStr = new Date(h.hearingDate).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          });
          const procText =
            userRole === UserRole.CLIENT && h.clientSummary
              ? h.clientSummary
              : h.proceedings || h.purpose;

          answer += `**${idx + 1}. Hearing on ${dStr}** (${h.purpose})\n`;
          answer += `* Proceedings: ${procText}\n`;
          if (h.orderPassed) {
            answer += `* Order Passed: ${h.orderPassed}\n`;
          }
          if (h.nextHearingDate) {
            const nextD = new Date(h.nextHearingDate).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            });
            answer += `* Next Date Assigned: **${nextD}** for *${h.nextHearingPurpose || 'Further Proceedings'}*.\n`;
          }
          answer += '\n';

          citations.push({
            id: h.id,
            sourceType: 'HEARING',
            title: `Hearing Record: ${dStr}`,
            date: dStr,
            exactSnippet: (h.proceedings || h.purpose).slice(0, 180),
          });
        });
        suggestedActions.push('Review cause list for upcoming date');
        suggestedActions.push('Confirm advocate appearance attendance');
      }
    }
    // 2. BAIL ORDERS / BAIL QUERY PATTERN
    else if (
      cleanPrompt.includes('bail') ||
      cleanPrompt.includes('surety') ||
      cleanPrompt.includes('custody')
    ) {
      const bailOrders = caseRecord.orders.filter(
        o =>
          o.orderType.toLowerCase().includes('bail') ||
          o.orderSummary.toLowerCase().includes('bail')
      );

      if (bailOrders.length > 0) {
        answer = `### Orders Pertaining to Bail in Case ${caseRecord.caseNumber}:\n\n`;
        bailOrders.forEach(bo => {
          const oDate = new Date(bo.orderDate).toLocaleDateString('en-IN');
          answer += `* **Order dated ${oDate}** (${bo.orderType}): ${bo.orderSummary}\n`;
          citations.push({
            id: bo.id,
            sourceType: 'ORDER',
            title: `Court Order dated ${oDate}`,
            date: oDate,
            exactSnippet: bo.orderSummary,
          });
        });
        suggestedActions.push('Verify compliance conditions with local police station');
        suggestedActions.push('Check surety bond solvency certificate');
      } else {
        answer = `No specific court orders mentioning bail were located for ${caseRecord.caseNumber}. Please verify whether a separate bail application (BA) was registered.`;
      }
    }
    // 3. WITNESS / DEPOSITION / EVIDENCE PATTERN
    else if (
      cleanPrompt.includes('witness') ||
      cleanPrompt.includes('cross-examin') ||
      cleanPrompt.includes('pw-') ||
      cleanPrompt.includes('dw-') ||
      cleanPrompt.includes('evidence')
    ) {
      const witnesses = caseRecord.witnesses;
      if (witnesses.length === 0) {
        answer = `No witnesses have been formally indexed yet in this case. The procedural stage is currently **${caseRecord.proceduralStage}**.`;
      } else {
        answer = `### Witness Examination Index for ${caseRecord.caseNumber}:\n\n`;
        witnesses.forEach(w => {
          answer += `* **${w.witnessNumber}: ${w.name}** (${w.witnessType.replace(/_/g, ' ')})\n`;
          answer += `  - Current Examination Stage: **${w.currentStage.replace(/_/g, ' ')}**\n`;
          if (w.testimonySummary) {
            answer += `  - Summary: ${w.testimonySummary}\n`;
          }
          if (w.depositions.length > 0) {
            w.depositions.forEach(dep => {
              const depD = new Date(dep.depositionDate).toLocaleDateString('en-IN');
              answer += `  - *Deposition on ${depD}*: ${dep.transcriptSummary}\n`;
              if (dep.keyAdmissions) {
                answer += `    - Key Admissions: ${dep.keyAdmissions}\n`;
              }
              citations.push({
                id: dep.id,
                sourceType: 'DEPOSITION',
                title: `Deposition of ${w.witnessNumber} (${w.name}) on ${depD}`,
                date: depD,
                exactSnippet: dep.transcriptSummary.slice(0, 180),
              });
            });
          }
          answer += '\n';
        });
        suggestedActions.push('Prepare cross-examination questions for next witness');
        suggestedActions.push('Inspect contradictions with police statement u/s 161 CrPC');
      }
    }
    // 4. CHECKLIST / PREPARATION PATTERN
    else if (
      cleanPrompt.includes('checklist') ||
      cleanPrompt.includes('prepare') ||
      cleanPrompt.includes('next hearing')
    ) {
      const nextDateStr = caseRecord.nextHearingDate
        ? new Date(caseRecord.nextHearingDate).toLocaleDateString('en-IN')
        : 'Not scheduled';

      answer = `### Next-Hearing Preparation Checklist for ${caseRecord.caseNumber}\n\n`;
      answer += `* **Next Hearing Date**: ${nextDateStr}\n`;
      answer += `* **Listed Purpose**: ${caseRecord.nextHearingPurpose || 'Proceedings'}\n`;
      answer += `* **Current Stage**: ${caseRecord.proceduralStage.replace(/_/g, ' ')}\n\n`;
      answer += `#### Recommended Action Items:\n`;
      answer += `1. **Case Brief & Pleading Copies**: Ensure bench copy and opposite counsel acknowledgment are available.\n`;
      answer += `2. **Document Scrutiny**: Verify all exhibits and admitted documents are paginated in sync with court record.\n`;
      answer += `3. **Client Attendance**: Confirm if personal attendance of the client is mandatory for the listed purpose.\n`;
      answer += `4. **Authority Citations**: Prepare 2 copies of relevant High Court / Supreme Court precedents.\n`;

      suggestedActions.push('Create task for drafting preparation note');
      suggestedActions.push('Send hearing alert to client');
    }
    // 5. DOCUMENT EXTRACTED TEXT SEARCH PATTERN
    else {
      // Search inside digitized document text
      const matchingDocs: {
        docName: string;
        pageNo: number;
        snippet: string;
        confidence: number;
      }[] = [];

      caseRecord.documents.forEach(doc => {
        doc.extractedPages.forEach(p => {
          if (p.extractedText.toLowerCase().includes(cleanPrompt)) {
            const idx = p.extractedText.toLowerCase().indexOf(cleanPrompt);
            const start = Math.max(0, idx - 60);
            const end = Math.min(p.extractedText.length, idx + 120);
            matchingDocs.push({
              docName: doc.displayName,
              pageNo: p.pageNumber,
              snippet: '...' + p.extractedText.substring(start, end).trim() + '...',
              confidence: p.confidence || 90,
            });
          }
        });
      });

      if (matchingDocs.length > 0) {
        answer = `Found **${matchingDocs.length}** source matches across digitized case files for query: *"${prompt}"*.\n\n`;
        matchingDocs.slice(0, 5).forEach((m, i) => {
          answer += `**${i + 1}. ${m.docName} (Page ${m.pageNo})**\n`;
          answer += `> "${m.snippet}"\n\n`;

          citations.push({
            id: `doc-page-${m.pageNo}`,
            sourceType: 'DOCUMENT',
            title: `${m.docName} — Page ${m.pageNo}`,
            pageNumber: m.pageNo,
            exactSnippet: m.snippet,
            confidenceScore: m.confidence,
          });
        });
        suggestedActions.push('Open cited document in viewer');
      } else {
        answer = `I analyzed the recorded case files, hearings, and orders for **${caseRecord.caseNumber}** (${caseRecord.title}).\n\n`;
        answer += `No direct textual matches were found for *"${prompt}"* in current digitized documents. Try querying about recent hearings, witness depositions, bail records, or next-hearing checklist.`;
      }
    }

    // Log AI Query for auditing
    await prisma.aIQueryLog.create({
      data: {
        userId,
        caseId,
        queryPrompt: prompt,
        responseSummary: answer.slice(0, 255),
        citedDocsCount: citations.length,
        disclaimerShown: true,
      },
    });

    return {
      answer,
      citations,
      disclaimer:
        'AI outputs are assistive drafts for professional verification by an advocate and do not substitute for independent legal judgement.',
      suggestedActions,
    };
  }
}

export const aiService = new AIService();
