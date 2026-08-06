import { Response, NextFunction } from 'express';
import { PurchaseRequestService } from '../services/purchaserequest.service';
import { sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../middleware/auth';

export class PurchaseRequestController {
  static async getPurchaseRequests(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const purchaseRequests = await PurchaseRequestService.getPurchaseRequests(
        req.user!.organizationId,
        {
          status: req.query.status as string | undefined,
          q: req.query.q as string | undefined,
        }
      );
      sendSuccess(res, purchaseRequests);
    } catch (error) { next(error); }
  }

  static async getPurchaseRequestById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const purchaseRequest = await PurchaseRequestService.getPurchaseRequestById(
        req.params.id, req.user!.organizationId
      );
      sendSuccess(res, purchaseRequest);
    } catch (error) { next(error); }
  }

  static async createPurchaseRequest(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const purchaseRequest = await PurchaseRequestService.createPurchaseRequest(
        req.user!.organizationId, req.user!.userId, req.body, req
      );
      sendSuccess(res, purchaseRequest, 'Purchase request created successfully', 201);
    } catch (error) { next(error); }
  }

  static async updatePurchaseRequest(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const purchaseRequest = await PurchaseRequestService.updatePurchaseRequest(
        req.params.id, req.user!.organizationId, req.user!.userId, req.body, req
      );
      sendSuccess(res, purchaseRequest, 'Purchase request updated successfully');
    } catch (error) { next(error); }
  }

  static async approvePurchaseRequest(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const purchaseRequest = await PurchaseRequestService.approvePurchaseRequest(
        req.params.id, req.user!.organizationId, req.user!.userId, req
      );
      sendSuccess(res, purchaseRequest, 'Purchase request approved successfully');
    } catch (error) { next(error); }
  }

  static async deletePurchaseRequest(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await PurchaseRequestService.deletePurchaseRequest(
        req.params.id, req.user!.organizationId, req.user!.userId, req
      );
      sendSuccess(res, result, 'Purchase request deleted successfully');
    } catch (error) { next(error); }
  }
}
