import { prisma } from '../db/prisma';
import { UserRole } from '@prisma/client';

export interface GlobalSearchResult {
  cases: any[];
  documents: any[];
  hearings: any[];
  orders: any[];
  witnesses: any[];
}

export class SearchService {
  async globalSearch(
    query: string,
    userId: string,
    userRole: UserRole
  ): Promise<GlobalSearchResult> {
    const q = query.trim();
    if (!q || q.length < 2) {
      return { cases: [], documents: [], hearings: [], orders: [], witnesses: [] };
    }

    // Role-specific case filter
    const caseScope: any = { isArchived: false };
    if (userRole === UserRole.CLIENT) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true },
      });
      caseScope.OR = [
        { parties: { some: { isOurClient: true, email: user?.email } } },
        { assignments: { some: { userId } } },
      ];
    }

    // Search Cases
    const cases = await prisma.case.findMany({
      where: {
        ...caseScope,
        OR: [
          { caseNumber: { contains: q, mode: 'insensitive' } },
          { internalCaseNo: { contains: q, mode: 'insensitive' } },
          { cnrNumber: { contains: q, mode: 'insensitive' } },
          { title: { contains: q, mode: 'insensitive' } },
          { statutoryActs: { contains: q, mode: 'insensitive' } },
          { court: { name: { contains: q, mode: 'insensitive' } } },
          { parties: { some: { name: { contains: q, mode: 'insensitive' } } } },
        ],
      },
      include: { court: true },
      take: 10,
    });

    // Search Documents (with extracted text matches)
    const documents = await prisma.caseDocument.findMany({
      where: {
        case: caseScope,
        isDeleted: false,
        ...(userRole === UserRole.CLIENT ? { visibility: 'CLIENT_VISIBLE' } : {}),
        OR: [
          { displayName: { contains: q, mode: 'insensitive' } },
          { originalFilename: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
          { extractedPages: { some: { extractedText: { contains: q, mode: 'insensitive' } } } },
        ],
      },
      include: {
        case: { select: { id: true, caseNumber: true, title: true } },
        category: true,
        extractedPages: {
          where: { extractedText: { contains: q, mode: 'insensitive' } },
          take: 2,
        },
      },
      take: 10,
    });

    // Search Hearings
    const hearings = await prisma.hearing.findMany({
      where: {
        case: caseScope,
        OR: [
          { purpose: { contains: q, mode: 'insensitive' } },
          { proceedings: { contains: q, mode: 'insensitive' } },
          { orderPassed: { contains: q, mode: 'insensitive' } },
        ],
      },
      include: {
        case: { select: { id: true, caseNumber: true, title: true } },
        court: true,
      },
      take: 10,
    });

    // Search Court Orders
    const orders = await prisma.courtOrder.findMany({
      where: {
        case: caseScope,
        ...(userRole === UserRole.CLIENT ? { isSharedWithClient: true } : {}),
        OR: [
          { orderType: { contains: q, mode: 'insensitive' } },
          { orderSummary: { contains: q, mode: 'insensitive' } },
          { fullText: { contains: q, mode: 'insensitive' } },
        ],
      },
      include: {
        case: { select: { id: true, caseNumber: true, title: true } },
      },
      take: 10,
    });

    // Search Witnesses
    const witnesses =
      userRole === UserRole.CLIENT
        ? []
        : await prisma.witness.findMany({
            where: {
              case: caseScope,
              OR: [
                { name: { contains: q, mode: 'insensitive' } },
                { witnessNumber: { contains: q, mode: 'insensitive' } },
                { testimonySummary: { contains: q, mode: 'insensitive' } },
              ],
            },
            include: {
              case: { select: { id: true, caseNumber: true, title: true } },
            },
            take: 10,
          });

    return { cases, documents, hearings, orders, witnesses };
  }
}

export const searchService = new SearchService();
