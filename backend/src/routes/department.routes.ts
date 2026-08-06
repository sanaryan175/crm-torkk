import { Router } from 'express';
import { DepartmentController } from '../controllers/department.controller';
import { validate } from '../middleware/validate';
import { createDepartmentSchema, updateDepartmentSchema } from '../validations/department.validation';
import { authenticate, requirePermission } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/',    requirePermission('hr.read'),   DepartmentController.getDepartments);
router.post('/',   requirePermission('hr.create'), validate(createDepartmentSchema), DepartmentController.createDepartment);
router.get('/:id', requirePermission('hr.read'),   DepartmentController.getDepartmentById);
router.put('/:id', requirePermission('hr.update'), validate(updateDepartmentSchema), DepartmentController.updateDepartment);
router.delete('/:id', requirePermission('hr.delete'), DepartmentController.deleteDepartment);

export default router;
