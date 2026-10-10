import { prisma } from '../db/prisma';
import {
  CaseType,
  ProceduralStage,
  CaseStatus,
  CasePriority,
  CaseHealth,
  DateVerificationStatus,
  Prisma,
} from '@prisma/client';

export class CaseService {
  async getCases(filters: {
    status?: CaseStatus;
    caseType?: CaseType;
    stage?: ProceduralStage;
    priority?: CasePriority;
    search?: string;
    userId?: string;
    userRole?: string;
  }) {
    const where: Prisma.CaseWhereInput = {
      isArchived: false,
    };

    if (filters.status) where.status = filters.status;
    if (filters.caseType) where.caseType = filters.caseType;
    if (filters.stage) where.proceduralStage = filters.stage;
    if (filters.priority) where.priority = filters.priority;

    if (filters.search) {
      where.OR = [
        { internalCaseNo: { contains: filters.search, mode: 'insensitive' } },
        { cnrNumber: { contains: filters.search, mode: 'insensitive' } },
        { caseNumber: { contains: filters.search, mode: 'insensitive' } },
        { title: { contains: filters.search, mode: 'insensitive' } },
        { parties: { some: { name: { contains: filters.search, mode: 'insensitive' } } } },
      ];
    }

    // Role-specific scoping: if client, only return their linked cases
    if (filters.userRole === 'CLIENT' && filters.userId) {
      const user = await prisma.user.findUnique({
        where: { id: filters.userId },
        select: { email: true },
      });
      where.OR = [
        { parties: { some: { isOurClient: true, email: user?.email } } },
        { assignments: { some: { userId: filters.userId } } },
      ];
    }

    return await prisma.case.findMany({
      where,
      include: {
        court: true,
        parties: true,
        assignments: {
          include: {
            user: {
              select: { id: true, fullName: true, role: true, email: true },
            },
          },
        },
        witnesses: { include: { depositions: true } },
        exhibits: true,
        bailRecords: { include: { sureties: true, conditions: true } },
        documents: {
          where: { isDeleted: false },
          include: { category: true },
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: {
            hearings: true,
            documents: true,
            tasks: true,
            efilingRecords: true,
          },
        },
      },
      orderBy: [{ priority: 'desc' }, { nextHearingDate: 'asc' }],
    });
  }

  async getCaseById(caseId: string, userRole?: string) {
    const caseRecord = await prisma.case.findUnique({
      where: { id: caseId },
      include: {
        court: true,
        parties: true,
        assignments: {
          include: {
            user: { select: { id: true, fullName: true, role: true, email: true } },
          },
        },
        stageHistory: { orderBy: { changedAt: 'desc' } },
        hearings: {
          orderBy: { hearingDate: 'desc' },
          include: {
            attendances: { include: { user: { select: { fullName: true } } } },
            orders: true,
          },
        },
        documents: {
          where: userRole === 'CLIENT' ? { visibility: 'CLIENT_VISIBLE', isDeleted: false } : { isDeleted: false },
          include: { category: true, tags: true },
          orderBy: { createdAt: 'desc' },
        },
        orders: {
          where: userRole === 'CLIENT' ? { isSharedWithClient: true } : {},
          orderBy: { orderDate: 'desc' },
        },
        witnesses: { include: { depositions: true } },
        exhibits: true,
        bailRecords: { include: { sureties: true, conditions: true } },
        efilingRecords: {
          include: { documents: { include: { document: true } }, statusHistory: true },
          orderBy: { createdAt: 'desc' },
        },
        tasks: {
          include: { assignedTo: { select: { id: true, fullName: true } } },
          orderBy: { dueDate: 'asc' },
        },
        documentRequests: { orderBy: { createdAt: 'desc' } },
        connectedSource: { include: { targetCase: { include: { court: true } } } },
        connectedTarget: { include: { sourceCase: { include: { court: true } } } },
        syncHistory: { orderBy: { retrievalDate: 'desc' }, take: 5 },
      },
    });

    if (!caseRecord) return null;

    // Strict confidentiality redaction for clients
    if (userRole === 'CLIENT') {
      const redacted = { ...caseRecord };
      delete (redacted as any).privateNotes;
      redacted.hearings = redacted.hearings.map(h => {
        const hCopy = { ...h };
        delete (hCopy as any).privateNotes;
        return hCopy;
      });
      return redacted;
    }

    return caseRecord;
  }

