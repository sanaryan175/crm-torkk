import prisma from '../config/db';
import { NotFoundError, BadRequestError } from '../utils/errors';
import { AuditService } from './audit.service';
import { NotificationHelper } from '../utils/notification.helper';

interface AnnouncementData {
  title?: string;
  content?: string;
  status?: any;
  publishedAt?: Date | null;
}

export class AnnouncementService {
  static async getAnnouncements(organizationId: string) {
    return prisma.announcement.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getAnnouncementById(id: string, organizationId: string) {
    const announcement = await prisma.announcement.findFirst({
      where: { id, organizationId },
    });
    if (!announcement) throw new NotFoundError('Announcement not found');
    return announcement;
  }

  static async createAnnouncement(
    organizationId: string,
    createdById: string,
    data: AnnouncementData,
    req?: any
  ) {
    if (!data.title || !data.content) throw new BadRequestError('Title and content are required');
    const published = data.status === 'published';
    const announcement = await prisma.announcement.create({
      data: {
        title: data.title,
        content: data.content,
        status: data.status,
        publishedAt: data.publishedAt ?? (published ? new Date() : undefined),
        organizationId,
        createdById,
      },
    });
    await AuditService.created(organizationId, createdById, 'announcement', announcement.id, undefined, req);
    
    // Notify all users if published
    if (published) {
      const users = await prisma.user.findMany({
        where: { organizationId },
        select: { id: true },
      });
      if (users.length > 0) {
        NotificationHelper.createMultiple(
          organizationId,
          users.map(u => u.id),
          {
            title: 'New Announcement',
            body: data.title,
            type: 'announcement',
            relatedModel: 'Announcement',
            relatedId: announcement.id,
          }
        ).catch(() => {});
      }
    }
    
    return announcement;
  }

  static async updateAnnouncement(
    id: string,
    organizationId: string,
    actorId: string,
    data: AnnouncementData,
    req?: any
  ) {
    const current = await this.getAnnouncementById(id, organizationId);
    const status = data.status ?? current.status;
    let publishedAt = data.publishedAt;
    if (status === 'published' && !current.publishedAt && !publishedAt) {
      publishedAt = new Date();
    }
    const updated = await prisma.announcement.update({
      where: { id },
      data: { ...data, publishedAt },
    });
    await AuditService.updated(organizationId, actorId, 'announcement', id, data, req);
    
    // Notify all users if status changed to published
    if (data.status === 'published' && !current.publishedAt && updated.publishedAt) {
      const users = await prisma.user.findMany({
        where: { organizationId },
        select: { id: true },
      });
      if (users.length > 0) {
        NotificationHelper.createMultiple(
          organizationId,
          users.map(u => u.id),
          {
            title: 'New Announcement',
            body: updated.title,
            type: 'announcement',
            relatedModel: 'Announcement',
            relatedId: updated.id,
          }
        ).catch(() => {});
      }
    }
    
    return updated;
  }

  static async deleteAnnouncement(id: string, organizationId: string, actorId: string, req?: any) {
    await this.getAnnouncementById(id, organizationId);
    await prisma.announcement.delete({ where: { id } });
    await AuditService.deleted(organizationId, actorId, 'announcement', id, undefined, req);
    return { success: true };
  }
}
