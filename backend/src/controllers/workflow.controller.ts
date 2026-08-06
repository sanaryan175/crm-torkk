import { Response, NextFunction } from 'express';
import { WorkflowService } from '../services/workflow.service';
import { sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../middleware/auth';

export class WorkflowController {
  // ─── Scheduled Jobs ──────────────────────────────────────────────────────────

  static async getScheduledJobs(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const jobs = await WorkflowService.getScheduledJobs(req.user!.organizationId);
      sendSuccess(res, jobs);
    } catch (error) { next(error); }
  }

  static async getScheduledJobById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const job = await WorkflowService.getScheduledJobById(req.params.id, req.user!.organizationId);
      sendSuccess(res, job);
    } catch (error) { next(error); }
  }

  static async createScheduledJob(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const job = await WorkflowService.createScheduledJob(
        req.user!.organizationId, req.user!.userId, req.body, req
      );
      sendSuccess(res, job, 'Scheduled job created successfully', 201);
    } catch (error) { next(error); }
  }

  static async updateScheduledJob(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const job = await WorkflowService.updateScheduledJob(
        req.params.id, req.user!.organizationId, req.user!.userId, req.body, req
      );
      sendSuccess(res, job, 'Scheduled job updated successfully');
    } catch (error) { next(error); }
  }

  static async deleteScheduledJob(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await WorkflowService.deleteScheduledJob(
        req.params.id, req.user!.organizationId, req.user!.userId, req
      );
      sendSuccess(res, result, 'Scheduled job deleted successfully');
    } catch (error) { next(error); }
  }

  // ─── Business Rules ──────────────────────────────────────────────────────────

  static async getBusinessRules(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const rules = await WorkflowService.getBusinessRules(req.user!.organizationId);
      sendSuccess(res, rules);
    } catch (error) { next(error); }
  }

  static async getBusinessRuleById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const rule = await WorkflowService.getBusinessRuleById(req.params.id, req.user!.organizationId);
      sendSuccess(res, rule);
    } catch (error) { next(error); }
  }

  static async createBusinessRule(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const rule = await WorkflowService.createBusinessRule(
        req.user!.organizationId, req.user!.userId, req.body, req
      );
      sendSuccess(res, rule, 'Business rule created successfully', 201);
    } catch (error) { next(error); }
  }

  static async updateBusinessRule(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const rule = await WorkflowService.updateBusinessRule(
        req.params.id, req.user!.organizationId, req.user!.userId, req.body, req
      );
      sendSuccess(res, rule, 'Business rule updated successfully');
    } catch (error) { next(error); }
  }

  static async deleteBusinessRule(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await WorkflowService.deleteBusinessRule(
        req.params.id, req.user!.organizationId, req.user!.userId, req
      );
      sendSuccess(res, result, 'Business rule deleted successfully');
    } catch (error) { next(error); }
  }
}
