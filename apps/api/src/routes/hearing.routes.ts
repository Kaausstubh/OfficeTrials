import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db/prisma';
import { hearingService } from '../services/hearing.service';
import { authenticate } from '../middleware/auth';
import { authorizeCaseAccess, authorizeRoles } from '../middleware/rbac';
import { logAuditEvent } from '../middleware/audit';
import { HearingAttendanceStatus, DateVerificationStatus, UserRole } from '@prisma/client';

const router = Router({ mergeParams: true });

const recordHearingSchema = z.object({
  courtId: z.string().uuid(),
  hearingDate: z.string(),
  purpose: z.string().min(2),
  proceedings: z.string().optional(),
  workPerformed: z.string().optional(),
  orderPassed: z.string().optional(),
  nextHearingDate: z.string().optional(),
  nextHearingPurpose: z.string().optional(),
  pendingWork: z.string().optional(),
  documentsRequired: z.string().optional(),
  clientActionNeeded: z.string().optional(),
  privateNotes: z.string().optional(),
  clientSummary: z.string().optional(),
  dateVerification: z.nativeEnum(DateVerificationStatus).optional(),
  attendanceUserId: z.string().uuid().optional(),
  attendanceStatus: z.nativeEnum(HearingAttendanceStatus).optional(),
  attendanceRemarks: z.string().optional(),
});

// List hearings for case
router.get('/', authenticate, authorizeCaseAccess('caseId'), async (req, res, next) => {
  try {
    const isClient = req.user?.role === UserRole.CLIENT;

    const hearings = await prisma.hearing.findMany({
      where: { caseId: req.params.caseId },
      include: {
        court: true,
        attendances: { include: { user: { select: { fullName: true } } } },
        orders: true,
      },
      orderBy: { hearingDate: 'desc' },
    });

    // Redact private notes for clients
    const safeHearings = hearings.map(h => {
      const copy = { ...h };
      if (isClient) {
        delete (copy as any).privateNotes;
      }
      return copy;
    });

    res.json({ success: true, data: safeHearings });
  } catch (error) {
    next(error);
  }
});

// Check conflicts on proposed date
router.post('/check-conflicts', authenticate, async (req, res, next) => {
  try {
    const { hearingDate, advocateId } = req.body;
    if (!hearingDate) {
      res.status(400).json({ success: false, message: 'hearingDate required' });
      return;
    }

    const conflicts = await hearingService.detectConflicts(
      advocateId || req.user!.id,
      new Date(hearingDate)
    );

    res.json({ success: true, data: { hasConflicts: conflicts.length > 0, conflicts } });
  } catch (error) {
    next(error);
  }
});

// Record hearing
router.post(
  '/',
  authenticate,
  authorizeCaseAccess('caseId'),
  authorizeRoles(UserRole.ADVOCATE, UserRole.ASSOCIATE_ADVOCATE),
  async (req, res, next) => {
    try {
      const data = recordHearingSchema.parse(req.body);

      const hearing = await hearingService.recordHearing({
        caseId: req.params.caseId,
        courtId: data.courtId,
        hearingDate: new Date(data.hearingDate),
        purpose: data.purpose,
        proceedings: data.proceedings,
        workPerformed: data.workPerformed,
        orderPassed: data.orderPassed,
        nextHearingDate: data.nextHearingDate ? new Date(data.nextHearingDate) : undefined,
        nextHearingPurpose: data.nextHearingPurpose,
        pendingWork: data.pendingWork,
        documentsRequired: data.documentsRequired,
        clientActionNeeded: data.clientActionNeeded,
        privateNotes: data.privateNotes,
        clientSummary: data.clientSummary,
        dateVerification: data.dateVerification,
        attendanceUserId: data.attendanceUserId || req.user!.id,
        attendanceStatus: data.attendanceStatus,
        attendanceRemarks: data.attendanceRemarks,
      });

      await logAuditEvent(req, 'HEARING_RECORDED', 'Hearing', hearing.id, {
        caseId: req.params.caseId,
        hearingDate: hearing.hearingDate,
      });

      res.status(201).json({ success: true, data: hearing });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
