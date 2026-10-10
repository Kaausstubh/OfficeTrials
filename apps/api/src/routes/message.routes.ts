import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db/prisma';
import { authenticate } from '../middleware/auth';
import { authorizeCaseAccess } from '../middleware/rbac';
import { MessageSenderType, UserRole } from '@prisma/client';

const router = Router({ mergeParams: true });

// Get messages for case
router.get('/', authenticate, authorizeCaseAccess('caseId'), async (req, res, next) => {
  try {
    const messages = await prisma.clientMessage.findMany({
      where: { caseId: req.params.caseId },
      include: {
        sender: { select: { id: true, fullName: true, role: true } },
        attachments: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    res.json({ success: true, data: messages });
  } catch (error) {
    next(error);
  }
});

// Send message
router.post('/', authenticate, authorizeCaseAccess('caseId'), async (req, res, next) => {
  try {
    const schema = z.object({
      messageText: z.string().min(1),
    });
    const { messageText } = schema.parse(req.body);

    const senderType =
      req.user?.role === UserRole.CLIENT
        ? MessageSenderType.CLIENT
        : MessageSenderType.ADVOCATE;

    const message = await prisma.clientMessage.create({
      data: {
        caseId: req.params.caseId,
        senderId: req.user!.id,
        senderType,
        messageText,
      },
      include: {
        sender: { select: { id: true, fullName: true, role: true } },
      },
    });

    res.status(201).json({ success: true, data: message });
  } catch (error) {
    next(error);
  }
});

export default router;
