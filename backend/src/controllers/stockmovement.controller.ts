import { Response, NextFunction } from 'express';
import { StockMovementService } from '../services/stockmovement.service';
import { sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../middleware/auth';

export class StockMovementController {
  static async getStockMovements(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const movements = await StockMovementService.getStockMovements(req.user!.organizationId, {
        productId: req.query.productId as string | undefined,
        warehouseId: req.query.warehouseId as string | undefined,
        type: req.query.type as string | undefined,
      });
      sendSuccess(res, movements);
    } catch (error) { next(error); }
  }

  static async getStockMovementById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const movement = await StockMovementService.getStockMovementById(req.params.id, req.user!.organizationId);
      sendSuccess(res, movement);
    } catch (error) { next(error); }
  }

  static async createStockMovement(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const movement = await StockMovementService.createStockMovement(
        req.user!.organizationId, req.user!.userId, req.body, req
      );
      sendSuccess(res, movement, 'Stock movement created successfully', 201);
    } catch (error) { next(error); }
  }

  static async deleteStockMovement(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await StockMovementService.deleteStockMovement(
        req.params.id, req.user!.organizationId, req.user!.userId, req
      );
      sendSuccess(res, result, 'Stock movement deleted successfully');
    } catch (error) { next(error); }
  }
}
