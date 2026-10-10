import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db/prisma';
import { efilingService } from '../services/efiling.service';
import { authenticate } from '../middleware/auth';
import { authorizeCaseAccess, authorizeRoles } from '../middleware/rbac';
import { logAuditEvent } from '../middleware/audit';
import { EfilingStatus, UserRole } from '@prisma/client';

const router = Router({ mergeParams: true });

const createFilingSchema = z.object({
  filingType: z.string().min(2),
  filingTitle: z.string().min(3),
  portalName: z.string().min(2),
  portalUrl: z.string().url().optional(),
  diaryNumber: z.string().optional(),
  filingNumber: z.string().optional(),
  acknowledgementNumber: z.string().optional(),
  documentIds: z.array(z.string().uuid()),
  notes: z.string().optional(),
});

const updateStatusSchema = z.object({
  newStatus: z.nativeEnum(EfilingStatus),
  changeNote: z.string().optional(),
  diaryNumber: z.string().optional(),
  filingNumber: z.string().optional(),
  acknowledgementNumber: z.string().optional(),
  defectDetails: z.string().optional(),
  defectDeadline: z.string().optional(),
  receiptDocumentId: z.string().uuid().optional(),
});

// List e-filings for a case
router.get('/', authenticate, authorizeCaseAccess('caseId'), async (req, res, next) => {
  try {
    const records = await prisma.efilingRecord.findMany({
      where: { caseId: req.params.caseId },
      include: {
        documents: {
          include: {
            document: {
              select: {
                id: true,
                displayName: true,
                originalFilename: true,
                fileType: true,
                fileSize: true,
              },
            },
          },
        },
        statusHistory: {
          orderBy: { changedAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: records });
  } catch (error) {
    next(error);
  }
});

// Pre-filing technical validation
router.post(
  '/validate',
  authenticate,
  authorizeCaseAccess('caseId'),
  async (req, res, next) => {
    try {
      const { documentIds } = req.body;
      if (!Array.isArray(documentIds)) {
        res.status(400).json({ success: false, message: 'documentIds array required.' });
        return;
      }

      const result = await efilingService.validateFilingPackage(documentIds);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
);

// Create new e-filing record
router.post(
  '/',
  authenticate,
  authorizeCaseAccess('caseId'),
  authorizeRoles(UserRole.ADVOCATE, UserRole.ASSOCIATE_ADVOCATE),
  async (req, res, next) => {
    try {
      const data = createFilingSchema.parse(req.body);

      const record = await efilingService.createEfilingRecord({
        caseId: req.params.caseId,
        ...data,
        createdById: req.user!.id,
      });

      await logAuditEvent(req, 'EFILING_CREATED', 'EfilingRecord', record.id, {
        filingTitle: record.filingTitle,
      });

      res.status(201).json({ success: true, data: record });
    } catch (error) {
      next(error);
    }
  }
);

// Update filing status lifecycle
router.patch(
  '/:recordId/status',
  authenticate,
  authorizeCaseAccess('caseId'),
  authorizeRoles(UserRole.ADVOCATE, UserRole.ASSOCIATE_ADVOCATE),
  async (req, res, next) => {
    try {
      const data = updateStatusSchema.parse(req.body);

      const updated = await efilingService.updateStatus({
        recordId: req.params.recordId,
        newStatus: data.newStatus,
        changeNote: data.changeNote,
        diaryNumber: data.diaryNumber,
        filingNumber: data.filingNumber,
        acknowledgementNumber: data.acknowledgementNumber,
        defectDetails: data.defectDetails,
        defectDeadline: data.defectDeadline ? new Date(data.defectDeadline) : undefined,
        receiptDocumentId: data.receiptDocumentId,
        userId: req.user!.id,
      });

      await logAuditEvent(req, 'EFILING_STATUS_CHANGED', 'EfilingRecord', updated.id, {
        status: updated.currentStatus,
      });

      res.json({ success: true, data: updated });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
