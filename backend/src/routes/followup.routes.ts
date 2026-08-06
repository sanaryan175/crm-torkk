import { Router } from 'express';
import { FollowUpController } from '../controllers/followup.controller';
import { validate } from '../middleware/validate';
import { createFollowUpSchema, updateFollowUpSchema, completeFollowUpSchema } from '../validations/followup.validation';
import { authenticate, requirePermission } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/',                 requirePermission('activity.read'),  FollowUpController.getFollowUps);
router.post('/',                requirePermission('activity.create'),validate(createFollowUpSchema),  FollowUpController.createFollowUp);
router.get('/:id',              requirePermission('activity.read'),  FollowUpController.getFollowUpById);
router.put('/:id',              requirePermission('activity.update'),validate(updateFollowUpSchema),  FollowUpController.updateFollowUp);
router.put('/:id/complete',     requirePermission('activity.update'),validate(completeFollowUpSchema), FollowUpController.completeFollowUp);
router.delete('/:id',           requirePermission('activity.delete'),FollowUpController.deleteFollowUp);

export default router;
