import { Router } from 'express';
import { ProductController } from '../controllers/product.controller';
import { validate } from '../middleware/validate';
import { createProductSchema, updateProductSchema } from '../validations/product.validation';
import { authenticate, requirePermission } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/',        requirePermission('inventory.read'),   ProductController.getProducts);
router.post('/',       requirePermission('inventory.create'), validate(createProductSchema),  ProductController.createProduct);
router.get('/:id',     requirePermission('inventory.read'),   ProductController.getProductById);
router.put('/:id',     requirePermission('inventory.update'), validate(updateProductSchema),  ProductController.updateProduct);
router.delete('/:id',  requirePermission('inventory.delete'), ProductController.deleteProduct);

export default router;
