import { Response, NextFunction } from 'express';
import { TicketService } from '../services/ticket.service';
import { sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../middleware/auth';

export class TicketController {
  static async getTickets(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const tickets = await TicketService.getTickets(req.user!.organizationId, {
        status: req.query.status as string | undefined,
        priority: req.query.priority as string | undefined,
        assignedToId: req.query.assignedToId as string | undefined,
        q: req.query.q as string | undefined,
      });
      sendSuccess(res, tickets);
    } catch (error) { next(error); }
  }

  static async getTicketById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const ticket = await TicketService.getTicketById(req.params.id, req.user!.organizationId);
      sendSuccess(res, ticket);
    } catch (error) { next(error); }
  }

  static async createTicket(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const ticket = await TicketService.createTicket(
        req.user!.organizationId, req.user!.userId, req.body, req
      );
      sendSuccess(res, ticket, 'Ticket created successfully', 201);
    } catch (error) { next(error); }
  }

  static async updateTicket(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const ticket = await TicketService.updateTicket(
        req.params.id, req.user!.organizationId, req.user!.userId, req.body, req
      );
      sendSuccess(res, ticket, 'Ticket updated successfully');
    } catch (error) { next(error); }
  }

  static async addComment(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const comment = await TicketService.addComment(
        req.user!.organizationId, req.user!.userId, req.params.id, req.body, req
      );
      sendSuccess(res, comment, 'Comment added successfully', 201);
    } catch (error) { next(error); }
  }

  static async deleteTicket(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await TicketService.deleteTicket(
        req.params.id, req.user!.organizationId, req.user!.userId, req
      );
      sendSuccess(res, result, 'Ticket deleted successfully');
    } catch (error) { next(error); }
  }
}
