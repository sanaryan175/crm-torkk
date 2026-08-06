import { Router } from 'express';
import { PayrollController } from '../controllers/payroll.controller';
import { validate } from '../middleware/validate';
import { createPayrollRunSchema, updatePayrollRunSchema, updatePayrollStatusSchema } from '../validations/payroll.validation';
import { authenticate, requirePermission } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/',             requirePermission('hr.read'),     PayrollController.getPayrollRuns);
router.post('/',            requirePermission('hr.create'),   validate(createPayrollRunSchema),     PayrollController.createPayrollRun);
router.get('/:id',          requirePermission('hr.read'),     PayrollController.getPayrollRunById);
router.put('/:id',          requirePermission('hr.update'),   validate(updatePayrollRunSchema),     PayrollController.updatePayrollRun);
router.put('/:id/status',   requirePermission('hr.update'),   validate(updatePayrollStatusSchema), PayrollController.updatePayrollRunStatus);
router.delete('/:id',       requirePermission('hr.delete'),   PayrollController.deletePayrollRun);

export default router;
