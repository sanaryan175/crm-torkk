import { Response, NextFunction } from 'express';
import { ReferralService } from '../services/referral.service';
import { sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../middleware/auth';

export class ReferralController {
  static async getReferrals(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const referrals = await ReferralService.getReferrals(req.user!.organizationId);
      sendSuccess(res, referrals);
    } catch (error) { next(error); }
  }

  static async getReferralById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const referral = await ReferralService.getReferralById(req.params.id, req.user!.organizationId);
      sendSuccess(res, referral);
    } catch (error) { next(error); }
  }

  static async createReferral(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const referral = await ReferralService.createReferral(
        req.user!.organizationId, req.user!.userId, req.body, req
      );
      sendSuccess(res, referral, 'Referral created successfully', 201);
    } catch (error) { next(error); }
  }

  static async updateReferral(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const referral = await ReferralService.updateReferral(
        req.params.id, req.user!.organizationId, req.user!.userId, req.body, req
      );
      sendSuccess(res, referral, 'Referral updated successfully');
    } catch (error) { next(error); }
  }

  static async deleteReferral(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await ReferralService.deleteReferral(
        req.params.id, req.user!.organizationId, req.user!.userId, req
      );
      sendSuccess(res, result, 'Referral deleted successfully');
    } catch (error) { next(error); }
  }
}
