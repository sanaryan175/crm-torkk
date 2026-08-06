import { Router } from 'express';
import { IncomeController } from '../controllers/income.controller';
import { validate } from '../middleware/validate';
import { createIncomeSchema, updateIncomeSchema } from '../validations/income.validation';
import { authenticate, requirePermission } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/',        requirePermission('finance.read'),   IncomeController.getIncomes);
router.post('/',       requirePermission('finance.create'), validate(createIncomeSchema),  IncomeController.createIncome);
router.get('/:id',     requirePermission('finance.read'),   IncomeController.getIncomeById);
router.put('/:id',     requirePermission('finance.update'), validate(updateIncomeSchema),  IncomeController.updateIncome);
router.delete('/:id',  requirePermission('finance.delete'), IncomeController.deleteIncome);

export default router;
