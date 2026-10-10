import { prisma } from '../db/prisma';
import { EfilingStatus } from '@prisma/client';

export interface TechnicalValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  details: {
    documentCount: number;
    totalSizeBytes: number;
    totalSizeMB: number;
    hasVakalatnama: boolean;
    allPdfs: boolean;
  };
}

export class EfilingService {
  /**
   * Run technical pre-filing checks according to High Court / District Court rules
   */
  async validateFilingPackage(documentIds: string[]): Promise<TechnicalValidationResult> {
    const docs = await prisma.caseDocument.findMany({
      where: { id: { in: documentIds } },
      include: { category: true },
    });

    const errors: string[] = [];
    const warnings: string[] = [];

    if (docs.length === 0) {
      errors.push('No documents selected for the filing package.');
    }

    const totalSizeBytes = docs.reduce((acc, d) => acc + d.fileSize, 0);
    const totalSizeMB = Number((totalSizeBytes / (1024 * 1024)).toFixed(2));

    const MAX_SIZE_MB = 25; // 25MB standard court portal limit
    if (totalSizeMB > MAX_SIZE_MB) {
      errors.push(`Total package size (${totalSizeMB} MB) exceeds maximum portal limit of ${MAX_SIZE_MB} MB.`);
    }

    const allPdfs = docs.every(d => d.fileType === 'application/pdf');
    if (!allPdfs) {
      errors.push('All filing documents must be in PDF format before submission.');
    }

    const hasVakalatnama = docs.some(
      d =>
        d.category.code === 'VAKALATNAMA' ||
        d.displayName.toLowerCase().includes('vakalatnama')
    );
    if (!hasVakalatnama) {
      warnings.push('No Vakalatnama or Memo of Appearance detected in this filing package.');
    }

    const unverifiedOcr = docs.some(d => d.ocrStatus === 'PENDING');
    if (unverifiedOcr) {
      warnings.push('Some documents are still undergoing OCR processing.');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      details: {
        documentCount: docs.length,
        totalSizeBytes,
        totalSizeMB,
        hasVakalatnama,
        allPdfs,
      },
    };
  }

  /**
   * Create an e-filing record
   */
  async createEfilingRecord(data: {
    caseId: string;
    filingType: string;
    filingTitle: string;
    portalName: string;
    portalUrl?: string;
    diaryNumber?: string;
    filingNumber?: string;
    acknowledgementNumber?: string;
    documentIds: string[];
    notes?: string;
    createdById: string;
  }) {
    return await prisma.$transaction(async tx => {
      const record = await tx.efilingRecord.create({
        data: {
          caseId: data.caseId,
          filingType: data.filingType,
          filingTitle: data.filingTitle,
          portalName: data.portalName,
          portalUrl: data.portalUrl || 'https://efiling.ecourts.gov.in',
          diaryNumber: data.diaryNumber,
          filingNumber: data.filingNumber,
          acknowledgementNumber: data.acknowledgementNumber,
          currentStatus: EfilingStatus.SAVED_IN_CASE_FILE,
          notes: data.notes,
          createdById: data.createdById,
        },
      });

      // Link selected documents
      if (data.documentIds && data.documentIds.length > 0) {
        for (let i = 0; i < data.documentIds.length; i++) {
          await tx.efilingDocument.create({
            data: {
              efilingRecordId: record.id,
              documentId: data.documentIds[i],
              sequenceOrder: i + 1,
            },
          });
        }
      }

      // Record initial status in history
      await tx.efilingStatusHistory.create({
        data: {
          efilingRecordId: record.id,
          previousStatus: null,
          newStatus: EfilingStatus.SAVED_IN_CASE_FILE,
          changeNote: 'Filing record initialized in case desk.',
          changedBy: data.createdById,
        },
      });

      return record;
    });
  }

  /**
   * Update e-filing status lifecycle
   */
  async updateStatus(data: {
    recordId: string;
    newStatus: EfilingStatus;
    changeNote?: string;
    diaryNumber?: string;
    filingNumber?: string;
    acknowledgementNumber?: string;
    defectDetails?: string;
    defectDeadline?: Date;
    receiptDocumentId?: string;
    userId: string;
  }) {
    return await prisma.$transaction(async tx => {
      const current = await tx.efilingRecord.findUnique({
        where: { id: data.recordId },
      });

      if (!current) {
        throw new Error('E-filing record not found.');
      }

      const updatePayload: any = {
        currentStatus: data.newStatus,
      };

      if (data.diaryNumber) updatePayload.diaryNumber = data.diaryNumber;
      if (data.filingNumber) updatePayload.filingNumber = data.filingNumber;
      if (data.acknowledgementNumber)
        updatePayload.acknowledgementNumber = data.acknowledgementNumber;
      if (data.defectDetails) updatePayload.defectDetails = data.defectDetails;
      if (data.defectDeadline) updatePayload.defectDeadline = data.defectDeadline;

      if (data.newStatus === EfilingStatus.SUBMITTED_TO_PORTAL) {
        updatePayload.submissionDate = new Date();
      } else if (data.newStatus === EfilingStatus.RESUBMISSION_REQUIRED) {
        updatePayload.resubmissionDate = new Date();
      } else if (data.newStatus === EfilingStatus.ACCEPTED_REGISTERED) {
        updatePayload.acceptanceDate = new Date();
      }

      const updated = await tx.efilingRecord.update({
        where: { id: data.recordId },
        data: updatePayload,
      });

      // Link receipt document if provided
      if (data.receiptDocumentId) {
        await tx.efilingDocument.upsert({
          where: {
            efilingRecordId_documentId: {
              efilingRecordId: data.recordId,
              documentId: data.receiptDocumentId,
            },
          },
          create: {
            efilingRecordId: data.recordId,
            documentId: data.receiptDocumentId,
            isReceipt: true,
          },
          update: {
            isReceipt: true,
          },
        });
      }

      // Record in audit status history
      await tx.efilingStatusHistory.create({
        data: {
          efilingRecordId: data.recordId,
          previousStatus: current.currentStatus,
          newStatus: data.newStatus,
          changeNote: data.changeNote || `Status transitioned to ${data.newStatus}`,
          changedBy: data.userId,
        },
      });

      return updated;
    });
  }
}

export const efilingService = new EfilingService();
