import { prisma } from '../db/prisma';
import { WitnessType, ExaminationStage, BailType, BailStatus } from '@prisma/client';

export class EvidenceService {
  // ---------------- WITNESSES ----------------
  async getWitnesses(caseId: string) {
    return await prisma.witness.findMany({
      where: { caseId },
      include: {
        depositions: {
          orderBy: { depositionDate: 'desc' },
        },
      },
      orderBy: { witnessNumber: 'asc' },
    });
  }

  async addWitness(data: {
    caseId: string;
    witnessNumber: string;
    name: string;
    witnessType?: WitnessType;
    currentStage?: ExaminationStage;
    testimonySummary?: string;
    mobile?: string;
    address?: string;
    remarks?: string;
  }) {
    return await prisma.witness.create({
      data: {
        caseId: data.caseId,
        witnessNumber: data.witnessNumber,
        name: data.name,
        witnessType: data.witnessType || WitnessType.PROSECUTION_WITNESS,
        currentStage: data.currentStage || ExaminationStage.NOT_EXAMINED,
        testimonySummary: data.testimonySummary,
        mobile: data.mobile,
        address: data.address,
        remarks: data.remarks,
      },
    });
  }

  async recordDeposition(data: {
    witnessId: string;
    examinationType: ExaminationStage;
    depositionDate: Date;
    transcriptSummary: string;
    keyAdmissions?: string;
    contradictions?: string;
  }) {
    return await prisma.$transaction(async tx => {
      const dep = await tx.deposition.create({
        data: {
          witnessId: data.witnessId,
          examinationType: data.examinationType,
          depositionDate: data.depositionDate,
          transcriptSummary: data.transcriptSummary,
          keyAdmissions: data.keyAdmissions,
          contradictions: data.contradictions,
        },
      });

      // Update current stage on witness
      await tx.witness.update({
        where: { id: data.witnessId },
        data: {
          currentStage: data.examinationType,
        },
      });

      return dep;
    });
  }

  // ---------------- EXHIBITS ----------------
  async getExhibits(caseId: string) {
    return await prisma.exhibit.findMany({
      where: { caseId },
      include: {
        document: {
          select: { id: true, displayName: true, originalFilename: true, fileType: true },
        },
      },
      orderBy: { exhibitNumber: 'asc' },
    });
  }

  async addExhibit(data: {
    caseId: string;
    documentId?: string;
    exhibitNumber: string;
    description: string;
    markedBy: string;
    markingDate?: Date;
    objectionRaised?: boolean;
    objectionDetails?: string;
    custodyDetails?: string;
  }) {
    return await prisma.exhibit.create({
      data: {
        caseId: data.caseId,
        documentId: data.documentId || null,
        exhibitNumber: data.exhibitNumber,
        description: data.description,
        markedBy: data.markedBy,
        markingDate: data.markingDate || new Date(),
        objectionRaised: data.objectionRaised || false,
        objectionDetails: data.objectionDetails,
        custodyDetails: data.custodyDetails,
      },
    });
  }

  // ---------------- BAIL & COMPLIANCE ----------------
  async getBailRecords(caseId: string) {
    return await prisma.bailRecord.findMany({
      where: { caseId },
      include: {
        sureties: true,
        conditions: true,
      },
      orderBy: { applicationDate: 'desc' },
    });
  }

  async addBailRecord(data: {
    caseId: string;
    accusedName: string;
    bailType: BailType;
    status?: BailStatus;
    applicationDate: Date;
    orderDate?: Date;
    bailConditions?: string;
    suretyCount?: number;
    suretyAmount?: number;
    sureties?: {
      suretyName: string;
      relationship?: string;
      idProofType?: string;
      idProofNumber?: string;
      propertyDetails?: string;
      bondAmount: number;
      solvencyStatus?: string;
    }[];
    conditions?: {
      conditionText: string;
      frequency?: string;
      nextDueDate?: Date;
    }[];
  }) {
    return await prisma.$transaction(async tx => {
      const bail = await tx.bailRecord.create({
        data: {
          caseId: data.caseId,
          accusedName: data.accusedName,
          bailType: data.bailType,
          status: data.status || BailStatus.PENDING,
          applicationDate: data.applicationDate,
          orderDate: data.orderDate,
          bailConditions: data.bailConditions,
          suretyCount: data.suretyCount || (data.sureties ? data.sureties.length : 0),
          suretyAmount: data.suretyAmount,
        },
      });

      if (data.sureties && data.sureties.length > 0) {
        for (const s of data.sureties) {
          await tx.suretyRecord.create({
            data: {
              bailRecordId: bail.id,
              suretyName: s.suretyName,
              relationship: s.relationship,
              idProofType: s.idProofType,
              idProofNumber: s.idProofNumber,
              propertyDetails: s.propertyDetails,
              bondAmount: s.bondAmount,
              solvencyStatus: s.solvencyStatus || 'Solvent',
            },
          });
        }
      }

      if (data.conditions && data.conditions.length > 0) {
        for (const c of data.conditions) {
          await tx.complianceCondition.create({
            data: {
              bailRecordId: bail.id,
              conditionText: c.conditionText,
              frequency: c.frequency,
              nextDueDate: c.nextDueDate,
            },
          });
        }
      }

      return bail;
    });
  }
}

export const evidenceService = new EvidenceService();
