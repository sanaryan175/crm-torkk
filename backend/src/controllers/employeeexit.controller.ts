import { Response, NextFunction } from 'express';
import { EmployeeExitService } from '../services/employeeexit.service';
import { sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../middleware/auth';

export class EmployeeExitController {
  static async getEmployeeExits(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const exits = await EmployeeExitService.getEmployeeExits(req.user!.organizationId, {
        employeeId: req.query.employeeId as string | undefined,
      });
      sendSuccess(res, exits);
    } catch (error) { next(error); }
  }

  static async getEmployeeExitById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const exit = await EmployeeExitService.getEmployeeExitById(req.params.id, req.user!.organizationId);
      sendSuccess(res, exit);
    } catch (error) { next(error); }
  }

  static async createEmployeeExit(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const exit = await EmployeeExitService.createEmployeeExit(
        req.user!.organizationId, req.user!.userId, req.body, req
      );
      sendSuccess(res, exit, 'Employee exit created successfully', 201);
    } catch (error) { next(error); }
  }

  static async updateEmployeeExit(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const exit = await EmployeeExitService.updateEmployeeExit(
        req.params.id, req.user!.organizationId, req.user!.userId, req.body, req
      );
      sendSuccess(res, exit, 'Employee exit updated successfully');
    } catch (error) { next(error); }
  }

  static async deleteEmployeeExit(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await EmployeeExitService.deleteEmployeeExit(
        req.params.id, req.user!.organizationId, req.user!.userId, req
      );
      sendSuccess(res, result, 'Employee exit deleted successfully');
    } catch (error) { next(error); }
  }
}
