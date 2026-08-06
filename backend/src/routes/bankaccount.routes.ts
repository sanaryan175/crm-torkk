import { Router } from 'express';
import { BankAccountController } from '../controllers/bankaccount.controller';
import { validate } from '../middleware/validate';
import { createBankAccountSchema, updateBankAccountSchema } from '../validations/bankaccount.validation';
import { authenticate, requirePermission } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/',                    requirePermission('finance.read'),   BankAccountController.getBankAccounts);
router.post('/',                   requirePermission('finance.create'), validate(createBankAccountSchema),  BankAccountController.createBankAccount);
router.get('/:id',                 requirePermission('finance.read'),   BankAccountController.getBankAccountById);
router.get('/:id/transactions',    requirePermission('finance.read'),   BankAccountController.getBankAccountTransactions);
router.put('/:id',                 requirePermission('finance.update'), validate(updateBankAccountSchema),  BankAccountController.updateBankAccount);
router.delete('/:id',              requirePermission('finance.delete'), BankAccountController.deleteBankAccount);

export default router;
