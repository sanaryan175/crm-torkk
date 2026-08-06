import { Response, NextFunction } from 'express';
import { ApprovalService } from '../services/approval.service';
import { sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../middleware/auth';

export class ApprovalController {
  // ─── Approval Flows ──────────────────────────────────────────────────────────

  static async getApprovalFlows(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const flows = await ApprovalService.getApprovalFlows(req.user!.organizationId);
      sendSuccess(res, flows);
    } catch (error) { next(error); }
  }

  static async getApprovalFlowById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const flow = await ApprovalService.getApprovalFlowById(req.params.id, req.user!.organizationId);
      sendSuccess(res, flow);
    } catch (error) { next(error); }
  }

  static async createApprovalFlow(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const flow = await ApprovalService.createApprovalFlow(
        req.user!.organizationId, req.user!.userId, req.body, req
      );
      sendSuccess(res, flow, 'Approval flow created successfully', 201);
    } catch (error) { next(error); }
  }

  static async updateApprovalFlow(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const flow = await ApprovalService.updateApprovalFlow(
        req.params.id, req.user!.organizationId, req.user!.userId, req.body, req
      );
      sendSuccess(res, flow, 'Approval flow updated successfully');
    } catch (error) { next(error); }
  }

  static async deleteApprovalFlow(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await ApprovalService.deleteApprovalFlow(
        req.params.id, req.user!.organizationId, req.user!.userId, req
      );
      sendSuccess(res, result, 'Approval flow deleted successfully');
    } catch (error) { next(error); }
  }

  // ─── Approval Requests ────────────────────────────────────────────────────────

  static async getApprovalRequests(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const requests = await ApprovalService.getApprovalRequests(req.user!.organizationId, {
        status: req.query.status as string | undefined,
        requestedById: req.query.requestedById as string | undefined,
      });
      sendSuccess(res, requests);
    } catch (error) { next(error); }
  }

  static async getApprovalRequestById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const request = await ApprovalService.getApprovalRequestById(req.params.id, req.user!.organizationId);
      sendSuccess(res, request);
    } catch (error) { next(error); }
  }

  static async createApprovalRequest(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const request = await ApprovalService.createApprovalRequest(
        req.user!.organizationId, req.user!.userId, req.body, req
      );
      sendSuccess(res, request, 'Approval request created successfully', 201);
    } catch (error) { next(error); }
  }

  static async decideApprovalRequest(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const request = await ApprovalService.decideApprovalRequest(
        req.params.id, req.user!.organizationId, req.user!.userId, req.body, req
      );
      sendSuccess(res, request, 'Approval request decided successfully');
    } catch (error) { next(error); }
  }
}
