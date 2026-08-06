import { Router } from 'express';
import { CouponController } from '../controllers/coupon.controller';
import { validate } from '../middleware/validate';
import { createCouponSchema, updateCouponSchema, validateCouponSchema } from '../validations/coupon.validation';
import { authenticate, requirePermission } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/',              requirePermission('marketing.read'),     CouponController.getCoupons);
router.post('/',             requirePermission('marketing.create'),   validate(createCouponSchema), CouponController.createCoupon);
router.get('/:id',           requirePermission('marketing.read'),     CouponController.getCouponById);
router.put('/:id',           requirePermission('marketing.update'),   validate(updateCouponSchema), CouponController.updateCoupon);
router.delete('/:id',        requirePermission('marketing.delete'),   CouponController.deleteCoupon);
router.post('/:code/validate', requirePermission('marketing.read'),   validate(validateCouponSchema), CouponController.validateCoupon);

export default router;
