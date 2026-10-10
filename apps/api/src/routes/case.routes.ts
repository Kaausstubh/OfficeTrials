import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db/prisma';
import { caseService } from '../services/case.service';
import { authenticate } from '../middleware/auth';
import { authorizeRoles, authorizeCaseAccess } from '../middleware/rbac';
import { logAuditEvent } from '../middleware/audit';
import { UserRole, CaseType, ProceduralStage, CasePriority, PartyType, CaseStatus, DocumentVisibility } from '@prisma/client';

const router = Router();

const createCaseSchema = z.object({
  internalCaseNo: z.string().min(2),
  cnrNumber: z.string().optional(),
  caseType: z.nativeEnum(CaseType),
  caseNumber: z.string().min(1),
  registrationYear: z.number().int().min(1950).max(2100),
  courtId: z.string().uuid(),
  courtEstablishment: z.string().optional(),
  judgeDesignation: z.string().optional(),
  filingDate: z.string().optional(),
  registrationDate: z.string().optional(),
  proceduralStage: z.nativeEnum(ProceduralStage).optional(),
  title: z.string().min(3),
  description: z.string().optional(),
  statutoryActs: z.string().optional(),
  statutorySections: z.string().optional(),
  policeStation: z.string().optional(),
  firNumber: z.string().optional(),
  firYear: z.number().int().optional(),
  nextHearingDate: z.string().optional(),
  nextHearingPurpose: z.string().optional(),
  priority: z.nativeEnum(CasePriority).optional(),
  privateNotes: z.string().optional(),
  clientGuidanceNotes: z.string().optional(),
  parties: z
    .array(
      z.object({
        partyType: z.nativeEnum(PartyType),
        name: z.string().min(1),
        isOurClient: z.boolean().default(false),
        phone: z.string().optional(),
        email: z.string().optional(),
        advocateName: z.string().optional(),
      })
    )
    .optional(),
});

// List cases
router.get('/', authenticate, async (req, res, next) => {
  try {
    const { status, caseType, stage, priority, search } = req.query;

    const cases = await caseService.getCases({
      status: status as any,
      caseType: caseType as any,
      stage: stage as any,
      priority: priority as any,
      search: search as string,
      userId: req.user?.id,
      userRole: req.user?.role,
    });

    res.json({
      success: true,
      data: cases,
    });
  } catch (error) {
    next(error);
  }
});

// List Courts repository
router.get('/courts/list', authenticate, async (req, res, next) => {
  try {
    const courts = await prisma.court.findMany({
      orderBy: [{ state: 'asc' }, { name: 'asc' }],
    });
    res.json({ success: true, data: courts });
  } catch (error) {
    next(error);
  }
});

