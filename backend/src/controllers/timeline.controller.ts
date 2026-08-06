import { Response, NextFunction } from 'express';
import { TimelineService } from '../services/timeline.service';
import { sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../middleware/auth';

export class TimelineController {
  static async getTimeline(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const entries = await TimelineService.getTimeline(req.user!.organizationId, {
        contactId: req.query.contactId as string | undefined,
        dealId: req.query.dealId as string | undefined,
        companyId: req.query.companyId as string | undefined,
      });
      sendSuccess(res, entries);
    } catch (error) { next(error); }
  }

  static async createTimelineEntry(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const entry = await TimelineService.createTimelineEntry(
        req.user!.organizationId, req.user!.userId, req.body, req
      );
      sendSuccess(res, entry, 'Timeline entry created', 201);
    } catch (error) { next(error); }
  }

  static async deleteTimelineEntry(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await TimelineService.deleteTimelineEntry(
        req.params.id, req.user!.organizationId, req.user!.userId, req
      );
      sendSuccess(res, result, 'Timeline entry deleted');
    } catch (error) { next(error); }
  }
}
