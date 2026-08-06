import { Router } from 'express';
import { ApplicationController } from '../controllers/application.controller';
import { validate } from '../middleware/validate';
import { createApplicationSchema, updateApplicationSchema, updateApplicationStatusSchema } from '../validations/application.validation';
import { authenticate, requirePermission } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/',          requirePermission('hr.read'),     ApplicationController.getApplications);
router.post('/',         requirePermission('hr.create'),   validate(createApplicationSchema),     ApplicationController.createApplication);
router.get('/:id',       requirePermission('hr.read'),     ApplicationController.getApplicationById);
router.put('/:id',       requirePermission('hr.update'),   validate(updateApplicationSchema),     ApplicationController.updateApplication);
router.put('/:id/status',requirePermission('hr.update'),   validate(updateApplicationStatusSchema), ApplicationController.updateApplicationStatus);
router.delete('/:id',    requirePermission('hr.delete'),   ApplicationController.deleteApplication);

export default router;
