import { Response, NextFunction } from 'express';
import { BankAccountService } from '../services/bankaccount.service';
import { sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../middleware/auth';

export class BankAccountController {
  static async getBankAccounts(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const accounts = await BankAccountService.getBankAccounts(req.user!.organizationId);
      sendSuccess(res, accounts);
    } catch (error) { next(error); }
  }

  static async getBankAccountById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const account = await BankAccountService.getBankAccountById(req.params.id, req.user!.organizationId);
      sendSuccess(res, account);
    } catch (error) { next(error); }
  }

  static async getBankAccountTransactions(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const transactions = await BankAccountService.getBankAccountTransactions(
        req.params.id, req.user!.organizationId
      );
      sendSuccess(res, transactions);
    } catch (error) { next(error); }
  }

  static async createBankAccount(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const account = await BankAccountService.createBankAccount(
        req.user!.organizationId, req.user!.userId, req.body, req
      );
      sendSuccess(res, account, 'Bank account created successfully', 201);
    } catch (error) { next(error); }
  }

  static async updateBankAccount(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const account = await BankAccountService.updateBankAccount(
        req.params.id, req.user!.organizationId, req.user!.userId, req.body, req
      );
      sendSuccess(res, account, 'Bank account updated successfully');
    } catch (error) { next(error); }
  }

  static async deleteBankAccount(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await BankAccountService.deleteBankAccount(
        req.params.id, req.user!.organizationId, req.user!.userId, req
      );
      sendSuccess(res, result, 'Bank account deleted successfully');
    } catch (error) { next(error); }
  }
}
