import { Response, NextFunction } from 'express';
import { LeadService } from '../services/lead.service';
import { sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../middleware/auth';

export class LeadController {
  static async getLeads(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const leads = await LeadService.getLeads(req.user!.organizationId, {
        status: req.query.status as string | undefined,
        source: req.query.source as string | undefined,
        q: req.query.q as string | undefined,
      });
      sendSuccess(res, leads);
    } catch (error) { next(error); }
  }

  static async getLeadById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const lead = await LeadService.getLeadById(req.params.id, req.user!.organizationId);
      sendSuccess(res, lead);
    } catch (error) { next(error); }
  }

  static async createLead(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const lead = await LeadService.createLead(
        req.user!.organizationId, req.user!.userId, req.body, req
      );
      sendSuccess(res, lead, 'Lead created successfully', 201);
    } catch (error) { next(error); }
  }

  static async updateLead(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const lead = await LeadService.updateLead(
        req.params.id, req.user!.organizationId, req.user!.userId, req.body, req
      );
      sendSuccess(res, lead, 'Lead updated successfully');
    } catch (error) { next(error); }
  }

  static async convertLead(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const lead = await LeadService.convertLead(
        req.params.id, req.user!.organizationId, req.user!.userId, req.body, req
      );
      sendSuccess(res, lead, 'Lead converted successfully');
    } catch (error) { next(error); }
  }

  static async deleteLead(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await LeadService.deleteLead(
        req.params.id, req.user!.organizationId, req.user!.userId, req
      );
      sendSuccess(res, result, 'Lead deleted successfully');
    } catch (error) { next(error); }
  }
}
