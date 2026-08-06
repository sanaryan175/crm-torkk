import { Response, NextFunction } from 'express';
import { BrandService } from '../services/brand.service';
import { sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../middleware/auth';

export class BrandController {
  static async listBrands(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const brands = await BrandService.listBrands(req.user!.organizationId);
      sendSuccess(res, brands);
    } catch (error) { next(error); }
  }

  static async getBrandById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const brand = await BrandService.getBrandById(req.params.id, req.user!.organizationId);
      sendSuccess(res, brand);
    } catch (error) { next(error); }
  }

  static async createBrand(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const brand = await BrandService.createBrand(
        req.user!.organizationId, req.user!.userId, req.body, req
      );
      sendSuccess(res, brand, 'Brand created successfully', 201);
    } catch (error) { next(error); }
  }

  static async updateBrand(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const brand = await BrandService.updateBrand(
        req.params.id, req.user!.organizationId, req.user!.userId, req.body, req
      );
      sendSuccess(res, brand, 'Brand updated successfully');
    } catch (error) { next(error); }
  }

  static async deleteBrand(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await BrandService.deleteBrand(
        req.params.id, req.user!.organizationId, req.user!.userId, req
      );
      sendSuccess(res, result, 'Brand deleted successfully');
    } catch (error) { next(error); }
  }
}
