import { Router } from 'express';
import { WorkflowController } from '../controllers/workflow.controller';
import { validate } from '../middleware/validate';
import {
  createScheduledJobSchema,
  updateScheduledJobSchema,
  createBusinessRuleSchema,
  updateBusinessRuleSchema,
} from '../validations/workflow.validation';
import { authenticate, requirePermission } from '../middleware/auth';

const router = Router();

router.use(authenticate);

// Scheduled jobs
router.get('/scheduled-jobs',        requirePermission('workflow.read'),   WorkflowController.getScheduledJobs);
router.post('/scheduled-jobs',       requirePermission('workflow.create'), validate(createScheduledJobSchema), WorkflowController.createScheduledJob);
router.get('/scheduled-jobs/:id',    requirePermission('workflow.read'),   WorkflowController.getScheduledJobById);
router.put('/scheduled-jobs/:id',    requirePermission('workflow.update'), validate(updateScheduledJobSchema), WorkflowController.updateScheduledJob);
router.delete('/scheduled-jobs/:id', requirePermission('workflow.delete'), WorkflowController.deleteScheduledJob);

// Business rules
router.get('/business-rules',        requirePermission('workflow.read'),   WorkflowController.getBusinessRules);
router.post('/business-rules',       requirePermission('workflow.create'), validate(createBusinessRuleSchema), WorkflowController.createBusinessRule);
router.get('/business-rules/:id',    requirePermission('workflow.read'),   WorkflowController.getBusinessRuleById);
router.put('/business-rules/:id',    requirePermission('workflow.update'), validate(updateBusinessRuleSchema), WorkflowController.updateBusinessRule);
router.delete('/business-rules/:id', requirePermission('workflow.delete'), WorkflowController.deleteBusinessRule);

export default router;
