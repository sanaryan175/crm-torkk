import { Router } from 'express';
import { PurchaseRequestController } from '../controllers/purchaserequest.controller';
import { validate } from '../middleware/validate';
import {
  createPurchaseRequestSchema,
  updatePurchaseRequestSchema,
  approvePurchaseRequestSchema,
} from '../validations/purchaserequest.validation';
import { authenticate, requirePermission } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/',            requirePermission('procurement.read'),   PurchaseRequestController.getPurchaseRequests);
router.post('/',           requirePermission('procurement.create'), validate(createPurchaseRequestSchema), PurchaseRequestController.createPurchaseRequest);
router.get('/:id',         requirePermission('procurement.read'),   PurchaseRequestController.getPurchaseRequestById);
router.put('/:id',         requirePermission('procurement.update'), validate(updatePurchaseRequestSchema), PurchaseRequestController.updatePurchaseRequest);
router.put('/:id/approve', requirePermission('procurement.update'), validate(approvePurchaseRequestSchema), PurchaseRequestController.approvePurchaseRequest);
router.delete('/:id',      requirePermission('procurement.delete'), PurchaseRequestController.deletePurchaseRequest);

export default router;
