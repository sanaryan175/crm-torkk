import { Response, NextFunction } from 'express';
import { BudgetService } from '../services/budget.service';
import { sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../middleware/auth';

export class BudgetController {
  static async getBudgets(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const budgets = await BudgetService.getBudgets(req.user!.organizationId);
      sendSuccess(res, budgets);
    } catch (error) { next(error); }
  }

  static async getBudgetById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const budget = await BudgetService.getBudgetById(req.params.id, req.user!.organizationId);
      sendSuccess(res, budget);
    } catch (error) { next(error); }
  }

  static async createBudget(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const budget = await BudgetService.createBudget(
        req.user!.organizationId, req.user!.userId, req.body, req
      );
      sendSuccess(res, budget, 'Budget created successfully', 201);
    } catch (error) { next(error); }
  }

  static async updateBudget(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const budget = await BudgetService.updateBudget(
        req.params.id, req.user!.organizationId, req.user!.userId, req.body, req
      );
      sendSuccess(res, budget, 'Budget updated successfully');
    } catch (error) { next(error); }
  }

  static async deleteBudget(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await BudgetService.deleteBudget(
        req.params.id, req.user!.organizationId, req.user!.userId, req
      );
      sendSuccess(res, result, 'Budget deleted successfully');
    } catch (error) { next(error); }
  }
}
