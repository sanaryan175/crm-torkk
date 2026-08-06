import { Router } from 'express';
import { LeaveController } from '../controllers/leave.controller';
import { validate } from '../middleware/validate';
import { createLeaveSchema, updateLeaveSchema, updateLeaveStatusSchema } from '../validations/leave.validation';
import { authenticate, requirePermission } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/',          requirePermission('hr.read'),   LeaveController.getLeaves);
router.post('/',         requirePermission('hr.create'), validate(createLeaveSchema), LeaveController.createLeave);
router.get('/:id',       requirePermission('hr.read'),   LeaveController.getLeaveById);
router.put('/:id',       requirePermission('hr.update'), validate(updateLeaveSchema), LeaveController.updateLeave);
router.put('/:id/status', requirePermission('hr.update'), validate(updateLeaveStatusSchema), LeaveController.updateLeaveStatus);
router.delete('/:id',    requirePermission('hr.delete'), LeaveController.deleteLeave);

export default router;
