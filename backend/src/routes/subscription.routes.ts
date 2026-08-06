import { Router } from 'express';
import { SubscriptionController } from '../controllers/subscription.controller';
import { validate } from '../middleware/validate';
import { updateSubscriptionSchema } from '../validations/subscription.validation';
import { authenticate, requirePermission } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', requirePermission('subscription.manage'), SubscriptionController.getSubscription);
router.put('/', requirePermission('subscription.manage'), validate(updateSubscriptionSchema), SubscriptionController.updateSubscription);

export default router;
