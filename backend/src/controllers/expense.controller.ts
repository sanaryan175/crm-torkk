import { Response, NextFunction } from 'express';
import { ExpenseService } from '../services/expense.service';
import { sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../middleware/auth';

export class ExpenseController {
  static async getExpenses(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const expenses = await ExpenseService.getExpenses(req.user!.organizationId, {
        category: req.query.category as string | undefined,
        from: req.query.from as string | undefined,
        to: req.query.to as string | undefined,
        status: req.query.status as string | undefined,
      });
      sendSuccess(res, expenses);
    } catch (error) { next(error); }
  }

  static async getExpenseById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const expense = await ExpenseService.getExpenseById(req.params.id, req.user!.organizationId);
      sendSuccess(res, expense);
    } catch (error) { next(error); }
  }

  static async createExpense(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const expense = await ExpenseService.createExpense(
        req.user!.organizationId, req.user!.userId, req.body, req
      );
      sendSuccess(res, expense, 'Expense created successfully', 201);
    } catch (error) { next(error); }
  }

  static async updateExpense(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const expense = await ExpenseService.updateExpense(
        req.params.id, req.user!.organizationId, req.user!.userId, req.body, req
      );
      sendSuccess(res, expense, 'Expense updated successfully');
    } catch (error) { next(error); }
  }

  static async approveExpense(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const expense = await ExpenseService.approveExpense(
        req.params.id, req.user!.organizationId, req.user!.userId, req.body, req
      );
      sendSuccess(res, expense, 'Expense approved successfully');
    } catch (error) { next(error); }
  }

  static async deleteExpense(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await ExpenseService.deleteExpense(
        req.params.id, req.user!.organizationId, req.user!.userId, req
      );
      sendSuccess(res, result, 'Expense deleted successfully');
    } catch (error) { next(error); }
  }
}
