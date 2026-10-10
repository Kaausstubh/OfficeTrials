import { prisma } from '../db/prisma';
import { HearingAttendanceStatus, DateVerificationStatus } from '@prisma/client';

export interface CalendarHearingItem {
  id: string;
  caseId: string;
  caseNumber: string;
  caseTitle: string;
  internalCaseNo: string;
  courtName: string;
  courtHall?: string;
  hearingDate: string;
  purpose: string;
  assignedAdvocate: string;
  dateVerification: DateVerificationStatus;
  hasConflict: boolean;
  conflictDetails?: string;
  isCompleted: boolean;
}

export class HearingService {
  /**
   * Detect potential hearing conflicts for an advocate on a given date
   */
  async detectConflicts(advocateId: string, hearingDate: Date, excludeHearingId?: string) {
    const startOfDay = new Date(hearingDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(hearingDate);
    endOfDay.setHours(23, 59, 59, 999);

    const sameDayHearings = await prisma.hearing.findMany({
      where: {
        hearingDate: { gte: startOfDay, lte: endOfDay },
        ...(excludeHearingId && { id: { not: excludeHearingId } }),
        case: {
          assignments: { some: { userId: advocateId } },
        },
      },
      include: {
        court: true,
        case: true,
      },
    });

    const conflicts: {
      hearingId: string;
      caseNumber: string;
      courtName: string;
      courtEstablishment?: string;
      reason: string;
    }[] = [];

    // If there are multiple hearings across different court complexes on the same day
    if (sameDayHearings.length > 0) {
      sameDayHearings.forEach(h => {
        conflicts.push({
          hearingId: h.id,
          caseNumber: h.case.caseNumber,
          courtName: h.court.name,
          courtEstablishment: h.court.establishment,
          reason: `Concurrent listing on ${hearingDate.toISOString().split('T')[0]} at ${h.court.name} (${h.court.establishment})`,
        });
      });
    }

    return conflicts;
  }

  /**
   * Record a hearing diary entry and optionally propagate the next hearing date to the case
   */
  async recordHearing(data: {
    caseId: string;
    courtId: string;
    hearingDate: Date;
    purpose: string;
    proceedings?: string;
    workPerformed?: string;
    orderPassed?: string;
    nextHearingDate?: Date;
    nextHearingPurpose?: string;
    pendingWork?: string;
    documentsRequired?: string;
    clientActionNeeded?: string;
    privateNotes?: string;
    clientSummary?: string;
    dateVerification?: DateVerificationStatus;
    attendanceUserId?: string;
    attendanceStatus?: HearingAttendanceStatus;
    attendanceRemarks?: string;
  }) {
    return await prisma.$transaction(async tx => {
      const hearing = await tx.hearing.create({
        data: {
          caseId: data.caseId,
          courtId: data.courtId,
          hearingDate: data.hearingDate,
          purpose: data.purpose,
          proceedings: data.proceedings,
          workPerformed: data.workPerformed,
          orderPassed: data.orderPassed,
          nextHearingDate: data.nextHearingDate,
          nextHearingPurpose: data.nextHearingPurpose,
          pendingWork: data.pendingWork,
          documentsRequired: data.documentsRequired,
          clientActionNeeded: data.clientActionNeeded,
          privateNotes: data.privateNotes,
          clientSummary: data.clientSummary,
          dateVerification: data.dateVerification || DateVerificationStatus.MANUALLY_ENTERED,
          isCompleted: true,
        },
      });

      // Record attendance
      if (data.attendanceUserId) {
        await tx.hearingAttendance.create({
          data: {
            hearingId: hearing.id,
            userId: data.attendanceUserId,
            status: data.attendanceStatus || HearingAttendanceStatus.ATTENDED,
            remarks: data.attendanceRemarks,
          },
        });
      }

      // If next hearing date is provided, update the case metadata
      if (data.nextHearingDate) {
        await tx.case.update({
          where: { id: data.caseId },
          data: {
            nextHearingDate: data.nextHearingDate,
            nextHearingPurpose: data.nextHearingPurpose || 'Further Proceedings',
            dateVerification: data.dateVerification || DateVerificationStatus.MANUALLY_ENTERED,
          },
        });
      }

      return hearing;
    });
  }

  /**
   * Get calendar hearings for Day, Week, Month, or Agenda
   */
  async getCalendarHearings(filters: {
    startDate: Date;
    endDate: Date;
    courtId?: string;
    advocateId?: string;
    caseId?: string;
  }): Promise<CalendarHearingItem[]> {
    const where: any = {
      hearingDate: {
        gte: filters.startDate,
        lte: filters.endDate,
      },
    };

    if (filters.courtId) where.courtId = filters.courtId;
    if (filters.caseId) where.caseId = filters.caseId;
    if (filters.advocateId) {
      where.case = {
        assignments: { some: { userId: filters.advocateId } },
      };
    }

    const hearings = await prisma.hearing.findMany({
      where,
      include: {
        court: true,
        case: {
          include: {
            assignments: {
              include: { user: { select: { fullName: true } } },
              where: { roleInCase: 'Lead Counsel' },
            },
          },
        },
      },
      orderBy: { hearingDate: 'asc' },
    });

    // Check conflicts across the result set
    const calendarItems: CalendarHearingItem[] = [];

    for (const h of hearings) {
      const sameDayOtherCourts = hearings.filter(
        other =>
          other.id !== h.id &&
          new Date(other.hearingDate).toDateString() ===
            new Date(h.hearingDate).toDateString() &&
          other.courtId !== h.courtId
      );

      const hasConflict = sameDayOtherCourts.length > 0;
      const conflictDetails = hasConflict
        ? `Conflicting listing at ${sameDayOtherCourts.map(o => o.court.name).join(', ')}`
        : undefined;

      calendarItems.push({
        id: h.id,
        caseId: h.caseId,
        caseNumber: h.case.caseNumber,
        caseTitle: h.case.title,
        internalCaseNo: h.case.internalCaseNo,
        courtName: h.court.name,
        courtHall: h.court.courtHallNo || undefined,
        hearingDate: h.hearingDate.toISOString(),
        purpose: h.purpose,
        assignedAdvocate:
          h.case.assignments[0]?.user?.fullName || 'Assigned Counsel',
        dateVerification: h.dateVerification,
        hasConflict,
        conflictDetails,
        isCompleted: h.isCompleted,
      });
    }

    return calendarItems;
  }
}

export const hearingService = new HearingService();
