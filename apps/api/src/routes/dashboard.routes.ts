import { Router } from 'express';
import { prisma } from '../db/prisma';
import { authenticate } from '../middleware/auth';
import { DateVerificationStatus, EfilingStatus } from '@prisma/client';

const router = Router();

router.get('/summary', authenticate, async (req, res, next) => {
  try {
    const now = new Date();

    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(now);
    todayEnd.setHours(23, 59, 59, 999);

    const tomorrowStart = new Date(todayStart);
    tomorrowStart.setDate(tomorrowStart.getDate() + 1);
    const tomorrowEnd = new Date(todayEnd);
    tomorrowEnd.setDate(tomorrowEnd.getDate() + 1);

    const weekEnd = new Date(todayStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    // Hearings today
    const hearingsToday = await prisma.hearing.findMany({
      where: { hearingDate: { gte: todayStart, lte: todayEnd } },
      include: {
        case: { select: { id: true, caseNumber: true, title: true } },
        court: true,
      },
      orderBy: { hearingDate: 'asc' },
    });

    // Hearings tomorrow
    const hearingsTomorrow = await prisma.hearing.findMany({
      where: { hearingDate: { gte: tomorrowStart, lte: tomorrowEnd } },
      include: {
        case: { select: { id: true, caseNumber: true, title: true } },
        court: true,
      },
      orderBy: { hearingDate: 'asc' },
    });

    // Hearings this week
    const hearingsThisWeek = await prisma.hearing.findMany({
      where: { hearingDate: { gte: todayStart, lte: weekEnd } },
      include: {
        case: { select: { id: true, caseNumber: true, title: true } },
        court: true,
      },
      orderBy: { hearingDate: 'asc' },
    });

    // Overdue tasks
    const overdueTasks = await prisma.task.findMany({
      where: {
        dueDate: { lt: now },
        status: { not: 'COMPLETED' },
      },
      include: {
        case: { select: { id: true, caseNumber: true, title: true } },
        assignedTo: { select: { fullName: true } },
      },
      take: 5,
    });

    // Pending e-filing defects
    const pendingDefects = await prisma.efilingRecord.findMany({
      where: {
        currentStatus: { in: [EfilingStatus.DEFECTS_RAISED, EfilingStatus.RESUBMISSION_REQUIRED] },
      },
      include: {
        case: { select: { id: true, caseNumber: true, title: true } },
      },
      take: 5,
    });

    // Recent documents
    const recentDocuments = await prisma.caseDocument.findMany({
      where: { isDeleted: false },
      include: {
        case: { select: { id: true, caseNumber: true } },
        category: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    // Unverified hearing dates awaiting confirmation
    const unverifiedDates = await prisma.case.findMany({
      where: {
        dateVerification: DateVerificationStatus.AWAITING_VERIFICATION,
        isArchived: false,
      },
      select: {
        id: true,
        caseNumber: true,
        title: true,
        nextHearingDate: true,
        nextHearingPurpose: true,
      },
      take: 5,
    });

    // Counts
    const totalCasesCount = await prisma.case.count({ where: { isArchived: false } });
    const pendingCasesCount = await prisma.case.count({
      where: { isArchived: false, status: 'PENDING' },
    });
    const totalDocumentsCount = await prisma.caseDocument.count({
      where: { isDeleted: false },
    });

    res.json({
      success: true,
      data: {
        metrics: {
          totalCases: totalCasesCount,
          pendingCases: pendingCasesCount,
          hearingsTodayCount: hearingsToday.length,
          hearingsTomorrowCount: hearingsTomorrow.length,
          hearingsThisWeekCount: hearingsThisWeek.length,
          overdueTasksCount: overdueTasks.length,
          pendingDefectsCount: pendingDefects.length,
          totalDocuments: totalDocumentsCount,
        },
        hearingsToday,
        hearingsTomorrow,
        hearingsThisWeek,
        overdueTasks,
        pendingDefects,
        recentDocuments,
        unverifiedDates,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
