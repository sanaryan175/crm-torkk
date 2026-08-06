import { Response, NextFunction } from 'express';
import { SalesTargetService } from '../services/salestarget.service';
import { sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../middleware/auth';

export class SalesTargetController {
  static async getSalesTargets(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const targets = await SalesTargetService.getSalesTargets(req.user!.organizationId);
      sendSuccess(res, targets);
    } catch (error) { next(error); }
  }

  static async getSalesTargetById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const target = await SalesTargetService.getSalesTargetById(req.params.id, req.user!.organizationId);
      sendSuccess(res, target);
    } catch (error) { next(error); }
  }

  static async createSalesTarget(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const target = await SalesTargetService.createSalesTarget(
        req.user!.organizationId, req.user!.userId, req.body, req
      );
      sendSuccess(res, target, 'Sales target created successfully', 201);
    } catch (error) { next(error); }
  }

  static async updateSalesTarget(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const target = await SalesTargetService.updateSalesTarget(
        req.params.id, req.user!.organizationId, req.user!.userId, req.body, req
      );
      sendSuccess(res, target, 'Sales target updated successfully');
    } catch (error) { next(error); }
  }

  static async deleteSalesTarget(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await SalesTargetService.deleteSalesTarget(
        req.params.id, req.user!.organizationId, req.user!.userId, req
      );
      sendSuccess(res, result, 'Sales target deleted successfully');
    } catch (error) { next(error); }
  }
}
