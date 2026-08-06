import { Response, NextFunction } from 'express';
import { InvoiceService } from '../services/invoice.service';
import { sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../middleware/auth';

export class InvoiceController {
  static async getInvoices(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const invoices = await InvoiceService.getInvoices(req.user!.organizationId, {
        status: req.query.status as string | undefined,
        contactId: req.query.contactId as string | undefined,
      });
      sendSuccess(res, invoices);
    } catch (error) { next(error); }
  }

  static async getInvoiceById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const invoice = await InvoiceService.getInvoiceById(req.params.id, req.user!.organizationId);
      sendSuccess(res, invoice);
    } catch (error) { next(error); }
  }

  static async createInvoice(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const invoice = await InvoiceService.createInvoice(
        req.user!.organizationId, req.user!.userId, req.body, req
      );
      sendSuccess(res, invoice, 'Invoice created successfully', 201);
    } catch (error) { next(error); }
  }

  static async updateInvoice(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const invoice = await InvoiceService.updateInvoice(
        req.params.id, req.user!.organizationId, req.user!.userId, req.body, req
      );
      sendSuccess(res, invoice, 'Invoice updated successfully');
    } catch (error) { next(error); }
  }

  static async sendInvoice(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const invoice = await InvoiceService.sendInvoice(
        req.params.id, req.user!.organizationId, req.user!.userId, req
      );
      sendSuccess(res, invoice, 'Invoice sent successfully');
    } catch (error) { next(error); }
  }

  static async recordPayment(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const payment = await InvoiceService.recordPayment(
        req.params.id, req.user!.organizationId, req.user!.userId, req.body, req
      );
      sendSuccess(res, payment, 'Payment recorded successfully', 201);
    } catch (error) { next(error); }
  }

  static async deleteInvoice(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await InvoiceService.deleteInvoice(
        req.params.id, req.user!.organizationId, req.user!.userId, req
      );
      sendSuccess(res, result, 'Invoice deleted successfully');
    } catch (error) { next(error); }
  }

  static async getPayments(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const payments = await InvoiceService.getPayments(req.user!.organizationId, {
        status: req.query.status as string | undefined,
        contactId: req.query.contactId as string | undefined,
      });
      sendSuccess(res, payments);
    } catch (error) { next(error); }
  }

  static async getPaymentById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const payment = await InvoiceService.getPaymentById(req.params.id, req.user!.organizationId);
      sendSuccess(res, payment);
    } catch (error) { next(error); }
  }
}
