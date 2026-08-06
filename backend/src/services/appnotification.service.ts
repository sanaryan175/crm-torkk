import prisma from '../config/db';
import { NotFoundError, BadRequestError } from '../utils/errors';
import { AuditService } from './audit.service';

interface MarkReadData {
  id?: string;
  all?: boolean;
}

export class AppNotificationService {
  static async getNotifications(organizationId: string, userId: string) {
    return prisma.appNotification.findMany({
      where: { organizationId, userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async markRead(organizationId: string, userId: string, data: MarkReadData, req?: any) {
    if (data.all) {
      const result = await prisma.appNotification.updateMany({
        where: { organizationId, userId, readAt: null },
        data: { readAt: new Date() },
      });
      await AuditService.updated(
        organizationId, userId, 'app_notification', 'all',
        { action: 'mark_all_read', count: result.count }, req
      );
      return { success: true, count: result.count };
    }

    if (!data.id) throw new BadRequestError('Provide an id or set all to true');

    const notification = await prisma.appNotification.findFirst({
      where: { id: data.id, organizationId, userId },
    });
    if (!notification) throw new NotFoundError('Notification not found');

    const updated = await prisma.appNotification.update({
      where: { id: data.id },
      data: { readAt: new Date() },
    });
    await AuditService.updated(organizationId, userId, 'app_notification', data.id, undefined, req);
    return updated;
  }

  static async deleteNotification(id: string, organizationId: string, userId: string, req?: any) {
    const notification = await prisma.appNotification.findFirst({
      where: { id, organizationId, userId },
    });
    if (!notification) throw new NotFoundError('Notification not found');
    await prisma.appNotification.delete({ where: { id } });
    await AuditService.deleted(organizationId, userId, 'app_notification', id, undefined, req);
    return { success: true };
  }
}
