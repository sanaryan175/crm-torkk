import { Router } from 'express';
import { InterviewController } from '../controllers/interview.controller';
import { validate } from '../middleware/validate';
import { createInterviewSchema, updateInterviewSchema, updateInterviewResultSchema } from '../validations/interview.validation';
import { authenticate, requirePermission } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/',          requirePermission('hr.read'),     InterviewController.getInterviews);
router.post('/',         requirePermission('hr.create'),   validate(createInterviewSchema),        InterviewController.createInterview);
router.get('/:id',       requirePermission('hr.read'),     InterviewController.getInterviewById);
router.put('/:id',       requirePermission('hr.update'),   validate(updateInterviewSchema),        InterviewController.updateInterview);
router.put('/:id/result',requirePermission('hr.update'),   validate(updateInterviewResultSchema),  InterviewController.updateInterviewResult);
router.delete('/:id',    requirePermission('hr.delete'),   InterviewController.deleteInterview);

export default router;
