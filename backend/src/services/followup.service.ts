import prisma from '../config/db';
import { NotFoundError } from '../utils/errors';
import { FollowUpStatus } from '@prisma/client';
import { AuditService } from './audit.service';

const FOLLOWUP_INCLUDE = {
  assignedTo: { select: { id: true, name: true, email: true, avatar: true } },
};

export class FollowUpService {
  static async getFollowUps(
    organizationId: string,
    filters?: { status?: string; contactId?: string; dealId?: string; leadId?: string }
  ) {
    const where: any = { organizationId };
    if (filters?.status) where.status = filters.status;
    if (filters?.contactId) where.contactId = filters.contactId;
    if (filters?.dealId) where.dealId = filters.dealId;
    if (filters?.leadId) where.leadId = filters.leadId;
    return prisma.followUp.findMany({ where, include: FOLLOWUP_INCLUDE, orderBy: { scheduledAt: 'asc' } });
  }

  static async getFollowUpById(id: string, organizationId: string) {
    const followUp = await prisma.followUp.findFirst({
      where: { id, organizationId },
      include: FOLLOWUP_INCLUDE,
    });
    if (!followUp) throw new NotFoundError('Follow-up not found');
    return followUp;
  }

  static async createFollowUp(
    organizationId: string, createdById: string,
    data: { contactId?: string | null; dealId?: string | null; leadId?: string | null;
      title: string; notes?: string | null; scheduledAt: string; assignedToId?: string | null },
    req?: any
  ) {
    const followUp = await prisma.followUp.create({
      data: {
        contactId: data.contactId,
        dealId: data.dealId,
        leadId: data.leadId,
        title: data.title,
        notes: data.notes,
        scheduledAt: new Date(data.scheduledAt),
        assignedToId: data.assignedToId,
        organizationId,
        createdById,
      },
      include: FOLLOWUP_INCLUDE,
    });
    await AuditService.created(organizationId, createdById, 'followup', followUp.id, undefined, req);
    return followUp;
  }

  static async updateFollowUp(id: string, organizationId: string, actorId: string, data: any, req?: any) {
    await this.getFollowUpById(id, organizationId);
    if (data.scheduledAt) data.scheduledAt = new Date(data.scheduledAt);
    const updated = await prisma.followUp.update({ where: { id }, data, include: FOLLOWUP_INCLUDE });
    await AuditService.updated(organizationId, actorId, 'followup', id, data, req);
    return updated;
  }

  static async completeFollowUp(id: string, organizationId: string, actorId: string, notes?: string | null, req?: any) {
    await this.getFollowUpById(id, organizationId);
    const updated = await prisma.followUp.update({
      where: { id },
      data: { status: FollowUpStatus.done, completedAt: new Date(), notes: notes ?? undefined },
      include: FOLLOWUP_INCLUDE,
    });
    await AuditService.log({
      organizationId, userId: actorId, action: 'update', resource: 'followup', resourceId: id,
      metadata: { action: 'complete' }, ipAddress: req?.ip, userAgent: req?.headers?.['user-agent'] as string,
    });
    return updated;
  }

  static async deleteFollowUp(id: string, organizationId: string, actorId: string, req?: any) {
    await this.getFollowUpById(id, organizationId);
    await prisma.followUp.delete({ where: { id } });
    await AuditService.deleted(organizationId, actorId, 'followup', id, undefined, req);
    return { success: true };
  }
}
