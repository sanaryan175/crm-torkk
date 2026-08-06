import { Router } from 'express';
import { LeadController } from '../controllers/lead.controller';
import { validate } from '../middleware/validate';
import { createLeadSchema, updateLeadSchema, convertLeadSchema } from '../validations/lead.validation';
import { authenticate, requirePermission } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/',           requirePermission('lead.read'),     LeadController.getLeads);
router.post('/',          requirePermission('lead.create'),   validate(createLeadSchema),  LeadController.createLead);
router.get('/:id',        requirePermission('lead.read'),     LeadController.getLeadById);
router.put('/:id',        requirePermission('lead.update'),   validate(updateLeadSchema),  LeadController.updateLead);
router.put('/:id/convert',requirePermission('lead.update'),   validate(convertLeadSchema), LeadController.convertLead);
router.delete('/:id',     requirePermission('lead.delete'),   LeadController.deleteLead);

export default router;
