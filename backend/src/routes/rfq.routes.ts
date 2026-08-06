import { Router } from 'express';
import { RfqController } from '../controllers/rfq.controller';
import { validate } from '../middleware/validate';
import { createRfqSchema, updateRfqSchema } from '../validations/rfq.validation';
import { authenticate, requirePermission } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/',       requirePermission('procurement.read'),   RfqController.getRfqs);
router.post('/',      requirePermission('procurement.create'), validate(createRfqSchema), RfqController.createRfq);
router.get('/:id',    requirePermission('procurement.read'),   RfqController.getRfqById);
router.put('/:id',    requirePermission('procurement.update'), validate(updateRfqSchema), RfqController.updateRfq);
router.delete('/:id', requirePermission('procurement.delete'), RfqController.deleteRfq);

export default router;
