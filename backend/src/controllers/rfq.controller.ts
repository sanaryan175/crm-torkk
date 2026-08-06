import { Response, NextFunction } from 'express';
import { RfqService } from '../services/rfq.service';
import { sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../middleware/auth';

export class RfqController {
  static async getRfqs(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const rfqs = await RfqService.getRfqs(req.user!.organizationId, {
        status: req.query.status as string | undefined,
      });
      sendSuccess(res, rfqs);
    } catch (error) { next(error); }
  }

  static async getRfqById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const rfq = await RfqService.getRfqById(req.params.id, req.user!.organizationId);
      sendSuccess(res, rfq);
    } catch (error) { next(error); }
  }

  static async createRfq(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const rfq = await RfqService.createRfq(
        req.user!.organizationId, req.user!.userId, req.body, req
      );
      sendSuccess(res, rfq, 'RFQ created successfully', 201);
    } catch (error) { next(error); }
  }

  static async updateRfq(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const rfq = await RfqService.updateRfq(
        req.params.id, req.user!.organizationId, req.user!.userId, req.body, req
      );
      sendSuccess(res, rfq, 'RFQ updated successfully');
    } catch (error) { next(error); }
  }

  static async deleteRfq(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await RfqService.deleteRfq(
        req.params.id, req.user!.organizationId, req.user!.userId, req
      );
      sendSuccess(res, result, 'RFQ deleted successfully');
    } catch (error) { next(error); }
  }
}
