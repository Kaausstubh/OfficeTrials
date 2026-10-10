import { Router } from 'express';
import authRoutes from './auth.routes';
import caseRoutes from './case.routes';
import documentRoutes from './document.routes';
import efilingRoutes from './efiling.routes';
import hearingRoutes from './hearing.routes';
import calendarRoutes from './calendar.routes';
import evidenceRoutes from './evidence.routes';
import clientRoutes from './client.routes';
import messageRoutes from './message.routes';
import ecourtsRoutes from './ecourts.routes';
import aiRoutes from './ai.routes';
import searchRoutes from './search.routes';
import reportRoutes from './report.routes';
import dashboardRoutes from './dashboard.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/cases', caseRoutes);
router.use('/cases/:caseId/documents', documentRoutes);
router.use('/cases/:caseId/efilings', efilingRoutes);
router.use('/cases/:caseId/hearings', hearingRoutes);
router.use('/cases/:caseId', evidenceRoutes);
router.use('/cases/:caseId/messages', messageRoutes);
router.use('/ai/cases/:caseId', aiRoutes);

router.use('/calendar', calendarRoutes);
router.use('/client', clientRoutes);
router.use('/ecourts', ecourtsRoutes);
router.use('/search', searchRoutes);
router.use('/reports', reportRoutes);
router.use('/dashboard', dashboardRoutes);

export default router;
