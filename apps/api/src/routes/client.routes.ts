import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db/prisma';
import { clientPortalService } from '../services/client-portal.service';
import { authenticate } from '../middleware/auth';
import { authorizeRoles } from '../middleware/rbac';
import { UserRole } from '@prisma/client';

const router = Router();

// Client Portal Dashboard Overview
router.get('/overview', authenticate, async (req, res, next) => {
  try {
    const overview = await clientPortalService.getClientOverview(req.user!.id);
    res.json({ success: true, data: overview });
  } catch (error) {
    next(error);
  }
});

// Request document from client (Advocate initiated)
router.post(
  '/requests',
  authenticate,
  authorizeRoles(UserRole.ADVOCATE, UserRole.ASSOCIATE_ADVOCATE),
  async (req, res, next) => {
    try {
      const schema = z.object({
        caseId: z.string().uuid(),
        requestedTitle: z.string().min(2),
        description: z.string().optional(),
        deadline: z.string().optional(),
      });
      const data = schema.parse(req.body);

      const request = await clientPortalService.createDocumentRequest({
        caseId: data.caseId,
        requestedTitle: data.requestedTitle,
        description: data.description,
        deadline: data.deadline ? new Date(data.deadline) : undefined,
        requestedById: req.user!.id,
      });

      res.status(201).json({ success: true, data: request });
    } catch (error) {
      next(error);
    }
  }
);

// Mark document request fulfilled
router.patch('/requests/:requestId/fulfill', authenticate, async (req, res, next) => {
  try {
    const { uploadedDocId } = req.body;
    const updated = await prisma.documentRequest.update({
      where: { id: req.params.requestId },
      data: {
        isUploaded: true,
        uploadedDocId: uploadedDocId || null,
      },
    });
    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
});

export default router;
