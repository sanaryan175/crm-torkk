import { Response, NextFunction } from 'express';
import { CouponService } from '../services/coupon.service';
import { sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../middleware/auth';

export class CouponController {
  static async getCoupons(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const coupons = await CouponService.getCoupons(req.user!.organizationId);
      sendSuccess(res, coupons);
    } catch (error) { next(error); }
  }

  static async getCouponById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const coupon = await CouponService.getCouponById(req.params.id, req.user!.organizationId);
      sendSuccess(res, coupon);
    } catch (error) { next(error); }
  }

  static async createCoupon(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const coupon = await CouponService.createCoupon(
        req.user!.organizationId, req.user!.userId, req.body, req
      );
      sendSuccess(res, coupon, 'Coupon created successfully', 201);
    } catch (error) { next(error); }
  }

  static async updateCoupon(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const coupon = await CouponService.updateCoupon(
        req.params.id, req.user!.organizationId, req.user!.userId, req.body, req
      );
      sendSuccess(res, coupon, 'Coupon updated successfully');
    } catch (error) { next(error); }
  }

  static async deleteCoupon(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await CouponService.deleteCoupon(
        req.params.id, req.user!.organizationId, req.user!.userId, req
      );
      sendSuccess(res, result, 'Coupon deleted successfully');
    } catch (error) { next(error); }
  }

  static async validateCoupon(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await CouponService.validateCoupon(req.user!.organizationId, req.body.code);
      sendSuccess(res, result);
    } catch (error) { next(error); }
  }
}
