import prisma from '../config/db';
import { NotFoundError } from '../utils/errors';
import { TicketStatus, TicketPriority } from '@prisma/client';
import { AuditService } from './audit.service';

const TICKET_INCLUDE = {
  assignedTo: { select: { id: true, name: true, email: true, avatar: true } },
  comments: { orderBy: { createdAt: 'asc' as const } },
};

export class TicketService {
  private static generateTicketNumber(): string {
    return `TCK-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`.toUpperCase();
  }

  private static async ensureAssignableUser(organizationId: string, assignedToId?: string | null) {
    if (!assignedToId) return;
    const user = await prisma.user.findFirst({
      where: { id: assignedToId, organizationId, isActive: true },
    });
    if (!user) throw new NotFoundError('Assigned user not found');
  }

  static async getTickets(
    organizationId: string,
    filters?: { status?: string; priority?: string; assignedToId?: string; q?: string }
  ) {
    const where: any = { organizationId };
    if (filters?.status) where.status = filters.status;
    if (filters?.priority) where.priority = filters.priority;
    if (filters?.assignedToId) where.assignedToId = filters.assignedToId;
    if (filters?.q) {
      where.OR = [
        { subject: { contains: filters.q, mode: 'insensitive' } },
        { description: { contains: filters.q, mode: 'insensitive' } },
        { customerName: { contains: filters.q, mode: 'insensitive' } },
        { customerEmail: { contains: filters.q, mode: 'insensitive' } },
      ];
    }
    return prisma.ticket.findMany({ where, include: TICKET_INCLUDE, orderBy: { createdAt: 'desc' } });
  }

  static async getTicketById(id: string, organizationId: string) {
    const ticket = await prisma.ticket.findFirst({
      where: { id, organizationId },
      include: TICKET_INCLUDE,
    });
    if (!ticket) throw new NotFoundError('Ticket not found');
    return ticket;
  }

  static async createTicket(
    organizationId: string,
    createdById: string,
    data: {
      subject: string; description?: string | null; status?: any; priority?: any;
      contactId?: string | null; customerName?: string | null; customerEmail?: string | null;
      assignedToId?: string | null; slaDueAt?: string | null; tags?: string[];
    },
    req?: any
  ) {
    await this.ensureAssignableUser(organizationId, data.assignedToId);
    const ticket = await prisma.ticket.create({
      data: {
        ticketNumber: this.generateTicketNumber(),
        subject: data.subject,
        description: data.description,
        status: data.status ?? TicketStatus.open,
        priority: data.priority ?? TicketPriority.medium,
        contactId: data.contactId,
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        assignedToId: data.assignedToId,
        slaDueAt: data.slaDueAt ? new Date(data.slaDueAt) : undefined,
        tags: data.tags ?? [],
        organizationId,
        createdById,
      },
      include: TICKET_INCLUDE,
    });
    await AuditService.created(organizationId, createdById, 'ticket', ticket.id, undefined, req);
    return ticket;
  }

  static async updateTicket(id: string, organizationId: string, actorId: string, data: any, req?: any) {
    await this.getTicketById(id, organizationId);
    await this.ensureAssignableUser(organizationId, data.assignedToId);
    if (data.contactId === '') data.contactId = null;
    if (data.assignedToId === '') data.assignedToId = null;
    if (data.slaDueAt !== undefined && data.slaDueAt !== null) data.slaDueAt = new Date(data.slaDueAt);
    const updated = await prisma.ticket.update({ where: { id }, data, include: TICKET_INCLUDE });
    await AuditService.updated(organizationId, actorId, 'ticket', id, data, req);
    return updated;
  }

  static async addComment(
    organizationId: string,
    authorId: string,
    ticketId: string,
    data: { content: string; isInternal?: boolean },
    req?: any
  ) {
    const ticket = await prisma.ticket.findFirst({ where: { id: ticketId, organizationId } });
    if (!ticket) throw new NotFoundError('Ticket not found');
    const comment = await prisma.ticketComment.create({
      data: {
        ticketId,
        organizationId,
        authorId,
        content: data.content,
        isInternal: data.isInternal ?? false,
      },
    });
    await AuditService.created(organizationId, authorId, 'ticketComment', comment.id, { ticketId }, req);
    return comment;
  }

  static async deleteTicket(id: string, organizationId: string, actorId: string, req?: any) {
    await this.getTicketById(id, organizationId);
    await prisma.ticket.delete({ where: { id } });
    await AuditService.deleted(organizationId, actorId, 'ticket', id, undefined, req);
    return { success: true };
  }
}
