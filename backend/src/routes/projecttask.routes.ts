import { Router } from 'express';
import { ProjectTaskController } from '../controllers/projecttask.controller';
import { validate } from '../middleware/validate';
import { createProjectTaskSchema, updateProjectTaskSchema, updateProjectTaskStatusSchema } from '../validations/projecttask.validation';
import { authenticate, requirePermission } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/',            requirePermission('project.read'),   ProjectTaskController.getTasks);
router.post('/',           requirePermission('project.create'), validate(createProjectTaskSchema),         ProjectTaskController.createTask);
router.get('/:id',         requirePermission('project.read'),   ProjectTaskController.getTaskById);
router.put('/:id',         requirePermission('project.update'), validate(updateProjectTaskSchema),         ProjectTaskController.updateTask);
router.put('/:id/status',  requirePermission('project.update'), validate(updateProjectTaskStatusSchema),   ProjectTaskController.updateTaskStatus);
router.delete('/:id',      requirePermission('project.delete'), ProjectTaskController.deleteTask);

export default router;
