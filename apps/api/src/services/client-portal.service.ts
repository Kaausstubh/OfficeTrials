import { prisma } from '../db/prisma';

export class ClientPortalService {
  /**
   * Get client portal dashboard overview for authenticated client
   */
  async getClientOverview(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { clientProfile: true },
    });

    if (!user) throw new Error('Client user not found.');

    // Find all cases where user is a client party or assigned
    const cases = await prisma.case.findMany({
      where: {
        isArchived: false,
        OR: [
          { parties: { some: { isOurClient: true, email: user.email } } },
          { assignments: { some: { userId } } },
        ],
      },
      include: {
        court: true,
        parties: { where: { isOurClient: true } },
        hearings: {
          orderBy: { hearingDate: 'desc' },
          take: 3,
        },
        orders: {
          where: { isSharedWithClient: true },
          orderBy: { orderDate: 'desc' },
        },
        documents: {
          where: { visibility: 'CLIENT_VISIBLE', isDeleted: false },
          include: { category: true },
          orderBy: { createdAt: 'desc' },
        },
        documentRequests: {
          where: { isUploaded: false },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    // Transform into client-friendly sections
    const formattedCases = cases.map(c => {
      const lastHearing = c.hearings[0];
      const nextHearingDateStr = c.nextHearingDate
        ? new Date(c.nextHearingDate).toLocaleDateString('en-IN', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })
        : 'Not yet scheduled';

      // "What Happened in My Case"
      const whatHappened = lastHearing
        ? lastHearing.clientSummary ||
          lastHearing.proceedings ||
          `Hearing concluded on ${new Date(lastHearing.hearingDate).toLocaleDateString('en-IN')} for ${lastHearing.purpose}.`
        : 'The case has been filed and is undergoing preliminary procedural verification before the court.';

      // "What Happens Next"
      const whatHappensNext = c.clientGuidanceNotes
        ? c.clientGuidanceNotes
        : c.nextHearingDate
        ? `The next proceedings are scheduled for ${nextHearingDateStr} for ${c.nextHearingPurpose || 'further hearing'}. Your advocate will notify you if personal attendance is required.`
        : 'Your legal counsel is actively monitoring the court registry cause-list for the next listing date.';

      return {
        id: c.id,
        internalCaseNo: c.internalCaseNo,
        caseNumber: c.caseNumber,
        title: c.title,
        courtName: c.court.name,
        establishment: c.court.establishment,
        proceduralStage: c.proceduralStage.replace(/_/g, ' '),
        nextHearingDate: nextHearingDateStr,
        nextHearingPurpose: c.nextHearingPurpose || 'Further Hearing',
        whatHappened,
        whatHappensNext,
        sharedOrders: c.orders.map(o => ({
          id: o.id,
          orderDate: new Date(o.orderDate).toLocaleDateString('en-IN'),
          orderType: o.orderType,
          summary: o.orderSummary,
        })),
        sharedDocuments: c.documents.map(d => ({
          id: d.id,
          displayName: d.displayName,
          categoryName: d.category.name,
          fileType: d.fileType,
          fileSize: d.fileSize,
          createdAt: d.createdAt,
        })),
        pendingDocumentRequests: c.documentRequests,
      };
    });

    return {
      client: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
      },
      cases: formattedCases,
    };
  }

  /**
   * Request document from client
   */
  async createDocumentRequest(data: {
    caseId: string;
    requestedTitle: string;
    description?: string;
    deadline?: Date;
    requestedById: string;
  }) {
    return await prisma.documentRequest.create({
      data: {
        caseId: data.caseId,
        requestedTitle: data.requestedTitle,
        description: data.description,
        deadline: data.deadline,
        requestedById: data.requestedById,
      },
    });
  }
}

export const clientPortalService = new ClientPortalService();
