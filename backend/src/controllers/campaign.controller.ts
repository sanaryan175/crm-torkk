import { Response, NextFunction } from 'express';
import { CampaignService } from '../services/campaign.service';
import { sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../middleware/auth';

export class CampaignController {
  static async getCampaigns(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const campaigns = await CampaignService.getCampaigns(req.user!.organizationId);
      sendSuccess(res, campaigns);
    } catch (error) { next(error); }
  }

  static async getCampaignById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const campaign = await CampaignService.getCampaignById(req.params.id, req.user!.organizationId);
      sendSuccess(res, campaign);
    } catch (error) { next(error); }
  }

  static async createCampaign(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const campaign = await CampaignService.createCampaign(
        req.user!.organizationId, req.user!.userId, req.body, req
      );
      sendSuccess(res, campaign, 'Campaign created successfully', 201);
    } catch (error) { next(error); }
  }

  static async updateCampaign(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const campaign = await CampaignService.updateCampaign(
        req.params.id, req.user!.organizationId, req.user!.userId, req.body, req
      );
      sendSuccess(res, campaign, 'Campaign updated successfully');
    } catch (error) { next(error); }
  }

  static async sendCampaign(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const campaign = await CampaignService.sendCampaign(
        req.params.id, req.user!.organizationId, req.user!.userId, req.body.recipients, req
      );
      sendSuccess(res, campaign, 'Campaign sent successfully');
    } catch (error) { next(error); }
  }

  static async deleteCampaign(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await CampaignService.deleteCampaign(
        req.params.id, req.user!.organizationId, req.user!.userId, req
      );
      sendSuccess(res, result, 'Campaign deleted successfully');
    } catch (error) { next(error); }
  }
}
