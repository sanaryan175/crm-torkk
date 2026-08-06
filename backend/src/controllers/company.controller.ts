import { Response, NextFunction } from 'express';
import { CompanyService } from '../services/company.service';
import { sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../middleware/auth';

export class CompanyController {
  static async getCompanies(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const companies = await CompanyService.getCompanies(
        req.user!.organizationId, req.query.q as string | undefined
      );
      sendSuccess(res, companies);
    } catch (error) { next(error); }
  }

  static async getCompanyById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const company = await CompanyService.getCompanyById(req.params.id, req.user!.organizationId);
      sendSuccess(res, company);
    } catch (error) { next(error); }
  }

  static async createCompany(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const company = await CompanyService.createCompany(
        req.user!.organizationId, req.user!.userId, req.body, req
      );
      sendSuccess(res, company, 'Company created successfully', 201);
    } catch (error) { next(error); }
  }

  static async updateCompany(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const company = await CompanyService.updateCompany(
        req.params.id, req.user!.organizationId, req.user!.userId, req.body, req
      );
      sendSuccess(res, company, 'Company updated successfully');
    } catch (error) { next(error); }
  }

  static async deleteCompany(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await CompanyService.deleteCompany(
        req.params.id, req.user!.organizationId, req.user!.userId, req
      );
      sendSuccess(res, result, 'Company deleted successfully');
    } catch (error) { next(error); }
  }
}
