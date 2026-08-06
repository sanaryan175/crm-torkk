import { Response, NextFunction } from 'express';
import { CommissionService } from '../services/commission.service';
import { sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../middleware/auth';

export class CommissionController {
  static async getCommissions(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const commissions = await CommissionService.getCommissions(req.user!.organizationId, {
        userId: req.query.userId as string | undefined,
      });
      sendSuccess(res, commissions);
    } catch (error) { next(error); }
  }

  static async getCommissionById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const commission = await CommissionService.getCommissionById(req.params.id, req.user!.organizationId);
      sendSuccess(res, commission);
    } catch (error) { next(error); }
  }
}
