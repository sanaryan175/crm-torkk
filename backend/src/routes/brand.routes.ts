import { Router } from 'express';
import { BrandController } from '../controllers/brand.controller';
import { validate } from '../middleware/validate';
import { createBrandSchema, updateBrandSchema } from '../validations/brand.validation';
import { authenticate, requirePermission } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/',       requirePermission('subscription.manage'), BrandController.listBrands);
router.post('/',      requirePermission('subscription.manage'), validate(createBrandSchema), BrandController.createBrand);
router.get('/:id',    requirePermission('subscription.manage'), BrandController.getBrandById);
router.put('/:id',    requirePermission('subscription.manage'), validate(updateBrandSchema), BrandController.updateBrand);
router.delete('/:id', requirePermission('subscription.manage'), BrandController.deleteBrand);

export default router;
