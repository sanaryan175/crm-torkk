import { Router } from 'express';
import { TrainingController } from '../controllers/training.controller';
import { validate } from '../middleware/validate';
import { createTrainingSchema, updateTrainingSchema, enrollTrainingSchema, completeTrainingEnrollmentSchema } from '../validations/training.validation';
import { authenticate, requirePermission } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/',                          requirePermission('hr.read'),     TrainingController.getTrainings);
router.post('/',                         requirePermission('hr.create'),   validate(createTrainingSchema),            TrainingController.createTraining);
router.get('/:id',                       requirePermission('hr.read'),     TrainingController.getTrainingById);
router.put('/:id',                       requirePermission('hr.update'),   validate(updateTrainingSchema),            TrainingController.updateTraining);
router.post('/:id/enroll',               requirePermission('hr.update'),   validate(enrollTrainingSchema),            TrainingController.enrollEmployee);
router.post('/:id/enrollments/:enrollmentId/complete', requirePermission('hr.update'), validate(completeTrainingEnrollmentSchema), TrainingController.completeEnrollment);
router.delete('/:id',                    requirePermission('hr.delete'),   TrainingController.deleteTraining);

export default router;
