import { Response, NextFunction } from 'express';
import { ApplicationService } from '../services/application.service';
import { sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../middleware/auth';

export class ApplicationController {
  static async getApplications(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const applications = await ApplicationService.getApplications(req.user!.organizationId, {
        jobPostingId: req.query.jobPostingId as string | undefined,
        status: req.query.status as string | undefined,
      });
      sendSuccess(res, applications);
    } catch (error) { next(error); }
  }

  static async getApplicationById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const application = await ApplicationService.getApplicationById(req.params.id, req.user!.organizationId);
      sendSuccess(res, application);
    } catch (error) { next(error); }
  }

  static async createApplication(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const application = await ApplicationService.createApplication(
        req.user!.organizationId, req.user!.userId, req.body, req
      );
      sendSuccess(res, application, 'Application created successfully', 201);
    } catch (error) { next(error); }
  }

  static async updateApplication(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const application = await ApplicationService.updateApplication(
        req.params.id, req.user!.organizationId, req.user!.userId, req.body, req
      );
      sendSuccess(res, application, 'Application updated successfully');
    } catch (error) { next(error); }
  }

  static async updateApplicationStatus(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const application = await ApplicationService.updateApplicationStatus(
        req.params.id, req.user!.organizationId, req.user!.userId, req.body.status, req
      );
      sendSuccess(res, application, 'Application status updated successfully');
    } catch (error) { next(error); }
  }

  static async deleteApplication(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await ApplicationService.deleteApplication(
        req.params.id, req.user!.organizationId, req.user!.userId, req
      );
      sendSuccess(res, result, 'Application deleted successfully');
    } catch (error) { next(error); }
  }
}
