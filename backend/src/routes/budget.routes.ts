import { Router } from 'express';
import { BudgetController } from '../controllers/budget.controller';
import { validate } from '../middleware/validate';
import { createBudgetSchema, updateBudgetSchema } from '../validations/budget.validation';
import { authenticate, requirePermission } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/',        requirePermission('finance.read'),   BudgetController.getBudgets);
router.post('/',       requirePermission('finance.create'), validate(createBudgetSchema),  BudgetController.createBudget);
router.get('/:id',     requirePermission('finance.read'),   BudgetController.getBudgetById);
router.put('/:id',     requirePermission('finance.update'), validate(updateBudgetSchema),  BudgetController.updateBudget);
router.delete('/:id',  requirePermission('finance.delete'), BudgetController.deleteBudget);

export default router;