// List all documents across chamber cases
router.get('/documents/all', authenticate, async (req, res, next) => {
  try {
    const isClient = req.user?.role === UserRole.CLIENT;
    const documents = await prisma.caseDocument.findMany({
      where: {
        isDeleted: false,
        ...(isClient ? { visibility: DocumentVisibility.CLIENT_VISIBLE } : {}),
      },
      include: {
        category: true,
        case: {
          select: {
            id: true,
            caseNumber: true,
            title: true,
            cnrNumber: true,
            court: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: documents });
  } catch (error) {
    next(error);
  }
});

// Create case
router.post(
  '/',
  authenticate,
  authorizeRoles(UserRole.ADVOCATE, UserRole.ASSOCIATE_ADVOCATE, UserRole.ADMINISTRATOR),
  async (req, res, next) => {
    try {
      const data = createCaseSchema.parse(req.body);

      const newCase = await caseService.createCase({
        ...data,
        filingDate: data.filingDate ? new Date(data.filingDate) : undefined,
        registrationDate: data.registrationDate ? new Date(data.registrationDate) : undefined,
        nextHearingDate: data.nextHearingDate ? new Date(data.nextHearingDate) : undefined,
        createdById: req.user!.id,
      });

      await logAuditEvent(req, 'CASE_CREATE', 'Case', newCase.id, {
        caseNumber: newCase.caseNumber,
        internalCaseNo: newCase.internalCaseNo,
      });

      res.status(201).json({
        success: true,
        data: newCase,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Get case detail
router.get('/:caseId', authenticate, authorizeCaseAccess('caseId'), async (req, res, next) => {
  try {
    const caseRecord = await caseService.getCaseById(req.params.caseId, req.user?.role);
    if (!caseRecord) {
      res.status(404).json({ success: false, message: 'Case not found' });
      return;
    }

    res.json({
      success: true,
      data: caseRecord,
    });
  } catch (error) {
    next(error);
  }
});

// Update case details
router.patch(
  '/:caseId',
  authenticate,
  authorizeCaseAccess('caseId'),
  authorizeRoles(UserRole.ADVOCATE, UserRole.ASSOCIATE_ADVOCATE, UserRole.ADMINISTRATOR),
  async (req, res, next) => {
    try {
      const updateSchema = z.object({
        title: z.string().min(2).optional(),
        description: z.string().optional(),
        caseNumber: z.string().optional(),
        internalCaseNo: z.string().optional(),
        cnrNumber: z.string().optional(),
        proceduralStage: z.nativeEnum(ProceduralStage).optional(),
        judgeDesignation: z.string().optional(),
        courtEstablishment: z.string().optional(),
        statutoryActs: z.string().optional(),
        statutorySections: z.string().optional(),
        policeStation: z.string().optional(),
        firNumber: z.string().optional(),
        firYear: z.number().int().optional(),
        nextHearingDate: z.string().nullable().optional(),
        nextHearingPurpose: z.string().optional(),
        priority: z.nativeEnum(CasePriority).optional(),
        privateNotes: z.string().optional(),
        clientGuidanceNotes: z.string().optional(),
        status: z.nativeEnum(CaseStatus).optional(),
      });

      const parsed = updateSchema.parse(req.body);
      const updateData: any = { ...parsed };
      if (parsed.nextHearingDate !== undefined) {
        updateData.nextHearingDate = parsed.nextHearingDate ? new Date(parsed.nextHearingDate as string) : null;
      }

      const updated = await caseService.updateCase(req.params.caseId, updateData, req.user!.id);

      await logAuditEvent(req, 'CASE_UPDATE', 'Case', req.params.caseId, {
        updatedFields: Object.keys(parsed),
      });

      res.json({ success: true, data: updated });
    } catch (error) {
      next(error);
    }
  }
);

// Update procedural stage
router.patch(
  '/:caseId/stage',
  authenticate,
  authorizeCaseAccess('caseId'),
  authorizeRoles(UserRole.ADVOCATE, UserRole.ASSOCIATE_ADVOCATE),
  async (req, res, next) => {
    try {
      const schema = z.object({
        stage: z.nativeEnum(ProceduralStage),
        remarks: z.string().default('Stage updated by advocate'),
      });
      const data = schema.parse(req.body);

      const updated = await caseService.updateStage(
        req.params.caseId,
        data.stage,
        data.remarks,
        req.user!.id
      );

      await logAuditEvent(req, 'CASE_STAGE_CHANGE', 'Case', req.params.caseId, {
        newStage: data.stage,
      });

      res.json({ success: true, data: updated });
    } catch (error) {
      next(error);
    }
  }
);

// Add Party
router.post(
  '/:caseId/parties',
  authenticate,
  authorizeCaseAccess('caseId'),
  authorizeRoles(UserRole.ADVOCATE, UserRole.ASSOCIATE_ADVOCATE),
  async (req, res, next) => {
    try {
      const schema = z.object({
        partyType: z.nativeEnum(PartyType),
        name: z.string().min(1),
        isOurClient: z.boolean().default(false),
        phone: z.string().optional(),
        email: z.string().optional(),
        advocateName: z.string().optional(),
        remarks: z.string().optional(),
      });
      const data = schema.parse(req.body);

      const party = await prisma.caseParty.create({
        data: {
          caseId: req.params.caseId,
          ...data,
        },
      });

      res.status(201).json({ success: true, data: party });
    } catch (error) {
      next(error);
    }
  }
);

// Link Connected Case
router.post(
  '/:caseId/connect',
  authenticate,
  authorizeCaseAccess('caseId'),
  authorizeRoles(UserRole.ADVOCATE, UserRole.ASSOCIATE_ADVOCATE),
  async (req, res, next) => {
    try {
      const schema = z.object({
        targetCaseId: z.string().uuid(),
        relationType: z.string().min(2),
        notes: z.string().optional(),
      });
      const data = schema.parse(req.body);

      const connected = await prisma.connectedCase.create({
        data: {
          sourceCaseId: req.params.caseId,
          targetCaseId: data.targetCaseId,
          relationType: data.relationType,
          notes: data.notes,
        },
      });

      res.status(201).json({ success: true, data: connected });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
