import { Request, Response, NextFunction } from 'express';
import { UserRole } from '@prisma/client';
import { prisma } from '../db/prisma';

export const authorizeRoles = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthenticated.' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: 'Access forbidden: You do not have permission to perform this action.',
      });
      return;
    }

    next();
  };
};

export const authorizeCaseAccess = (paramName: string = 'caseId') => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthenticated.' });
        return;
      }

      const caseId = req.params[paramName] || req.body.caseId;
      if (!caseId) {
        res.status(400).json({ success: false, message: 'Case ID is required.' });
        return;
      }

      const caseRecord = await prisma.case.findUnique({
        where: { id: caseId },
        include: {
          parties: true,
          assignments: true,
        },
      });

      if (!caseRecord) {
        res.status(404).json({ success: false, message: 'Case not found.' });
        return;
      }

      // If user is a Client, verify that they are linked as a client party or assignee
      if (req.user.role === UserRole.CLIENT) {
        const isClientParty = caseRecord.parties.some(
          p => p.isOurClient && (p.email?.toLowerCase() === req.user?.email.toLowerCase())
        );
        const isAssigned = caseRecord.assignments.some(a => a.userId === req.user?.id);

        if (!isClientParty && !isAssigned) {
          res.status(403).json({
            success: false,
            message: 'Access forbidden: You are not authorized to view this case.',
          });
          return;
        }
      }

      // If user is an Associate Advocate or Legal Staff, verify they are assigned or created it
      if (
        req.user.role === UserRole.ASSOCIATE_ADVOCATE ||
        req.user.role === UserRole.LEGAL_STAFF
      ) {
        const isAssigned = caseRecord.assignments.some(a => a.userId === req.user?.id);
        const isCreator = caseRecord.createdById === req.user.id;
        if (!isAssigned && !isCreator && req.user.role === UserRole.LEGAL_STAFF) {
          res.status(403).json({
            success: false,
            message: 'Access forbidden: You are not assigned to this case.',
          });
          return;
        }
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
