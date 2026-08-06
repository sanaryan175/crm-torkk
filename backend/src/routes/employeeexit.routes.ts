import { Router } from 'express';
import { EmployeeExitController } from '../controllers/employeeexit.controller';
import { validate } from '../middleware/validate';
import { createEmployeeExitSchema, updateEmployeeExitSchema } from '../validations/employeeexit.validation';
import { authenticate, requirePermission } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/',    requirePermission('hr.read'),   EmployeeExitController.getEmployeeExits);
router.post('/',   requirePermission('hr.create'), validate(createEmployeeExitSchema), EmployeeExitController.createEmployeeExit);
router.get('/:id', requirePermission('hr.read'),   EmployeeExitController.getEmployeeExitById);
router.put('/:id', requirePermission('hr.update'), validate(updateEmployeeExitSchema), EmployeeExitController.updateEmployeeExit);
router.delete('/:id', requirePermission('hr.delete'), EmployeeExitController.deleteEmployeeExit);

export default router;
