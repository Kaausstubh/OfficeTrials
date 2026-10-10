import { Router } from 'express';
import { hearingService } from '../services/hearing.service';
import { authenticate } from '../middleware/auth';

const router = Router();

// GET /api/v1/calendar
router.get('/', authenticate, async (req, res, next) => {
  try {
    const { start, end, courtId, advocateId, caseId } = req.query;

    const startDate = start ? new Date(start as string) : new Date();
    if (!start) startDate.setDate(startDate.getDate() - 7);

    const endDate = end ? new Date(end as string) : new Date();
    if (!end) endDate.setDate(endDate.getDate() + 30);

    const hearings = await hearingService.getCalendarHearings({
      startDate,
      endDate,
      courtId: courtId as string,
      advocateId: advocateId as string || (req.user?.role === 'ADVOCATE' ? req.user.id : undefined),
      caseId: caseId as string,
    });

    res.json({
      success: true,
      data: hearings,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
