import { Router } from 'express';
import { AuditLogController } from '../controllers/auditlog.controller';
import { validate } from '../middleware/validate';
import { authenticate, requirePermission } from '../middleware/auth';
import { auditLogsQuerySchema } from '../validations/auditlog.validation';

const router = Router();

router.use(authenticate);

router.get('/', requirePermission('security.read'), validate(auditLogsQuerySchema), AuditLogController.getAuditLogs);

export default router;
