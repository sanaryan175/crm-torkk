import { Response, NextFunction } from 'express';
import { VendorService } from '../services/vendor.service';
import { sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../middleware/auth';

export class VendorController {
  static async getVendors(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const vendors = await VendorService.getVendors(req.user!.organizationId, {
        status: req.query.status as string | undefined,
        q: req.query.q as string | undefined,
      });
      sendSuccess(res, vendors);
    } catch (error) { next(error); }
  }

  static async getVendorById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const vendor = await VendorService.getVendorById(req.params.id, req.user!.organizationId);
      sendSuccess(res, vendor);
    } catch (error) { next(error); }
  }

  static async createVendor(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const vendor = await VendorService.createVendor(
        req.user!.organizationId, req.user!.userId, req.body, req
      );
      sendSuccess(res, vendor, 'Vendor created successfully', 201);
    } catch (error) { next(error); }
  }

  static async updateVendor(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const vendor = await VendorService.updateVendor(
        req.params.id, req.user!.organizationId, req.user!.userId, req.body, req
      );
      sendSuccess(res, vendor, 'Vendor updated successfully');
    } catch (error) { next(error); }
  }

  static async deleteVendor(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await VendorService.deleteVendor(
        req.params.id, req.user!.organizationId, req.user!.userId, req
      );
      sendSuccess(res, result, 'Vendor deleted successfully');
    } catch (error) { next(error); }
  }
}
