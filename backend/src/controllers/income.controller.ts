import { Response, NextFunction } from 'express';
import { IncomeService } from '../services/income.service';
import { sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../middleware/auth';

export class IncomeController {
  static async getIncomes(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const incomes = await IncomeService.getIncomes(req.user!.organizationId, {
        category: req.query.category as string | undefined,
        from: req.query.from as string | undefined,
        to: req.query.to as string | undefined,
      });
      sendSuccess(res, incomes);
    } catch (error) { next(error); }
  }

  static async getIncomeById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const income = await IncomeService.getIncomeById(req.params.id, req.user!.organizationId);
      sendSuccess(res, income);
    } catch (error) { next(error); }
  }

  static async createIncome(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const income = await IncomeService.createIncome(
        req.user!.organizationId, req.user!.userId, req.body, req
      );
      sendSuccess(res, income, 'Income created successfully', 201);
    } catch (error) { next(error); }
  }

  static async updateIncome(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const income = await IncomeService.updateIncome(
        req.params.id, req.user!.organizationId, req.user!.userId, req.body, req
      );
      sendSuccess(res, income, 'Income updated successfully');
    } catch (error) { next(error); }
  }

  static async deleteIncome(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await IncomeService.deleteIncome(
        req.params.id, req.user!.organizationId, req.user!.userId, req
      );
      sendSuccess(res, result, 'Income deleted successfully');
    } catch (error) { next(error); }
  }
}
