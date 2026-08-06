import { Router } from 'express';
import { ReferralController } from '../controllers/referral.controller';
import { validate } from '../middleware/validate';
import { createReferralSchema, updateReferralSchema } from '../validations/referral.validation';
import { authenticate, requirePermission } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/',              requirePermission('marketing.read'),     ReferralController.getReferrals);
router.post('/',             requirePermission('marketing.create'),   validate(createReferralSchema), ReferralController.createReferral);
router.get('/:id',           requirePermission('marketing.read'),     ReferralController.getReferralById);
router.put('/:id',           requirePermission('marketing.update'),   validate(updateReferralSchema), ReferralController.updateReferral);
router.delete('/:id',        requirePermission('marketing.delete'),   ReferralController.deleteReferral);

export default router;
