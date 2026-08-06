import { Response, NextFunction } from 'express';
import { PurchaseOrderService } from '../services/purchaseorder.service';
import { sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../middleware/auth';

export class PurchaseOrderController {
  static async getPurchaseOrders(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const purchaseOrders = await PurchaseOrderService.getPurchaseOrders(
        req.user!.organizationId,
        {
          vendorId: req.query.vendorId as string | undefined,
          status: req.query.status as string | undefined,
        }
      );
      sendSuccess(res, purchaseOrders);
    } catch (error) { next(error); }
  }

  static async getPurchaseOrderById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const purchaseOrder = await PurchaseOrderService.getPurchaseOrderById(
        req.params.id, req.user!.organizationId
      );
      sendSuccess(res, purchaseOrder);
    } catch (error) { next(error); }
  }

  static async createPurchaseOrder(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const purchaseOrder = await PurchaseOrderService.createPurchaseOrder(
        req.user!.organizationId, req.user!.userId, req.body, req
      );
      sendSuccess(res, purchaseOrder, 'Purchase order created successfully', 201);
    } catch (error) { next(error); }
  }

  static async updatePurchaseOrder(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const purchaseOrder = await PurchaseOrderService.updatePurchaseOrder(
        req.params.id, req.user!.organizationId, req.user!.userId, req.body, req
      );
      sendSuccess(res, purchaseOrder, 'Purchase order updated successfully');
    } catch (error) { next(error); }
  }

  static async updatePurchaseOrderStatus(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const purchaseOrder = await PurchaseOrderService.updatePurchaseOrderStatus(
        req.params.id, req.user!.organizationId, req.user!.userId, req.body.status, req
      );
      sendSuccess(res, purchaseOrder, 'Purchase order status updated successfully');
    } catch (error) { next(error); }
  }

  static async createPayment(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const payment = await PurchaseOrderService.createPayment(
        req.params.id, req.user!.organizationId, req.user!.userId, req.body, req
      );
      sendSuccess(res, payment, 'Payment recorded successfully', 201);
    } catch (error) { next(error); }
  }

  static async deletePurchaseOrder(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await PurchaseOrderService.deletePurchaseOrder(
        req.params.id, req.user!.organizationId, req.user!.userId, req
      );
      sendSuccess(res, result, 'Purchase order deleted successfully');
    } catch (error) { next(error); }
  }
}
