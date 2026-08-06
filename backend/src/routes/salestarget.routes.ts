import { Router } from 'express';
import { SalesTargetController } from '../controllers/salestarget.controller';
import { validate } from '../middleware/validate';
import { createSalesTargetSchema, updateSalesTargetSchema } from '../validations/salestarget.validation';
import { authenticate, requirePermission } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/',              requirePermission('sale.read'),     SalesTargetController.getSalesTargets);
router.post('/',             requirePermission('sale.create'),   validate(createSalesTargetSchema), SalesTargetController.createSalesTarget);
router.get('/:id',           requirePermission('sale.read'),     SalesTargetController.getSalesTargetById);
router.put('/:id',           requirePermission('sale.update'),   validate(updateSalesTargetSchema), SalesTargetController.updateSalesTarget);
router.delete('/:id',        requirePermission('sale.delete'),   SalesTargetController.deleteSalesTarget);

export default router;
