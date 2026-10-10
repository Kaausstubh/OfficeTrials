import { Router } from 'express';
import { reportService } from '../services/report.service';
import { authenticate } from '../middleware/auth';
import { authorizeRoles } from '../middleware/rbac';
import { UserRole } from '@prisma/client';

const router = Router();

// Case Register Report
router.get(
  '/case-register',
  authenticate,
  authorizeRoles(UserRole.ADVOCATE, UserRole.ASSOCIATE_ADVOCATE, UserRole.ADMINISTRATOR),
  async (req, res, next) => {
    try {
      const data = await reportService.getCaseRegisterReport();
      const format = req.query.format;

      if (format === 'csv') {
        const csv = reportService.exportToCsv(data);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader(
          'Content-Disposition',
          `attachment; filename="Case_Register_${new Date().toISOString().split('T')[0]}.csv"`
        );
        res.send(csv);
        return;
      }

      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }
);

// Advocate Workload Report
router.get(
  '/workload',
  authenticate,
  authorizeRoles(UserRole.ADVOCATE, UserRole.ADMINISTRATOR),
  async (req, res, next) => {
    try {
      const data = await reportService.getAdvocateWorkload();
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
