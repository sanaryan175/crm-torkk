import prisma from '../config/db';
import { NotFoundError } from '../utils/errors';
import { AuditService } from './audit.service';

export class TimeEntryService {
  private static async ensureUser(organizationId: string, userId: string) {
    const user = await prisma.user.findFirst({
      where: { id: userId, organizationId, isActive: true },
    });
    if (!user) throw new NotFoundError('User not found');
  }

  private static async ensureProject(organizationId: string, projectId?: string | null) {
    if (!projectId) return;
    const project = await prisma.project.findFirst({
      where: { id: projectId, organizationId },
    });
    if (!project) throw new NotFoundError('Project not found');
  }

  private static async ensureTask(organizationId: string, taskId?: string | null) {
    if (!taskId) return;
    const task = await prisma.projectTask.findFirst({
      where: { id: taskId, organizationId },
    });
    if (!task) throw new NotFoundError('Project task not found');
  }

  static async getTimeEntries(
    organizationId: string,
    filters?: { projectId?: string; taskId?: string; userId?: string; from?: string; to?: string }
  ) {
    const where: any = { organizationId };
    if (filters?.projectId) where.projectId = filters.projectId;
    if (filters?.taskId) where.taskId = filters.taskId;
    if (filters?.userId) where.userId = filters.userId;
    if (filters?.from) {
      where.entryDate = { ...(where.entryDate ?? {}), gte: new Date(filters.from) };
    }
    if (filters?.to) {
      where.entryDate = { ...(where.entryDate ?? {}), lte: new Date(filters.to) };
    }
    return prisma.timeEntry.findMany({ where, orderBy: { entryDate: 'desc' } });
  }

  static async getTimeEntryById(id: string, organizationId: string) {
    const entry = await prisma.timeEntry.findFirst({
      where: { id, organizationId },
    });
    if (!entry) throw new NotFoundError('Time entry not found');
    return entry;
  }

  static async createTimeEntry(
    organizationId: string,
    actorId: string,
    data: {
      userId: string; projectId?: string | null; taskId?: string | null;
      description?: string | null; hours: number; billable?: boolean; entryDate?: Date;
    },
    req?: any
  ) {
    await this.ensureUser(organizationId, data.userId);
    await this.ensureProject(organizationId, data.projectId);
    await this.ensureTask(organizationId, data.taskId);

    const entry = await prisma.timeEntry.create({
      data: {
        userId: data.userId,
        projectId: data.projectId,
        taskId: data.taskId,
        description: data.description,
        hours: data.hours,
        billable: data.billable ?? true,
        entryDate: data.entryDate ?? new Date(),
        organizationId,
      },
    });
    await AuditService.created(organizationId, actorId, 'time_entry', entry.id, undefined, req);
    return entry;
  }

  static async updateTimeEntry(
    id: string,
    organizationId: string,
    actorId: string,
    data: any,
    req?: any
  ) {
    const existing = await this.getTimeEntryById(id, organizationId);
    await this.ensureUser(organizationId, data.userId ?? existing.userId);
    await this.ensureProject(organizationId, data.projectId ?? existing.projectId);
    await this.ensureTask(organizationId, data.taskId ?? existing.taskId);

    if (data.projectId === '') data.projectId = null;
    if (data.taskId === '') data.taskId = null;

    const updated = await prisma.timeEntry.update({ where: { id }, data });
    await AuditService.updated(organizationId, actorId, 'time_entry', id, data, req);
    return updated;
  }

  static async deleteTimeEntry(id: string, organizationId: string, actorId: string, req?: any) {
    await this.getTimeEntryById(id, organizationId);
    await prisma.timeEntry.delete({ where: { id } });
    await AuditService.deleted(organizationId, actorId, 'time_entry', id, undefined, req);
    return { success: true };
  }
}
