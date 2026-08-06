import { Router } from 'express';
import { EmployeeDocumentController } from '../controllers/employeedocument.controller';
import { validate } from '../middleware/validate';
import { createEmployeeDocumentSchema, updateEmployeeDocumentSchema } from '../validations/employeedocument.validation';
import { authenticate, requirePermission } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/',    requirePermission('hr.read'),   EmployeeDocumentController.getEmployeeDocuments);
router.post('/',   requirePermission('hr.create'), validate(createEmployeeDocumentSchema), EmployeeDocumentController.createEmployeeDocument);
router.get('/:id', requirePermission('hr.read'),   EmployeeDocumentController.getEmployeeDocumentById);
router.put('/:id', requirePermission('hr.update'), validate(updateEmployeeDocumentSchema), EmployeeDocumentController.updateEmployeeDocument);
router.delete('/:id', requirePermission('hr.delete'), EmployeeDocumentController.deleteEmployeeDocument);

export default router;
