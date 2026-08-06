import { Response, NextFunction } from 'express';
import { ProductCategoryService } from '../services/productcategory.service';
import { sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../middleware/auth';

export class ProductCategoryController {
  static async getProductCategories(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const categories = await ProductCategoryService.getProductCategories(req.user!.organizationId);
      sendSuccess(res, categories);
    } catch (error) { next(error); }
  }

  static async getProductCategoryById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const category = await ProductCategoryService.getProductCategoryById(req.params.id, req.user!.organizationId);
      sendSuccess(res, category);
    } catch (error) { next(error); }
  }

  static async createProductCategory(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const category = await ProductCategoryService.createProductCategory(
        req.user!.organizationId, req.user!.userId, req.body, req
      );
      sendSuccess(res, category, 'Product category created successfully', 201);
    } catch (error) { next(error); }
  }

  static async updateProductCategory(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const category = await ProductCategoryService.updateProductCategory(
        req.params.id, req.user!.organizationId, req.user!.userId, req.body, req
      );
      sendSuccess(res, category, 'Product category updated successfully');
    } catch (error) { next(error); }
  }

  static async deleteProductCategory(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await ProductCategoryService.deleteProductCategory(
        req.params.id, req.user!.organizationId, req.user!.userId, req
      );
      sendSuccess(res, result, 'Product category deleted successfully');
    } catch (error) { next(error); }
  }
}
