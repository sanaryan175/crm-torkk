import { Response, NextFunction } from 'express';
import { PerformanceReviewService } from '../services/performance.service';
import { sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../middleware/auth';

export class PerformanceReviewController {
  static async getPerformanceReviews(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const reviews = await PerformanceReviewService.getPerformanceReviews(req.user!.organizationId, {
        employeeId: req.query.employeeId as string | undefined,
        period: req.query.period as string | undefined,
      });
      sendSuccess(res, reviews);
    } catch (error) { next(error); }
  }

  static async getPerformanceReviewById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const review = await PerformanceReviewService.getPerformanceReviewById(req.params.id, req.user!.organizationId);
      sendSuccess(res, review);
    } catch (error) { next(error); }
  }

  static async createPerformanceReview(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const review = await PerformanceReviewService.createPerformanceReview(
        req.user!.organizationId, req.body, req
      );
      sendSuccess(res, review, 'Performance review created successfully', 201);
    } catch (error) { next(error); }
  }

  static async updatePerformanceReview(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const review = await PerformanceReviewService.updatePerformanceReview(
        req.params.id, req.user!.organizationId, req.user!.userId, req.body, req
      );
      sendSuccess(res, review, 'Performance review updated successfully');
    } catch (error) { next(error); }
  }

  static async submitPerformanceReview(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const review = await PerformanceReviewService.submitPerformanceReview(
        req.params.id, req.user!.organizationId, req.user!.userId, req
      );
      sendSuccess(res, review, 'Performance review submitted successfully');
    } catch (error) { next(error); }
  }

  static async deletePerformanceReview(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await PerformanceReviewService.deletePerformanceReview(
        req.params.id, req.user!.organizationId, req.user!.userId, req
      );
      sendSuccess(res, result, 'Performance review deleted successfully');
    } catch (error) { next(error); }
  }
}
