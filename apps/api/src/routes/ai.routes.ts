import { Router } from 'express';
import { z } from 'zod';
import { aiService } from '../services/ai.service';
import { authenticate } from '../middleware/auth';
import { authorizeCaseAccess } from '../middleware/rbac';

const router = Router({ mergeParams: true });

// Case-specific AI Assistant query
router.post('/query', authenticate, authorizeCaseAccess('caseId'), async (req, res, next) => {
  try {
    const schema = z.object({
      prompt: z.string().min(2),
    });
    const { prompt } = schema.parse(req.body);

    const result = await aiService.queryCase(
      req.params.caseId,
      prompt,
      req.user!.id,
      req.user!.role
    );

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
