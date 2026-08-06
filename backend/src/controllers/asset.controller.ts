import { Response, NextFunction } from 'express';
import { AssetService } from '../services/asset.service';
import { sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../middleware/auth';

export class AssetController {
  static async getAssets(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const assets = await AssetService.getAssets(req.user!.organizationId, {
        status: req.query.status as string | undefined,
        category: req.query.category as string | undefined,
        assignedToId: req.query.assignedToId as string | undefined,
        q: req.query.q as string | undefined,
      });
      sendSuccess(res, assets);
    } catch (error) { next(error); }
  }

  static async getAssetById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const asset = await AssetService.getAssetById(req.params.id, req.user!.organizationId);
      sendSuccess(res, asset);
    } catch (error) { next(error); }
  }

  static async createAsset(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const asset = await AssetService.createAsset(
        req.user!.organizationId, req.user!.userId, req.body, req
      );
      sendSuccess(res, asset, 'Asset created successfully', 201);
    } catch (error) { next(error); }
  }

  static async updateAsset(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const asset = await AssetService.updateAsset(
        req.params.id, req.user!.organizationId, req.user!.userId, req.body, req
      );
      sendSuccess(res, asset, 'Asset updated successfully');
    } catch (error) { next(error); }
  }

  static async deleteAsset(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await AssetService.deleteAsset(
        req.params.id, req.user!.organizationId, req.user!.userId, req
      );
      sendSuccess(res, result, 'Asset deleted successfully');
    } catch (error) { next(error); }
  }
}
