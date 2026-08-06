import { Response, NextFunction } from 'express';
import { AssetMaintenanceService } from '../services/assetmaintenance.service';
import { sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../middleware/auth';

export class AssetMaintenanceController {
  static async getAssetMaintenances(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const maintenances = await AssetMaintenanceService.getAssetMaintenances(
        req.user!.organizationId,
        {
          assetId: req.query.assetId as string | undefined,
          status: req.query.status as string | undefined,
        }
      );
      sendSuccess(res, maintenances);
    } catch (error) { next(error); }
  }

  static async getAssetMaintenanceById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const maintenance = await AssetMaintenanceService.getAssetMaintenanceById(
        req.params.id, req.user!.organizationId
      );
      sendSuccess(res, maintenance);
    } catch (error) { next(error); }
  }

  static async createAssetMaintenance(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const maintenance = await AssetMaintenanceService.createAssetMaintenance(
        req.user!.organizationId, req.user!.userId, req.body, req
      );
      sendSuccess(res, maintenance, 'Maintenance record created successfully', 201);
    } catch (error) { next(error); }
  }

  static async updateAssetMaintenance(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const maintenance = await AssetMaintenanceService.updateAssetMaintenance(
        req.params.id, req.user!.organizationId, req.user!.userId, req.body, req
      );
      sendSuccess(res, maintenance, 'Maintenance record updated successfully');
    } catch (error) { next(error); }
  }

  static async deleteAssetMaintenance(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await AssetMaintenanceService.deleteAssetMaintenance(
        req.params.id, req.user!.organizationId, req.user!.userId, req
      );
      sendSuccess(res, result, 'Maintenance record deleted successfully');
    } catch (error) { next(error); }
  }
}
