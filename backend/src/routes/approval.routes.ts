import { Router } from 'express';
import { ApprovalController } from '../controllers/approval.controller';
import { validate } from '../middleware/validate';
import {
  createApprovalFlowSchema,
  updateApprovalFlowSchema,
  createApprovalRequestSchema,
  decideApprovalSchema,
} from '../validations/approval.validation';
import { authenticate, requirePermission } from '../middleware/auth';

const router = Router();

router.use(authenticate);

// Approval flows
router.get('/flows',        requirePermission('workflow.read'),   ApprovalController.getApprovalFlows);
router.post('/flows',       requirePermission('workflow.create'), validate(createApprovalFlowSchema), ApprovalController.createApprovalFlow);
router.get('/flows/:id',    requirePermission('workflow.read'),   ApprovalController.getApprovalFlowById);
router.put('/flows/:id',    requirePermission('workflow.update'), validate(updateApprovalFlowSchema), ApprovalController.updateApprovalFlow);
router.delete('/flows/:id', requirePermission('workflow.delete'), ApprovalController.deleteApprovalFlow);

// Approval requests
router.get('/',          requirePermission('workflow.read'),   ApprovalController.getApprovalRequests);
router.post('/',         requirePermission('workflow.create'), validate(createApprovalRequestSchema), ApprovalController.createApprovalRequest);
router.get('/:id',      requirePermission('workflow.read'),   ApprovalController.getApprovalRequestById);
router.put('/:id/decide', requirePermission('workflow.update'), validate(decideApprovalSchema), ApprovalController.decideApprovalRequest);

export default router;
