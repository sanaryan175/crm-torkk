import { Response, NextFunction } from 'express';
import { TaxRateService } from '../services/taxrate.service';
import { sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../middleware/auth';

export class TaxRateController {
  static async getTaxRates(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const taxRates = await TaxRateService.getTaxRates(req.user!.organizationId);
      sendSuccess(res, taxRates);
    } catch (error) { next(error); }
  }

  static async getTaxRateById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const taxRate = await TaxRateService.getTaxRateById(req.params.id, req.user!.organizationId);
      sendSuccess(res, taxRate);
    } catch (error) { next(error); }
  }

  static async createTaxRate(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const taxRate = await TaxRateService.createTaxRate(
        req.user!.organizationId, req.user!.userId, req.body, req
      );
      sendSuccess(res, taxRate, 'Tax rate created successfully', 201);
    } catch (error) { next(error); }
  }

  static async updateTaxRate(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const taxRate = await TaxRateService.updateTaxRate(
        req.params.id, req.user!.organizationId, req.user!.userId, req.body, req
      );
      sendSuccess(res, taxRate, 'Tax rate updated successfully');
    } catch (error) { next(error); }
  }

  static async deleteTaxRate(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await TaxRateService.deleteTaxRate(
        req.params.id, req.user!.organizationId, req.user!.userId, req
      );
      sendSuccess(res, result, 'Tax rate deleted successfully');
    } catch (error) { next(error); }
  }
}
