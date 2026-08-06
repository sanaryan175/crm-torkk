import { Response, NextFunction } from 'express';
import { InterviewService } from '../services/interview.service';
import { sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../middleware/auth';

export class InterviewController {
  static async getInterviews(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const interviews = await InterviewService.getInterviews(req.user!.organizationId, {
        applicationId: req.query.applicationId as string | undefined,
        interviewerId: req.query.interviewerId as string | undefined,
      });
      sendSuccess(res, interviews);
    } catch (error) { next(error); }
  }

  static async getInterviewById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const interview = await InterviewService.getInterviewById(req.params.id, req.user!.organizationId);
      sendSuccess(res, interview);
    } catch (error) { next(error); }
  }

  static async createInterview(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const interview = await InterviewService.createInterview(
        req.user!.organizationId, req.body, req
      );
      sendSuccess(res, interview, 'Interview created successfully', 201);
    } catch (error) { next(error); }
  }

  static async updateInterview(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const interview = await InterviewService.updateInterview(
        req.params.id, req.user!.organizationId, req.user!.userId, req.body, req
      );
      sendSuccess(res, interview, 'Interview updated successfully');
    } catch (error) { next(error); }
  }

  static async updateInterviewResult(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const interview = await InterviewService.updateInterviewResult(
        req.params.id, req.user!.organizationId, req.user!.userId, req.body.result, req
      );
      sendSuccess(res, interview, 'Interview result updated successfully');
    } catch (error) { next(error); }
  }

  static async deleteInterview(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await InterviewService.deleteInterview(
        req.params.id, req.user!.organizationId, req.user!.userId, req
      );
      sendSuccess(res, result, 'Interview deleted successfully');
    } catch (error) { next(error); }
  }
}
