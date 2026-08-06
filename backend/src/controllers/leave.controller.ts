import { Response, NextFunction } from 'express';
import { LeaveService } from '../services/leave.service';
import { sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../middleware/auth';

export class LeaveController {
  static async getLeaves(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const leaves = await LeaveService.getLeaves(req.user!.organizationId, {
        employeeId: req.query.employeeId as string | undefined,
        status: req.query.status as string | undefined,
      });
      sendSuccess(res, leaves);
    } catch (error) { next(error); }
  }

  static async getLeaveById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const leave = await LeaveService.getLeaveById(req.params.id, req.user!.organizationId);
      sendSuccess(res, leave);
    } catch (error) { next(error); }
  }

  static async createLeave(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const leave = await LeaveService.createLeave(
        req.user!.organizationId, req.user!.userId, req.body, req
      );
      sendSuccess(res, leave, 'Leave request created successfully', 201);
    } catch (error) { next(error); }
  }

  static async updateLeave(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const leave = await LeaveService.updateLeave(
        req.params.id, req.user!.organizationId, req.user!.userId, req.body, req
      );
      sendSuccess(res, leave, 'Leave request updated successfully');
    } catch (error) { next(error); }
  }

  static async updateLeaveStatus(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const leave = await LeaveService.updateLeaveStatus(
        req.params.id, req.user!.organizationId, req.user!.userId, req.body, req
      );
      sendSuccess(res, leave, 'Leave status updated successfully');
    } catch (error) { next(error); }
  }

  static async deleteLeave(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await LeaveService.deleteLeave(
        req.params.id, req.user!.organizationId, req.user!.userId, req
      );
      sendSuccess(res, result, 'Leave request deleted successfully');
    } catch (error) { next(error); }
  }
}
