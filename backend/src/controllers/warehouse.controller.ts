import { Response, NextFunction } from 'express';
import { WarehouseService } from '../services/warehouse.service';
import { sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../middleware/auth';

export class WarehouseController {
  static async getWarehouses(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const warehouses = await WarehouseService.getWarehouses(req.user!.organizationId);
      sendSuccess(res, warehouses);
    } catch (error) { next(error); }
  }

  static async getWarehouseById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const warehouse = await WarehouseService.getWarehouseById(req.params.id, req.user!.organizationId);
      sendSuccess(res, warehouse);
    } catch (error) { next(error); }
  }

  static async createWarehouse(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const warehouse = await WarehouseService.createWarehouse(
        req.user!.organizationId, req.user!.userId, req.body, req
      );
      sendSuccess(res, warehouse, 'Warehouse created successfully', 201);
    } catch (error) { next(error); }
  }

  static async updateWarehouse(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const warehouse = await WarehouseService.updateWarehouse(
        req.params.id, req.user!.organizationId, req.user!.userId, req.body, req
      );
      sendSuccess(res, warehouse, 'Warehouse updated successfully');
    } catch (error) { next(error); }
  }

  static async deleteWarehouse(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await WarehouseService.deleteWarehouse(
        req.params.id, req.user!.organizationId, req.user!.userId, req
      );
      sendSuccess(res, result, 'Warehouse deleted successfully');
    } catch (error) { next(error); }
  }
}
