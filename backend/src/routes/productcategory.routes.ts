import { Router } from 'express';
import { ProductCategoryController } from '../controllers/productcategory.controller';
import { validate } from '../middleware/validate';
import { createProductCategorySchema, updateProductCategorySchema } from '../validations/productcategory.validation';
import { authenticate, requirePermission } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/',        requirePermission('inventory.read'),   ProductCategoryController.getProductCategories);
router.post('/',       requirePermission('inventory.create'), validate(createProductCategorySchema),  ProductCategoryController.createProductCategory);
router.get('/:id',     requirePermission('inventory.read'),   ProductCategoryController.getProductCategoryById);
router.put('/:id',     requirePermission('inventory.update'), validate(updateProductCategorySchema),  ProductCategoryController.updateProductCategory);
router.delete('/:id',  requirePermission('inventory.delete'), ProductCategoryController.deleteProductCategory);

export default router;
