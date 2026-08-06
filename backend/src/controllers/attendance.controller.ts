import { Response, NextFunction } from 'express';
import { AttendanceService } from '../services/attendance.service';
import { sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../middleware/auth';

export class AttendanceController {
  static async getAttendance(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const attendance = await AttendanceService.getAttendance(req.user!.organizationId, {
        employeeId: req.query.employeeId as string | undefined,
        from: req.query.from as string | undefined,
        to: req.query.to as string | undefined,
      });
      sendSuccess(res, attendance);
    } catch (error) { next(error); }
  }

  static async getAttendanceById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const attendance = await AttendanceService.getAttendanceById(req.params.id, req.user!.organizationId);
      sendSuccess(res, attendance);
    } catch (error) { next(error); }
  }

  static async createAttendance(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const attendance = await AttendanceService.createAttendance(
        req.user!.organizationId, req.user!.userId, req.body, req
      );
      sendSuccess(res, attendance, 'Attendance marked successfully', 201);
    } catch (error) { next(error); }
  }

  static async updateAttendance(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const attendance = await AttendanceService.updateAttendance(
        req.params.id, req.user!.organizationId, req.user!.userId, req.body, req
      );
      sendSuccess(res, attendance, 'Attendance updated successfully');
    } catch (error) { next(error); }
  }

  static async deleteAttendance(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await AttendanceService.deleteAttendance(
        req.params.id, req.user!.organizationId, req.user!.userId, req
      );
      sendSuccess(res, result, 'Attendance deleted successfully');
    } catch (error) { next(error); }
  }
}
