import { Response, NextFunction } from 'express';
import { JobPostingService } from '../services/jobposting.service';
import { sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../middleware/auth';

export class JobPostingController {
  static async getJobPostings(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const postings = await JobPostingService.getJobPostings(req.user!.organizationId, {
        status: req.query.status as string | undefined,
        department: req.query.department as string | undefined,
      });
      sendSuccess(res, postings);
    } catch (error) { next(error); }
  }

  static async getJobPostingById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const posting = await JobPostingService.getJobPostingById(req.params.id, req.user!.organizationId);
      sendSuccess(res, posting);
    } catch (error) { next(error); }
  }

  static async createJobPosting(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const posting = await JobPostingService.createJobPosting(
        req.user!.organizationId, req.user!.userId, req.body, req
      );
      sendSuccess(res, posting, 'Job posting created successfully', 201);
    } catch (error) { next(error); }
  }

  static async updateJobPosting(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const posting = await JobPostingService.updateJobPosting(
        req.params.id, req.user!.organizationId, req.user!.userId, req.body, req
      );
      sendSuccess(res, posting, 'Job posting updated successfully');
    } catch (error) { next(error); }
  }

  static async publishJobPosting(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const posting = await JobPostingService.publishJobPosting(
        req.params.id, req.user!.organizationId, req.user!.userId, req.body.status, req
      );
      sendSuccess(res, posting, 'Job posting status updated successfully');
    } catch (error) { next(error); }
  }

  static async deleteJobPosting(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await JobPostingService.deleteJobPosting(
        req.params.id, req.user!.organizationId, req.user!.userId, req
      );
      sendSuccess(res, result, 'Job posting deleted successfully');
    } catch (error) { next(error); }
  }
}
