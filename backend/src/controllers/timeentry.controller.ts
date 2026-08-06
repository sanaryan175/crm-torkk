import { Response, NextFunction } from 'express';
import { TimeEntryService } from '../services/timeentry.service';
import { sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../middleware/auth';

export class TimeEntryController {
  static async getTimeEntries(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const entries = await TimeEntryService.getTimeEntries(req.user!.organizationId, {
        projectId: req.query.projectId as string | undefined,
        taskId: req.query.taskId as string | undefined,
        userId: req.query.userId as string | undefined,
        from: req.query.from as string | undefined,
        to: req.query.to as string | undefined,
      });
      sendSuccess(res, entries);
    } catch (error) { next(error); }
  }

  static async getTimeEntryById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const entry = await TimeEntryService.getTimeEntryById(req.params.id, req.user!.organizationId);
      sendSuccess(res, entry);
    } catch (error) { next(error); }
  }

  static async createTimeEntry(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const entry = await TimeEntryService.createTimeEntry(
        req.user!.organizationId, req.user!.userId, req.body, req
      );
      sendSuccess(res, entry, 'Time entry created successfully', 201);
    } catch (error) { next(error); }
  }

  static async updateTimeEntry(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const entry = await TimeEntryService.updateTimeEntry(
        req.params.id, req.user!.organizationId, req.user!.userId, req.body, req
      );
      sendSuccess(res, entry, 'Time entry updated successfully');
    } catch (error) { next(error); }
  }

  static async deleteTimeEntry(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await TimeEntryService.deleteTimeEntry(
        req.params.id, req.user!.organizationId, req.user!.userId, req
      );
      sendSuccess(res, result, 'Time entry deleted successfully');
    } catch (error) { next(error); }
  }
}