  async createCase(data: {
    internalCaseNo: string;
    cnrNumber?: string;
    caseType: CaseType;
    caseNumber: string;
    registrationYear: number;
    courtId: string;
    courtEstablishment?: string;
    judgeDesignation?: string;
    filingDate?: Date;
    registrationDate?: Date;
    proceduralStage?: ProceduralStage;
    title: string;
    description?: string;
    statutoryActs?: string;
    statutorySections?: string;
    policeStation?: string;
    firNumber?: string;
    firYear?: number;
    nextHearingDate?: Date;
    nextHearingPurpose?: string;
    priority?: CasePriority;
    privateNotes?: string;
    clientGuidanceNotes?: string;
    createdById: string;
    parties?: {
      partyType: any;
      name: string;
      isOurClient: boolean;
      phone?: string;
      email?: string;
      advocateName?: string;
    }[];
  }) {
    const { parties, ...caseData } = data;

    return await prisma.$transaction(async tx => {
      const createdCase = await tx.case.create({
        data: {
          ...caseData,
          proceduralStage: data.proceduralStage || ProceduralStage.PRE_FILING_CONSULTATION,
          status: CaseStatus.PENDING,
          priority: data.priority || CasePriority.MEDIUM,
          dateVerification: data.cnrNumber
            ? DateVerificationStatus.OFFICIAL_VERIFIED
            : DateVerificationStatus.MANUALLY_ENTERED,
        },
      });

      // Add stage history entry
      await tx.caseStageHistory.create({
        data: {
          caseId: createdCase.id,
          stage: createdCase.proceduralStage,
          remarks: 'Case registered in Advocate Case Desk',
          recordedBy: data.createdById,
        },
      });

      // Add assigned creator
      await tx.caseAssignment.create({
        data: {
          caseId: createdCase.id,
          userId: data.createdById,
          roleInCase: 'Lead Counsel',
          canEdit: true,
          canViewNotes: true,
        },
      });

      // Add parties if provided
      if (parties && parties.length > 0) {
        for (const party of parties) {
          await tx.caseParty.create({
            data: {
              caseId: createdCase.id,
              ...party,
            },
          });
        }
      }

      return createdCase;
    });
  }

  async updateStage(
    caseId: string,
    newStage: ProceduralStage,
    remarks: string,
    userId: string
  ) {
    return await prisma.$transaction(async tx => {
      const updatedCase = await tx.case.update({
        where: { id: caseId },
        data: { proceduralStage: newStage },
      });

      await tx.caseStageHistory.create({
        data: {
          caseId,
          stage: newStage,
          remarks,
          recordedBy: userId,
        },
      });

      return updatedCase;
    });
  }

  async updateCase(
    caseId: string,
    data: {
      title?: string;
      description?: string;
      caseNumber?: string;
      internalCaseNo?: string;
      cnrNumber?: string;
      proceduralStage?: ProceduralStage;
      judgeDesignation?: string;
      courtEstablishment?: string;
      statutoryActs?: string;
      statutorySections?: string;
      policeStation?: string;
      firNumber?: string;
      firYear?: number;
      nextHearingDate?: Date;
      nextHearingPurpose?: string;
      priority?: CasePriority;
      privateNotes?: string;
      clientGuidanceNotes?: string;
      status?: CaseStatus;
    },
    userId: string
  ) {
    return await prisma.$transaction(async tx => {
      const existing = await tx.case.findUnique({ where: { id: caseId } });
      if (!existing) throw new Error('Case not found');

      const updated = await tx.case.update({
        where: { id: caseId },
        data: {
          ...data,
          dateVerification: data.nextHearingDate
            ? DateVerificationStatus.OFFICIAL_VERIFIED
            : existing.dateVerification,
        },
      });

      if (data.proceduralStage && data.proceduralStage !== existing.proceduralStage) {
        await tx.caseStageHistory.create({
          data: {
            caseId,
            stage: data.proceduralStage,
            remarks: 'Stage updated via Case Details Editor',
            recordedBy: userId,
          },
        });
      }

      return updated;
    });
  }

  async calculateCaseHealth(caseId: string): Promise<CaseHealth> {
    const now = new Date();
    const caseRecord = await prisma.case.findUnique({
      where: { id: caseId },
      include: {
        tasks: { where: { status: { not: 'COMPLETED' } } },
        efilingRecords: { where: { currentStatus: 'DEFECTS_RAISED' } },
      },
    });

    if (!caseRecord) return CaseHealth.GOOD;

    // Check overdue tasks
    const hasOverdueTasks = caseRecord.tasks.some(t => new Date(t.dueDate) < now);
    const hasPendingDefects = caseRecord.efilingRecords.length > 0;

    if (hasOverdueTasks || hasPendingDefects) {
      return CaseHealth.CRITICAL_OVERDUE;
    }

    // Check if hearing is within 48 hours without preparation task completed
    if (caseRecord.nextHearingDate) {
      const diffHours =
        (new Date(caseRecord.nextHearingDate).getTime() - now.getTime()) / (1000 * 3600);
      if (diffHours >= 0 && diffHours <= 48 && caseRecord.tasks.length > 0) {
        return CaseHealth.ATTENTION_NEEDED;
      }
    }

    return CaseHealth.GOOD;
  }
}

export const caseService = new CaseService();
