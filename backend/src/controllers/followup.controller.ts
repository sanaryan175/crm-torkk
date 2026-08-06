import { Response, NextFunction } from 'express';
import { FollowUpService } from '../services/followup.service';
import { sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../middleware/auth';

export class FollowUpController {
  static async getFollowUps(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const followUps = await FollowUpService.getFollowUps(req.user!.organizationId, {
        status: req.query.status as string | undefined,
        contactId: req.query.contactId as string | undefined,
        dealId: req.query.dealId as string | undefined,
        leadId: req.query.leadId as string | undefined,
      });
      sendSuccess(res, followUps);
    } catch (error) { next(error); }
  }

  static async getFollowUpById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const followUp = await FollowUpService.getFollowUpById(req.params.id, req.user!.organizationId);
      sendSuccess(res, followUp);
    } catch (error) { next(error); }
  }

  static async createFollowUp(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const followUp = await FollowUpService.createFollowUp(
        req.user!.organizationId, req.user!.userId, req.body, req
      );
      sendSuccess(res, followUp, 'Follow-up created successfully', 201);
    } catch (error) { next(error); }
  }

  static async updateFollowUp(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const followUp = await FollowUpService.updateFollowUp(
        req.params.id, req.user!.organizationId, req.user!.userId, req.body, req
      );
      sendSuccess(res, followUp, 'Follow-up updated successfully');
    } catch (error) { next(error); }
  }

  static async completeFollowUp(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const followUp = await FollowUpService.completeFollowUp(
        req.params.id, req.user!.organizationId, req.user!.userId, req.body?.notes, req
      );
      sendSuccess(res, followUp, 'Follow-up completed');
    } catch (error) { next(error); }
  }

  static async deleteFollowUp(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await FollowUpService.deleteFollowUp(
        req.params.id, req.user!.organizationId, req.user!.userId, req
      );
      sendSuccess(res, result, 'Follow-up deleted successfully');
    } catch (error) { next(error); }
  }
}
