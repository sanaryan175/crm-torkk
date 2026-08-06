import { Response, NextFunction } from 'express';
import { PromotionService } from '../services/promotion.service';
import { sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../middleware/auth';

export class PromotionController {
  static async getPromotions(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const promotions = await PromotionService.getPromotions(req.user!.organizationId, {
        employeeId: req.query.employeeId as string | undefined,
      });
      sendSuccess(res, promotions);
    } catch (error) { next(error); }
  }

  static async getPromotionById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const promotion = await PromotionService.getPromotionById(req.params.id, req.user!.organizationId);
      sendSuccess(res, promotion);
    } catch (error) { next(error); }
  }

  static async createPromotion(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const promotion = await PromotionService.createPromotion(
        req.user!.organizationId, req.body, req
      );
      sendSuccess(res, promotion, 'Promotion created successfully', 201);
    } catch (error) { next(error); }
  }

  static async updatePromotion(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const promotion = await PromotionService.updatePromotion(
        req.params.id, req.user!.organizationId, req.user!.userId, req.body, req
      );
      sendSuccess(res, promotion, 'Promotion updated successfully');
    } catch (error) { next(error); }
  }

  static async deletePromotion(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await PromotionService.deletePromotion(
        req.params.id, req.user!.organizationId, req.user!.userId, req
      );
      sendSuccess(res, result, 'Promotion deleted successfully');
    } catch (error) { next(error); }
  }
}
