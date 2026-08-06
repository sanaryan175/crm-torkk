import { Response, NextFunction } from 'express';
import { OfferLetterService } from '../services/offerletter.service';
import { sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../middleware/auth';

export class OfferLetterController {
  static async getOfferLetters(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const letters = await OfferLetterService.getOfferLetters(req.user!.organizationId, {
        applicationId: req.query.applicationId as string | undefined,
        status: req.query.status as string | undefined,
      });
      sendSuccess(res, letters);
    } catch (error) { next(error); }
  }

  static async getOfferLetterById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const letter = await OfferLetterService.getOfferLetterById(req.params.id, req.user!.organizationId);
      sendSuccess(res, letter);
    } catch (error) { next(error); }
  }

  static async createOfferLetter(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const letter = await OfferLetterService.createOfferLetter(
        req.user!.organizationId, req.user!.userId, req.body, req
      );
      sendSuccess(res, letter, 'Offer letter created successfully', 201);
    } catch (error) { next(error); }
  }

  static async updateOfferLetter(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const letter = await OfferLetterService.updateOfferLetter(
        req.params.id, req.user!.organizationId, req.user!.userId, req.body, req
      );
      sendSuccess(res, letter, 'Offer letter updated successfully');
    } catch (error) { next(error); }
  }

  static async updateOfferLetterStatus(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const letter = await OfferLetterService.updateOfferLetterStatus(
        req.params.id, req.user!.organizationId, req.user!.userId, req.body.status, req
      );
      sendSuccess(res, letter, 'Offer letter status updated successfully');
    } catch (error) { next(error); }
  }

  static async deleteOfferLetter(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await OfferLetterService.deleteOfferLetter(
        req.params.id, req.user!.organizationId, req.user!.userId, req
      );
      sendSuccess(res, result, 'Offer letter deleted successfully');
    } catch (error) { next(error); }
  }
}
