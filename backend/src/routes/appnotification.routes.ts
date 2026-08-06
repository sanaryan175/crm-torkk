import { Router } from 'express';
import { AppNotificationController } from '../controllers/appnotification.controller';
import { validate } from '../middleware/validate';
import { markReadSchema } from '../validations/appnotification.validation';
import { authenticate, requirePermission } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/',            requirePermission('announcement.read'),   AppNotificationController.getNotifications);
router.post('/mark-read',  requirePermission('announcement.update'), validate(markReadSchema), AppNotificationController.markRead);
router.delete('/:id',      requirePermission('announcement.delete'), AppNotificationController.deleteNotification);

export default router;
