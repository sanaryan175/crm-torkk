import { Router } from 'express';
import { ExpenseController } from '../controllers/expense.controller';
import { validate } from '../middleware/validate';
import { createExpenseSchema, updateExpenseSchema, approveExpenseSchema } from '../validations/expense.validation';
import { authenticate, requirePermission } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/',              requirePermission('finance.read'),   ExpenseController.getExpenses);
router.post('/',             requirePermission('finance.create'), validate(createExpenseSchema),  ExpenseController.createExpense);
router.get('/:id',           requirePermission('finance.read'),   ExpenseController.getExpenseById);
router.put('/:id',           requirePermission('finance.update'), validate(updateExpenseSchema),  ExpenseController.updateExpense);
router.put('/:id/approve',   requirePermission('finance.update'), validate(approveExpenseSchema), ExpenseController.approveExpense);
router.delete('/:id',        requirePermission('finance.delete'), ExpenseController.deleteExpense);

export default router;
