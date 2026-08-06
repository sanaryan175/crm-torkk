import prisma from '../config/db';
import { NotFoundError } from '../utils/errors';
import { AuditService } from './audit.service';

export class EmailTrackingService {
  static async getTrackings(
    organizationId: string,
    filters?: { activityId?: string; toEmail?: string }
  ) {
    const where: any = { organizationId };
    if (filters?.activityId) where.activityId = filters.activityId;
    if (filters?.toEmail) where.toEmail = filters.toEmail;
    return prisma.emailTracking.findMany({ where, orderBy: { sentAt: 'desc' } });
  }

  static async createTracking(organizationId: string, actorId: string, data: any, req?: any) {
    const tracking = await prisma.emailTracking.create({
      data: {
        activityId: data.activityId,
        toEmail: data.toEmail,
        subject: data.subject,
        metadata: data.metadata,
        organizationId,
      },
    });
    await AuditService.created(organizationId, actorId, 'emailtracking', tracking.id, undefined, req);
    return tracking;
  }

  static async recordOpen(id: string, organizationId: string) {
    const tracking = await prisma.emailTracking.findFirst({ where: { id, organizationId } });
    if (!tracking) throw new NotFoundError('Email tracking not found');
    return prisma.emailTracking.update({
      where: { id },
      data: { openedAt: tracking.openedAt ?? new Date(), openedCount: { increment: 1 } },
    });
  }

  static async recordClick(id: string, organizationId: string) {
    const tracking = await prisma.emailTracking.findFirst({ where: { id, organizationId } });
    if (!tracking) throw new NotFoundError('Email tracking not found');
    return prisma.emailTracking.update({ where: { id }, data: { clickedCount: { increment: 1 } } });
  }

  static async deleteTracking(id: string, organizationId: string, actorId: string, req?: any) {
    const tracking = await prisma.emailTracking.findFirst({ where: { id, organizationId } });
    if (!tracking) throw new NotFoundError('Email tracking not found');
    await prisma.emailTracking.delete({ where: { id } });
    await AuditService.deleted(organizationId, actorId, 'emailtracking', id, undefined, req);
    return { success: true };
  }
}
