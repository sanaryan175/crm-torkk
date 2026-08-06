import { Router } from 'express';
import { ProjectController } from '../controllers/project.controller';
import { validate } from '../middleware/validate';
import { createProjectSchema, updateProjectSchema, addProjectMemberSchema, createProjectMilestoneSchema, updateProjectMilestoneSchema } from '../validations/project.validation';
import { authenticate, requirePermission } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/',             requirePermission('project.read'),    ProjectController.getProjects);
router.post('/',            requirePermission('project.create'),  validate(createProjectSchema),          ProjectController.createProject);
router.get('/:id',          requirePermission('project.read'),    ProjectController.getProjectById);
router.put('/:id',          requirePermission('project.update'),  validate(updateProjectSchema),          ProjectController.updateProject);
router.post('/:id/members', requirePermission('project.update'),  validate(addProjectMemberSchema),       ProjectController.addMember);
router.delete('/:id/members/:memberId', requirePermission('project.update'), ProjectController.removeMember);
router.post('/:id/milestones',          requirePermission('project.create'), validate(createProjectMilestoneSchema), ProjectController.addMilestone);
router.put('/:id/milestones/:milestoneId', requirePermission('project.update'), validate(updateProjectMilestoneSchema), ProjectController.updateMilestone);
router.delete('/:id/milestones/:milestoneId', requirePermission('project.update'), ProjectController.deleteMilestone);
router.delete('/:id',       requirePermission('project.delete'),  ProjectController.deleteProject);

export default router;
