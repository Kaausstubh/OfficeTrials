import { prisma } from '../db/prisma';

export class ReportService {
  /**
   * Complete case register report
   */
  async getCaseRegisterReport() {
    const cases = await prisma.case.findMany({
      where: { isArchived: false },
      include: {
        court: true,
        parties: true,
        assignments: {
          include: { user: { select: { fullName: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return cases.map(c => {
      const petitioner = c.parties.find(p =>
        ['PETITIONER', 'COMPLAINANT', 'PLAINTIFF', 'APPELLANT'].includes(p.partyType)
      )?.name || 'N/A';

      const respondent = c.parties.find(p =>
        ['RESPONDENT', 'DEFENDANT', 'ACCUSED'].includes(p.partyType)
      )?.name || 'N/A';

      const leadCounsel =
        c.assignments.find(a => a.roleInCase === 'Lead Counsel')?.user.fullName ||
        c.assignments[0]?.user.fullName ||
        'Unassigned';

      return {
        id: c.id,
        internalCaseNo: c.internalCaseNo,
        cnrNumber: c.cnrNumber || 'N/A',
        caseNumber: c.caseNumber,
        caseType: c.caseType,
        courtName: c.court.name,
        parties: `${petitioner} v. ${respondent}`,
        stage: c.proceduralStage.replace(/_/g, ' '),
        status: c.status,
        priority: c.priority,
        leadCounsel,
        nextHearingDate: c.nextHearingDate
          ? new Date(c.nextHearingDate).toISOString().split('T')[0]
          : 'None',
        nextHearingPurpose: c.nextHearingPurpose || 'N/A',
      };
    });
  }

  /**
   * Advocate Workload Report
   */
  async getAdvocateWorkload() {
    const advocates = await prisma.user.findMany({
      where: { role: { in: ['ADVOCATE', 'ASSOCIATE_ADVOCATE'] }, isActive: true },
      include: {
        assignedCases: {
          include: {
            case: {
              select: {
                id: true,
                status: true,
                nextHearingDate: true,
                priority: true,
              },
            },
          },
        },
        assignedTasks: {
          where: { status: { not: 'COMPLETED' } },
        },
      },
    });

    return advocates.map(adv => {
      const activeCases = adv.assignedCases.filter(
        ac => ac.case.status === 'PENDING'
      );
      const urgentCases = adv.assignedCases.filter(
        ac => ac.case.priority === 'URGENT' || ac.case.priority === 'HIGH'
      );
      const pendingTasks = adv.assignedTasks.length;

      return {
        advocateId: adv.id,
        fullName: adv.fullName,
        email: adv.email,
        role: adv.role,
        totalAssignedCases: adv.assignedCases.length,
        activeCasesCount: activeCases.length,
        urgentCasesCount: urgentCases.length,
        pendingTasksCount: pendingTasks,
      };
    });
  }

  /**
   * Convert JSON array to CSV format
   */
  exportToCsv(data: Record<string, any>[]): string {
    if (data.length === 0) return '';
    const headers = Object.keys(data[0]);
    const rows = data.map(row =>
      headers
        .map(h => {
          const val = row[h] === null || row[h] === undefined ? '' : String(row[h]);
          return `"${val.replace(/"/g, '""')}"`;
        })
        .join(',')
    );
    return [headers.join(','), ...rows].join('\n');
  }
}

export const reportService = new ReportService();
