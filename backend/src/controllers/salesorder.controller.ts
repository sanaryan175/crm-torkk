import { Response, NextFunction } from 'express';
import { SalesOrderService } from '../services/salesorder.service';
import { sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../middleware/auth';

export class SalesOrderController {
  static async getSalesOrders(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const orders = await SalesOrderService.getSalesOrders(req.user!.organizationId, {
        status: req.query.status as string | undefined,
        contactId: req.query.contactId as string | undefined,
      });
      sendSuccess(res, orders);
    } catch (error) { next(error); }
  }

  static async getSalesOrderById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const order = await SalesOrderService.getSalesOrderById(req.params.id, req.user!.organizationId);
      sendSuccess(res, order);
    } catch (error) { next(error); }
  }

  static async createSalesOrder(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const order = await SalesOrderService.createSalesOrder(
        req.user!.organizationId, req.user!.userId, req.body, req
      );
      sendSuccess(res, order, 'Sales order created successfully', 201);
    } catch (error) { next(error); }
  }

  static async updateSalesOrder(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const order = await SalesOrderService.updateSalesOrder(
        req.params.id, req.user!.organizationId, req.user!.userId, req.body, req
      );
      sendSuccess(res, order, 'Sales order updated successfully');
    } catch (error) { next(error); }
  }

  static async deleteSalesOrder(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await SalesOrderService.deleteSalesOrder(
        req.params.id, req.user!.organizationId, req.user!.userId, req
      );
      sendSuccess(res, result, 'Sales order deleted successfully');
    } catch (error) { next(error); }
  }
}
