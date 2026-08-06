import { Router } from 'express';
import { PerformanceReviewController } from '../controllers/performance.controller';
import { validate } from '../middleware/validate';
import { createPerformanceReviewSchema, updatePerformanceReviewSchema, submitPerformanceReviewSchema } from '../validations/performance.validation';
import { authenticate, requirePermission } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/',          requirePermission('hr.read'),     PerformanceReviewController.getPerformanceReviews);
router.post('/',         requirePermission('hr.create'),   validate(createPerformanceReviewSchema),  PerformanceReviewController.createPerformanceReview);
router.get('/:id',       requirePermission('hr.read'),     PerformanceReviewController.getPerformanceReviewById);
router.put('/:id',       requirePermission('hr.update'),   validate(updatePerformanceReviewSchema),  PerformanceReviewController.updatePerformanceReview);
router.put('/:id/submit',requirePermission('hr.update'),   validate(submitPerformanceReviewSchema),  PerformanceReviewController.submitPerformanceReview);
router.delete('/:id',    requirePermission('hr.delete'),   PerformanceReviewController.deletePerformanceReview);

export default router;
