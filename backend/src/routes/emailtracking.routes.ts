import { Router } from 'express';
import { EmailTrackingController } from '../controllers/emailtracking.controller';
import { validate } from '../middleware/validate';
import { createEmailTrackingSchema } from '../validations/emailtracking.validation';
import { authenticate, requirePermission } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/',               requirePermission('activity.read'),   EmailTrackingController.getTrackings);
router.post('/',              requirePermission('activity.create'), validate(createEmailTrackingSchema), EmailTrackingController.createTracking);
router.put('/:id/open',       requirePermission('activity.read'),   EmailTrackingController.recordOpen);
router.put('/:id/click',      requirePermission('activity.read'),   EmailTrackingController.recordClick);
router.delete('/:id',         requirePermission('activity.delete'), EmailTrackingController.deleteTracking);

export default router;
