import { Router } from 'express';
import { searchService } from '../services/search.service';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, async (req, res, next) => {
  try {
    const q = (req.query.q as string) || '';
    const results = await searchService.globalSearch(
      q,
      req.user!.id,
      req.user!.role
    );

    res.json({
      success: true,
      data: results,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
