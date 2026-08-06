import { Response, NextFunction } from 'express';
import { SubscriptionService } from '../services/subscription.service';
import { sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../middleware/auth';

export class SubscriptionController {
  static async getSubscription(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const subscription = await SubscriptionService.getSubscription(req.user!.organizationId);
      sendSuccess(res, subscription);
    } catch (error) { next(error); }
  }

  static async updateSubscription(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const subscription = await SubscriptionService.updateSubscription(
        req.user!.organizationId, req.user!.userId, req.body, req
      );
      sendSuccess(res, subscription, 'Subscription updated successfully');
    } catch (error) { next(error); }
  }
}
