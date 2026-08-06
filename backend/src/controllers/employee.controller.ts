import { Response, NextFunction } from 'express';
import { EmployeeService } from '../services/employee.service';
import { sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../middleware/auth';

export class EmployeeController {
  static async getEmployees(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const employees = await EmployeeService.getEmployees(req.user!.organizationId, {
        departmentId: req.query.departmentId as string | undefined,
        status: req.query.status as string | undefined,
        q: req.query.q as string | undefined,
      });
      sendSuccess(res, employees);
    } catch (error) { next(error); }
  }

  static async getEmployeeById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const employee = await EmployeeService.getEmployeeById(req.params.id, req.user!.organizationId);
      sendSuccess(res, employee);
    } catch (error) { next(error); }
  }

  static async createEmployee(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const employee = await EmployeeService.createEmployee(
        req.user!.organizationId, req.user!.userId, req.body, req
      );
      sendSuccess(res, employee, 'Employee created successfully', 201);
    } catch (error) { next(error); }
  }

  static async updateEmployee(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const employee = await EmployeeService.updateEmployee(
        req.params.id, req.user!.organizationId, req.user!.userId, req.body, req
      );
      sendSuccess(res, employee, 'Employee updated successfully');
    } catch (error) { next(error); }
  }

  static async deleteEmployee(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await EmployeeService.deleteEmployee(
        req.params.id, req.user!.organizationId, req.user!.userId, req
      );
      sendSuccess(res, result, 'Employee deleted successfully');
    } catch (error) { next(error); }
  }
}
