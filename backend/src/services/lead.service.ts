import prisma from '../config/db';
import { NotFoundError } from '../utils/errors';
import { LeadStatus, DealStage } from '@prisma/client';
import { AuditService } from './audit.service';

const LEAD_INCLUDE = {
  assignedTo: { select: { id: true, name: true, email: true, avatar: true } },
};

export class LeadService {
  private static async ensureAssignableUser(organizationId: string, assignedToId?: string | null) {
    if (!assignedToId) return;
    const user = await prisma.user.findFirst({
      where: { id: assignedToId, organizationId, isActive: true },
    });
    if (!user) throw new NotFoundError('Assigned user not found');
  }

  static async getLeads(
    organizationId: string,
    filters?: { status?: string; source?: string; q?: string }
  ) {
    const where: any = { organizationId };
    if (filters?.status) where.status = filters.status;
    if (filters?.source) where.source = filters.source;
    if (filters?.q) {
      where.OR = [
        { firstName: { contains: filters.q, mode: 'insensitive' } },
        { lastName: { contains: filters.q, mode: 'insensitive' } },
        { email: { contains: filters.q, mode: 'insensitive' } },
        { company: { contains: filters.q, mode: 'insensitive' } },
      ];
    }
    return prisma.lead.findMany({ where, include: LEAD_INCLUDE, orderBy: { createdAt: 'desc' } });
  }

  static async getLeadById(id: string, organizationId: string) {
    const lead = await prisma.lead.findFirst({
      where: { id, organizationId },
      include: LEAD_INCLUDE,
    });
    if (!lead) throw new NotFoundError('Lead not found');
    return lead;
  }

  static async createLead(
    organizationId: string,
    createdById: string,
    data: {
      firstName: string; lastName: string; email?: string | null; phone?: string | null;
      company?: string | null; jobTitle?: string | null; source?: any; status?: any;
      tags?: string[]; value?: number | null; notes?: string | null; assignedToId?: string | null;
    },
    req?: any
  ) {
    await this.ensureAssignableUser(organizationId, data.assignedToId);
    const lead = await prisma.lead.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email ?? '',
        phone: data.phone,
        company: data.company,
        jobTitle: data.jobTitle,
        source: data.source,
        status: data.status,
        tags: data.tags ?? [],
        value: data.value,
        notes: data.notes,
        assignedToId: data.assignedToId,
        organizationId,
        createdById,
      },
      include: LEAD_INCLUDE,
    });
    await AuditService.created(organizationId, createdById, 'lead', lead.id, undefined, req);
    return lead;
  }

  static async updateLead(
    id: string,
    organizationId: string,
    actorId: string,
    data: any,
    req?: any
  ) {
    await this.getLeadById(id, organizationId);
    await this.ensureAssignableUser(organizationId, data.assignedToId);
    if (data.contactId === '') data.contactId = null;
    const updated = await prisma.lead.update({ where: { id }, data, include: LEAD_INCLUDE });
    await AuditService.updated(organizationId, actorId, 'lead', id, data, req);
    return updated;
  }

  /**
   * Convert a lead into a Contact (+ optionally a Deal) and mark the lead converted.
   */
  static async convertLead(
    id: string,
    organizationId: string,
    actorId: string,
    data: { status?: string; contactId?: string | null; dealTitle?: string | null; dealValue?: number | null },
    req?: any
  ) {
    const lead = await this.getLeadById(id, organizationId);

    let contactId = data.contactId ?? lead.convertedContactId;
    if (!contactId) {
      const contact = await prisma.contact.create({
        data: {
          firstName: lead.firstName,
          lastName: lead.lastName,
          email: lead.email,
          phone: lead.phone,
          company: lead.company,
          jobTitle: lead.jobTitle,
          status: 'active',
          source: 'other',
          tags: lead.tags,
          notes: lead.notes,
          assignedToId: lead.assignedToId,
          organizationId,
          createdById: actorId,
        },
      });
      contactId = contact.id;
    }

    let dealId = lead.convertedDealId;
    if (data.dealTitle) {
      const deal = await prisma.deal.create({
        data: {
          title: data.dealTitle,
          contactId,
          company: lead.company,
          value: data.dealValue ?? lead.value ?? 0,
          stage: DealStage.new,
          assignedToId: lead.assignedToId,
          organizationId,
          createdById: actorId,
        },
      });
      dealId = deal.id;
    }

    const updated = await prisma.lead.update({
      where: { id },
      data: {
        status: LeadStatus.converted,
        convertedContactId: contactId,
        convertedDealId: dealId,
      },
      include: LEAD_INCLUDE,
    });

    await prisma.customerTimeline.create({
      data: {
        organizationId,
        contactId: contactId || undefined,
        dealId: dealId || undefined,
        type: 'system',
        title: `Lead "${lead.firstName} ${lead.lastName}" converted`,
        content: data.dealTitle ? `Deal "${data.dealTitle}" created` : 'Contact created from lead',
        createdById: actorId,
      },
    });

    await AuditService.log({
      organizationId, userId: actorId, action: 'update', resource: 'lead', resourceId: id,
      metadata: { action: 'convert', contactId, dealId },
      ipAddress: req?.ip, userAgent: req?.headers?.['user-agent'] as string,
    });

    return updated;
  }

  static async deleteLead(id: string, organizationId: string, actorId: string, req?: any) {
    await this.getLeadById(id, organizationId);
    await prisma.lead.delete({ where: { id } });
    await AuditService.deleted(organizationId, actorId, 'lead', id, undefined, req);
    return { success: true };
  }
}
