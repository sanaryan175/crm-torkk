import { Router } from 'express';
import { SalesOrderController } from '../controllers/salesorder.controller';
import { validate } from '../middleware/validate';
import { createSalesOrderSchema, updateSalesOrderSchema } from '../validations/salesorder.validation';
import { authenticate, requirePermission } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/',              requirePermission('sale.read'),     SalesOrderController.getSalesOrders);
router.post('/',             requirePermission('sale.create'),   validate(createSalesOrderSchema), SalesOrderController.createSalesOrder);
router.get('/:id',           requirePermission('sale.read'),     SalesOrderController.getSalesOrderById);
router.put('/:id',           requirePermission('sale.update'),   validate(updateSalesOrderSchema), SalesOrderController.updateSalesOrder);
router.delete('/:id',        requirePermission('sale.delete'),   SalesOrderController.deleteSalesOrder);

export default router;
