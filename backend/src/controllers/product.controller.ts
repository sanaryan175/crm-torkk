import { Response, NextFunction } from 'express';
import { ProductService } from '../services/product.service';
import { sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../middleware/auth';

export class ProductController {
  static async getProducts(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const products = await ProductService.getProducts(req.user!.organizationId, {
        categoryId: req.query.categoryId as string | undefined,
        q: req.query.q as string | undefined,
        lowStock: req.query.lowStock as string | undefined,
      });
      sendSuccess(res, products);
    } catch (error) { next(error); }
  }

  static async getProductById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const product = await ProductService.getProductById(req.params.id, req.user!.organizationId);
      sendSuccess(res, product);
    } catch (error) { next(error); }
  }

  static async createProduct(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const product = await ProductService.createProduct(
        req.user!.organizationId, req.user!.userId, req.body, req
      );
      sendSuccess(res, product, 'Product created successfully', 201);
    } catch (error) { next(error); }
  }

  static async updateProduct(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const product = await ProductService.updateProduct(
        req.params.id, req.user!.organizationId, req.user!.userId, req.body, req
      );
      sendSuccess(res, product, 'Product updated successfully');
    } catch (error) { next(error); }
  }

  static async deleteProduct(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await ProductService.deleteProduct(
        req.params.id, req.user!.organizationId, req.user!.userId, req
      );
      sendSuccess(res, result, 'Product deleted successfully');
    } catch (error) { next(error); }
  }
}
