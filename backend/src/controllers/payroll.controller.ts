import { Response, NextFunction } from 'express';
import { PayrollService } from '../services/payroll.service';
import { sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../middleware/auth';

export class PayrollController {
  static async getPayrollRuns(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const runs = await PayrollService.getPayrollRuns(req.user!.organizationId, {
        status: req.query.status as string | undefined,
        employeeId: req.query.employeeId as string | undefined,
      });
      sendSuccess(res, runs);
    } catch (error) { next(error); }
  }

  static async getPayrollRunById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const run = await PayrollService.getPayrollRunById(req.params.id, req.user!.organizationId);
      sendSuccess(res, run);
    } catch (error) { next(error); }
  }

  static async createPayrollRun(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const run = await PayrollService.createPayrollRun(
        req.user!.organizationId, req.user!.userId, req.body, req
      );
      sendSuccess(res, run, 'Payroll run created successfully', 201);
    } catch (error) { next(error); }
  }

  static async updatePayrollRun(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const run = await PayrollService.updatePayrollRun(
        req.params.id, req.user!.organizationId, req.user!.userId, req.body, req
      );
      sendSuccess(res, run, 'Payroll run updated successfully');
    } catch (error) { next(error); }
  }

  static async updatePayrollRunStatus(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const run = await PayrollService.updatePayrollRunStatus(
        req.params.id, req.user!.organizationId, req.user!.userId, req.body.status, req
      );
      sendSuccess(res, run, 'Payroll run status updated successfully');
    } catch (error) { next(error); }
  }

  static async deletePayrollRun(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await PayrollService.deletePayrollRun(
        req.params.id, req.user!.organizationId, req.user!.userId, req
      );
      sendSuccess(res, result, 'Payroll run deleted successfully');
    } catch (error) { next(error); }
  }
}
