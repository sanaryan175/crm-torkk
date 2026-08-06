import { Response, NextFunction } from 'express';
import { EmailTrackingService } from '../services/emailtracking.service';
import { sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../middleware/auth';

export class EmailTrackingController {
  static async getTrackings(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const trackings = await EmailTrackingService.getTrackings(req.user!.organizationId, {
        activityId: req.query.activityId as string | undefined,
        toEmail: req.query.toEmail as string | undefined,
      });
      sendSuccess(res, trackings);
    } catch (error) { next(error); }
  }

  static async createTracking(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const tracking = await EmailTrackingService.createTracking(
        req.user!.organizationId, req.user!.userId, req.body, req
      );
      sendSuccess(res, tracking, 'Email tracking created', 201);
    } catch (error) { next(error); }
  }

  static async recordOpen(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const tracking = await EmailTrackingService.recordOpen(req.params.id, req.user!.organizationId);
      sendSuccess(res, tracking);
    } catch (error) { next(error); }
  }

  static async recordClick(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const tracking = await EmailTrackingService.recordClick(req.params.id, req.user!.organizationId);
      sendSuccess(res, tracking);
    } catch (error) { next(error); }
  }

  static async deleteTracking(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await EmailTrackingService.deleteTracking(
        req.params.id, req.user!.organizationId, req.user!.userId, req
      );
      sendSuccess(res, result, 'Email tracking deleted');
    } catch (error) { next(error); }
  }
}
