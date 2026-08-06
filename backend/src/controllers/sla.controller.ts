import { Response, NextFunction } from 'express';
import { SlaPolicyService } from '../services/sla.service';
import { sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../middleware/auth';

export class SlaPolicyController {
  static async getSlaPolicies(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const policies = await SlaPolicyService.getSlaPolicies(req.user!.organizationId);
      sendSuccess(res, policies);
    } catch (error) { next(error); }
  }

  static async getSlaPolicyById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const policy = await SlaPolicyService.getSlaPolicyById(req.params.id, req.user!.organizationId);
      sendSuccess(res, policy);
    } catch (error) { next(error); }
  }

  static async createSlaPolicy(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const policy = await SlaPolicyService.createSlaPolicy(
        req.user!.organizationId, req.user!.userId, req.body, req
      );
      sendSuccess(res, policy, 'SLA policy created successfully', 201);
    } catch (error) { next(error); }
  }

  static async updateSlaPolicy(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const policy = await SlaPolicyService.updateSlaPolicy(
        req.params.id, req.user!.organizationId, req.user!.userId, req.body, req
      );
      sendSuccess(res, policy, 'SLA policy updated successfully');
    } catch (error) { next(error); }
  }

  static async deleteSlaPolicy(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await SlaPolicyService.deleteSlaPolicy(
        req.params.id, req.user!.organizationId, req.user!.userId, req
      );
      sendSuccess(res, result, 'SLA policy deleted successfully');
    } catch (error) { next(error); }
  }
}
