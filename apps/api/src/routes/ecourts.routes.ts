import { Router } from 'express';
import { z } from 'zod';
import { ecourtsService } from '../services/ecourts.service';
import { authenticate } from '../middleware/auth';
import { authorizeRoles } from '../middleware/rbac';
import { logAuditEvent } from '../middleware/audit';
import { UserRole } from '@prisma/client';

const router = Router();

// Search external eCourts portal
router.get('/search', authenticate, async (req, res, next) => {
  try {
    const { cnrNumber, caseNumber, caseType, year, courtName, partyName } = req.query;

    const results = await ecourtsService.searchECourts({
      cnrNumber: cnrNumber as string,
      caseNumber: caseNumber as string,
      caseType: caseType as string,
      year: year ? Number(year) : undefined,
      courtName: courtName as string,
      partyName: partyName as string,
    });

    res.json({ success: true, data: results });
  } catch (error) {
    next(error);
  }
});

// Compare imported eCourts data with local case
router.post('/compare', authenticate, async (req, res, next) => {
  try {
    const schema = z.object({
      caseId: z.string().uuid(),
      importedData: z.any(),
    });
    const { caseId, importedData } = schema.parse(req.body);

    const diff = await ecourtsService.compareAndDiff(caseId, importedData);
    res.json({ success: true, data: diff });
  } catch (error) {
    next(error);
  }
});

// Synchronize verified eCourts data into local case
router.post(
  '/sync',
  authenticate,
  authorizeRoles(UserRole.ADVOCATE, UserRole.ASSOCIATE_ADVOCATE),
  async (req, res, next) => {
    try {
      const schema = z.object({
        caseId: z.string().uuid(),
        importedData: z.any(),
        applyDateUpdate: z.boolean().default(true),
      });
      const { caseId, importedData, applyDateUpdate } = schema.parse(req.body);

      const updated = await ecourtsService.syncImportedData(
        caseId,
        importedData,
        applyDateUpdate,
        req.user!.id
      );

      await logAuditEvent(req, 'ECOURTS_SYNC', 'Case', caseId, {
        cnrNumber: importedData.cnrNumber,
        appliedDateUpdate: applyDateUpdate,
      });

      res.json({ success: true, data: updated });
    } catch (error) {
      next(error);
    }
  }
);

// Directly import eCourts record into chamber practice
router.post(
  '/import-to-chambers',
  authenticate,
  authorizeRoles(UserRole.ADVOCATE, UserRole.ASSOCIATE_ADVOCATE, UserRole.ADMINISTRATOR),
  async (req, res, next) => {
    try {
      const schema = z.object({
        cnrNumber: z.string().min(5),
      });
      const { cnrNumber } = schema.parse(req.body);

      const importedCase = await ecourtsService.importCaseToChambers(cnrNumber, req.user!.id);

      await logAuditEvent(req, 'ECOURTS_IMPORT_TO_CHAMBERS', 'Case', importedCase.id, {
        cnrNumber,
        caseNumber: importedCase.caseNumber,
      });

      res.status(201).json({ success: true, data: importedCase });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
