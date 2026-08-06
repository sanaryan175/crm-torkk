import { Response, NextFunction } from 'express';
import { BranchService } from '../services/branch.service';
import { sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../middleware/auth';

export class BranchController {
  static async listBranches(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const branches = await BranchService.listBranches(
        req.user!.organizationId,
        req.query.brandId as string | undefined
      );
      sendSuccess(res, branches);
    } catch (error) { next(error); }
  }

  static async getBranchById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const branch = await BranchService.getBranchById(req.params.id, req.user!.organizationId);
      sendSuccess(res, branch);
    } catch (error) { next(error); }
  }

  static async createBranch(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const branch = await BranchService.createBranch(
        req.user!.organizationId, req.user!.userId, req.body, req
      );
      sendSuccess(res, branch, 'Branch created successfully', 201);
    } catch (error) { next(error); }
  }

  static async updateBranch(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const branch = await BranchService.updateBranch(
        req.params.id, req.user!.organizationId, req.user!.userId, req.body, req
      );
      sendSuccess(res, branch, 'Branch updated successfully');
    } catch (error) { next(error); }
  }

  static async deleteBranch(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await BranchService.deleteBranch(
        req.params.id, req.user!.organizationId, req.user!.userId, req
      );
      sendSuccess(res, result, 'Branch deleted successfully');
    } catch (error) { next(error); }
  }
}
