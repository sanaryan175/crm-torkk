import prisma from '../config/db';
import { NotFoundError } from '../utils/errors';
import { AuditService } from './audit.service';

export class TimelineService {
  static async getTimeline(
    organizationId: string,
    filters?: { contactId?: string; dealId?: string; companyId?: string }
  ) {
    const where: any = { organizationId };
    if (filters?.contactId) where.contactId = filters.contactId;
    if (filters?.dealId) where.dealId = filters.dealId;
    if (filters?.companyId) where.companyId = filters.companyId;
    return prisma.customerTimeline.findMany({ where, orderBy: { createdAt: 'desc' } });
  }

  static async createTimelineEntry(
    organizationId: string, createdById: string,
    data: { contactId?: string | null; dealId?: string | null; companyId?: string | null;
      type: string; title: string; content?: string | null; metadata?: any },
    req?: any
  ) {
    const entry = await prisma.customerTimeline.create({
      data: {
        contactId: data.contactId,
        dealId: data.dealId,
        companyId: data.companyId,
        type: data.type,
        title: data.title,
        content: data.content,
        metadata: data.metadata,
        organizationId,
        createdById,
      },
    });
    await AuditService.created(organizationId, createdById, 'timeline', entry.id, undefined, req);
    return entry;
  }

  static async deleteTimelineEntry(id: string, organizationId: string, actorId: string, req?: any) {
    const entry = await prisma.customerTimeline.findFirst({ where: { id, organizationId } });
    if (!entry) throw new NotFoundError('Timeline entry not found');
    await prisma.customerTimeline.delete({ where: { id } });
    await AuditService.deleted(organizationId, actorId, 'timeline', id, undefined, req);
    return { success: true };
  }
}
