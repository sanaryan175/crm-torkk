import { Response, NextFunction } from 'express';
import { AnnouncementService } from '../services/announcement.service';
import { sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../middleware/auth';

export class AnnouncementController {
  static async getAnnouncements(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const announcements = await AnnouncementService.getAnnouncements(req.user!.organizationId);
      sendSuccess(res, announcements);
    } catch (error) { next(error); }
  }

  static async getAnnouncementById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const announcement = await AnnouncementService.getAnnouncementById(req.params.id, req.user!.organizationId);
      sendSuccess(res, announcement);
    } catch (error) { next(error); }
  }

  static async createAnnouncement(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const announcement = await AnnouncementService.createAnnouncement(
        req.user!.organizationId, req.user!.userId, req.body, req
      );
      sendSuccess(res, announcement, 'Announcement created successfully', 201);
    } catch (error) { next(error); }
  }

  static async updateAnnouncement(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const announcement = await AnnouncementService.updateAnnouncement(
        req.params.id, req.user!.organizationId, req.user!.userId, req.body, req
      );
      sendSuccess(res, announcement, 'Announcement updated successfully');
    } catch (error) { next(error); }
  }

  static async deleteAnnouncement(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await AnnouncementService.deleteAnnouncement(
        req.params.id, req.user!.organizationId, req.user!.userId, req
      );
      sendSuccess(res, result, 'Announcement deleted successfully');
    } catch (error) { next(error); }
  }
}
