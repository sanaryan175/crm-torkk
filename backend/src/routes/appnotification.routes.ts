import { Router } from 'express';
import { AppNotificationController } from '../controllers/appnotification.controller';
import { validate } from '../middleware/validate';
import { markReadSchema } from '../validations/appnotification.validation';
import { authenticate, requirePermission } from '../middleware/auth';

const router = Router();

router.use(authenticate);

// Use notification permissions instead of announcement permissions
router.get('/',            requirePermission('notification.read'),   AppNotificationController.getNotifications);
router.post('/mark-read',  requirePermission('notification.update'), validate(markReadSchema), AppNotificationController.markRead);
router.delete('/:id',      requirePermission('notification.delete'), AppNotificationController.deleteNotification);

export default router;
