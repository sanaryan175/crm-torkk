import { Router } from 'express';
import { PurchaseOrderController } from '../controllers/purchaseorder.controller';
import { validate } from '../middleware/validate';
import {
  createPurchaseOrderSchema,
  updatePurchaseOrderSchema,
  updatePurchaseOrderStatusSchema,
  createVendorPaymentSchema,
} from '../validations/purchaseorder.validation';
import { authenticate, requirePermission } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/',             requirePermission('procurement.read'),   PurchaseOrderController.getPurchaseOrders);
router.post('/',            requirePermission('procurement.create'), validate(createPurchaseOrderSchema), PurchaseOrderController.createPurchaseOrder);
router.get('/:id',          requirePermission('procurement.read'),   PurchaseOrderController.getPurchaseOrderById);
router.put('/:id',          requirePermission('procurement.update'), validate(updatePurchaseOrderSchema), PurchaseOrderController.updatePurchaseOrder);
router.put('/:id/status',   requirePermission('procurement.update'), validate(updatePurchaseOrderStatusSchema), PurchaseOrderController.updatePurchaseOrderStatus);
router.delete('/:id',       requirePermission('procurement.delete'), PurchaseOrderController.deletePurchaseOrder);
router.post('/:id/payments', requirePermission('procurement.create'), validate(createVendorPaymentSchema), PurchaseOrderController.createPayment);

export default router;
