import { Router } from 'express';
import { z } from 'zod';
import { evidenceService } from '../services/evidence.service';
import { authenticate } from '../middleware/auth';
import { authorizeCaseAccess, authorizeRoles } from '../middleware/rbac';
import { WitnessType, ExaminationStage, BailType, BailStatus, UserRole } from '@prisma/client';

const router = Router({ mergeParams: true });

// ---------------- WITNESSES ----------------
router.get('/witnesses', authenticate, authorizeCaseAccess('caseId'), async (req, res, next) => {
  try {
    const list = await evidenceService.getWitnesses(req.params.caseId);
    res.json({ success: true, data: list });
  } catch (error) {
    next(error);
  }
});

router.post(
  '/witnesses',
  authenticate,
  authorizeCaseAccess('caseId'),
  authorizeRoles(UserRole.ADVOCATE, UserRole.ASSOCIATE_ADVOCATE),
  async (req, res, next) => {
    try {
      const schema = z.object({
        witnessNumber: z.string().min(1),
        name: z.string().min(1),
        witnessType: z.nativeEnum(WitnessType).optional(),
        currentStage: z.nativeEnum(ExaminationStage).optional(),
        testimonySummary: z.string().optional(),
        mobile: z.string().optional(),
        address: z.string().optional(),
        remarks: z.string().optional(),
      });
      const data = schema.parse(req.body);

      const witness = await evidenceService.addWitness({
        caseId: req.params.caseId,
        ...data,
      });

      res.status(201).json({ success: true, data: witness });
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  '/witnesses/:witnessId/depositions',
  authenticate,
  authorizeCaseAccess('caseId'),
  authorizeRoles(UserRole.ADVOCATE, UserRole.ASSOCIATE_ADVOCATE),
  async (req, res, next) => {
    try {
      const schema = z.object({
        examinationType: z.nativeEnum(ExaminationStage),
        depositionDate: z.string(),
        transcriptSummary: z.string().min(3),
        keyAdmissions: z.string().optional(),
        contradictions: z.string().optional(),
      });
      const data = schema.parse(req.body);

      const dep = await evidenceService.recordDeposition({
        witnessId: req.params.witnessId,
        examinationType: data.examinationType,
        depositionDate: new Date(data.depositionDate),
        transcriptSummary: data.transcriptSummary,
        keyAdmissions: data.keyAdmissions,
        contradictions: data.contradictions,
      });

      res.status(201).json({ success: true, data: dep });
    } catch (error) {
      next(error);
    }
  }
);

// ---------------- EXHIBITS ----------------
router.get('/exhibits', authenticate, authorizeCaseAccess('caseId'), async (req, res, next) => {
  try {
    const list = await evidenceService.getExhibits(req.params.caseId);
    res.json({ success: true, data: list });
  } catch (error) {
    next(error);
  }
});

router.post(
  '/exhibits',
  authenticate,
  authorizeCaseAccess('caseId'),
  authorizeRoles(UserRole.ADVOCATE, UserRole.ASSOCIATE_ADVOCATE),
  async (req, res, next) => {
    try {
      const schema = z.object({
        documentId: z.string().uuid().optional(),
        exhibitNumber: z.string().min(1),
        description: z.string().min(1),
        markedBy: z.string().min(1),
        markingDate: z.string().optional(),
        objectionRaised: z.boolean().default(false),
        objectionDetails: z.string().optional(),
        custodyDetails: z.string().optional(),
      });
      const data = schema.parse(req.body);

      const exh = await evidenceService.addExhibit({
        caseId: req.params.caseId,
        ...data,
        markingDate: data.markingDate ? new Date(data.markingDate) : undefined,
      });

      res.status(201).json({ success: true, data: exh });
    } catch (error) {
      next(error);
    }
  }
);

// ---------------- BAIL & COMPLIANCE ----------------
router.get('/bail', authenticate, authorizeCaseAccess('caseId'), async (req, res, next) => {
  try {
    const list = await evidenceService.getBailRecords(req.params.caseId);
    res.json({ success: true, data: list });
  } catch (error) {
    next(error);
  }
});

router.post(
  '/bail',
  authenticate,
  authorizeCaseAccess('caseId'),
  authorizeRoles(UserRole.ADVOCATE, UserRole.ASSOCIATE_ADVOCATE),
  async (req, res, next) => {
    try {
      const schema = z.object({
        accusedName: z.string().min(1),
        bailType: z.nativeEnum(BailType),
        status: z.nativeEnum(BailStatus).optional(),
        applicationDate: z.string(),
        orderDate: z.string().optional(),
        bailConditions: z.string().optional(),
        suretyAmount: z.number().optional(),
        sureties: z
          .array(
            z.object({
              suretyName: z.string().min(1),
              relationship: z.string().optional(),
              idProofType: z.string().optional(),
              idProofNumber: z.string().optional(),
              bondAmount: z.number().min(0),
              solvencyStatus: z.string().optional(),
            })
          )
          .optional(),
        conditions: z
          .array(
            z.object({
              conditionText: z.string().min(1),
              frequency: z.string().optional(),
              nextDueDate: z.string().optional(),
            })
          )
          .optional(),
      });
      const data = schema.parse(req.body);

      const bail = await evidenceService.addBailRecord({
        caseId: req.params.caseId,
        ...data,
        applicationDate: new Date(data.applicationDate),
        orderDate: data.orderDate ? new Date(data.orderDate) : undefined,
        conditions: data.conditions?.map(c => ({
          ...c,
          nextDueDate: c.nextDueDate ? new Date(c.nextDueDate) : undefined,
        })),
      });

      res.status(201).json({ success: true, data: bail });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
