import { Response, NextFunction } from 'express';
import { AuditLogService } from '../services/auditlog.service';
import { sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../middleware/auth';

export class AuditLogController {
  static async getAuditLogs(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const logs = await AuditLogService.getAuditLogs(req.user!.organizationId, {
        userId: req.query.userId as string | undefined,
        resource: req.query.resource as string | undefined,
        from: req.query.from as string | undefined,
        to: req.query.to as string | undefined,
      });
      sendSuccess(res, logs);
    } catch (error) { next(error); }
  }
}
