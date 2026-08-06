import { Router } from 'express';
import { SlaPolicyController } from '../controllers/sla.controller';
import { validate } from '../middleware/validate';
import { createSlaPolicySchema, updateSlaPolicySchema } from '../validations/sla.validation';
import { authenticate, requirePermission } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/:id',   requirePermission('ticket.read'),    SlaPolicyController.getSlaPolicyById);
router.put('/:id',   requirePermission('ticket.update'),  validate(updateSlaPolicySchema), SlaPolicyController.updateSlaPolicy);
router.delete('/:id', requirePermission('ticket.delete'),  SlaPolicyController.deleteSlaPolicy);
router.get('/',      requirePermission('ticket.read'),    SlaPolicyController.getSlaPolicies);
router.post('/',     requirePermission('ticket.create'),  validate(createSlaPolicySchema), SlaPolicyController.createSlaPolicy);

export default router;
