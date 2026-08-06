import { Response, NextFunction } from 'express';
import { AppNotificationService } from '../services/appnotification.service';
import { sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../middleware/auth';

export class AppNotificationController {
  static async getNotifications(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const notifications = await AppNotificationService.getNotifications(
        req.user!.organizationId, req.user!.userId
      );
      sendSuccess(res, notifications);
    } catch (error) { next(error); }
  }

  static async markRead(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await AppNotificationService.markRead(
        req.user!.organizationId, req.user!.userId, req.body, req
      );
      sendSuccess(res, result, 'Notification marked as read');
    } catch (error) { next(error); }
  }

  static async deleteNotification(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await AppNotificationService.deleteNotification(
        req.params.id, req.user!.organizationId, req.user!.userId, req
      );
      sendSuccess(res, result, 'Notification deleted successfully');
    } catch (error) { next(error); }
  }
}
