import { Router } from 'express';
import { JobPostingController } from '../controllers/jobposting.controller';
import { validate } from '../middleware/validate';
import { createJobPostingSchema, updateJobPostingSchema, publishJobPostingSchema } from '../validations/jobposting.validation';
import { authenticate, requirePermission } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/',            requirePermission('hr.read'),     JobPostingController.getJobPostings);
router.post('/',           requirePermission('hr.create'),   validate(createJobPostingSchema),     JobPostingController.createJobPosting);
router.get('/:id',         requirePermission('hr.read'),     JobPostingController.getJobPostingById);
router.put('/:id',         requirePermission('hr.update'),   validate(updateJobPostingSchema),     JobPostingController.updateJobPosting);
router.put('/:id/publish', requirePermission('hr.update'),   validate(publishJobPostingSchema),    JobPostingController.publishJobPosting);
router.delete('/:id',      requirePermission('hr.delete'),   JobPostingController.deleteJobPosting);

export default router;
