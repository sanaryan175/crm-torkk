import { Router } from 'express';
import { EmployeeController } from '../controllers/employee.controller';
import { validate } from '../middleware/validate';
import { createEmployeeSchema, updateEmployeeSchema } from '../validations/employee.validation';
import { authenticate, requirePermission } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/',    requirePermission('hr.read'),   EmployeeController.getEmployees);
router.post('/',   requirePermission('hr.create'), validate(createEmployeeSchema), EmployeeController.createEmployee);
router.get('/:id', requirePermission('hr.read'),   EmployeeController.getEmployeeById);
router.put('/:id', requirePermission('hr.update'), validate(updateEmployeeSchema), EmployeeController.updateEmployee);
router.delete('/:id', requirePermission('hr.delete'), EmployeeController.deleteEmployee);

export default router;
