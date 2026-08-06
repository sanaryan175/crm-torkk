import { Response, NextFunction } from 'express';
import { QuoteService } from '../services/quote.service';
import { sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../middleware/auth';

export class QuoteController {
  static async getQuotes(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const quotes = await QuoteService.getQuotes(req.user!.organizationId, {
        status: req.query.status as string | undefined,
        contactId: req.query.contactId as string | undefined,
      });
      sendSuccess(res, quotes);
    } catch (error) { next(error); }
  }

  static async getQuoteById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const quote = await QuoteService.getQuoteById(req.params.id, req.user!.organizationId);
      sendSuccess(res, quote);
    } catch (error) { next(error); }
  }

  static async createQuote(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const quote = await QuoteService.createQuote(
        req.user!.organizationId, req.user!.userId, req.body, req
      );
      sendSuccess(res, quote, 'Quote created successfully', 201);
    } catch (error) { next(error); }
  }

  static async updateQuote(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const quote = await QuoteService.updateQuote(
        req.params.id, req.user!.organizationId, req.user!.userId, req.body, req
      );
      sendSuccess(res, quote, 'Quote updated successfully');
    } catch (error) { next(error); }
  }

  static async convertQuote(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const invoice = await QuoteService.convertQuote(
        req.params.id, req.user!.organizationId, req.user!.userId, req
      );
      sendSuccess(res, invoice, 'Quote converted to invoice successfully');
    } catch (error) { next(error); }
  }

  static async deleteQuote(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await QuoteService.deleteQuote(
        req.params.id, req.user!.organizationId, req.user!.userId, req
      );
      sendSuccess(res, result, 'Quote deleted successfully');
    } catch (error) { next(error); }
  }
}
