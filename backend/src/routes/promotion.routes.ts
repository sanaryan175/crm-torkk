import { Router } from 'express';
import { PromotionController } from '../controllers/promotion.controller';
import { validate } from '../middleware/validate';
import { createPromotionSchema, updatePromotionSchema } from '../validations/promotion.validation';
import { authenticate, requirePermission } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/',       requirePermission('hr.read'),     PromotionController.getPromotions);
router.post('/',      requirePermission('hr.create'),   validate(createPromotionSchema), PromotionController.createPromotion);
router.get('/:id',    requirePermission('hr.read'),     PromotionController.getPromotionById);
router.put('/:id',    requirePermission('hr.update'),   validate(updatePromotionSchema), PromotionController.updatePromotion);
router.delete('/:id', requirePermission('hr.delete'),   PromotionController.deletePromotion);

export default router;
