import { Response, NextFunction } from 'express';
import { DepartmentService } from '../services/department.service';
import { sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../middleware/auth';

export class DepartmentController {
  static async getDepartments(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const departments = await DepartmentService.getDepartments(req.user!.organizationId);
      sendSuccess(res, departments);
    } catch (error) { next(error); }
  }

  static async getDepartmentById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const department = await DepartmentService.getDepartmentById(req.params.id, req.user!.organizationId);
      sendSuccess(res, department);
    } catch (error) { next(error); }
  }

  static async createDepartment(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const department = await DepartmentService.createDepartment(
        req.user!.organizationId, req.user!.userId, req.body, req
      );
      sendSuccess(res, department, 'Department created successfully', 201);
    } catch (error) { next(error); }
  }

  static async updateDepartment(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const department = await DepartmentService.updateDepartment(
        req.params.id, req.user!.organizationId, req.user!.userId, req.body, req
      );
      sendSuccess(res, department, 'Department updated successfully');
    } catch (error) { next(error); }
  }

  static async deleteDepartment(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await DepartmentService.deleteDepartment(
        req.params.id, req.user!.organizationId, req.user!.userId, req
      );
      sendSuccess(res, result, 'Department deleted successfully');
    } catch (error) { next(error); }
  }
}
