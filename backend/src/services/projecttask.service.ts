import prisma from '../config/db';
import { NotFoundError } from '../utils/errors';
import { TaskStatus } from '@prisma/client';
import { AuditService } from './audit.service';

const TASK_INCLUDE = {
  assignedTo: { select: { id: true, name: true, email: true, avatar: true } },
};

export class ProjectTaskService {
  private static async ensureProject(organizationId: string, projectId?: string | null) {
    if (!projectId) return;
    const project = await prisma.project.findFirst({
      where: { id: projectId, organizationId },
    });
    if (!project) throw new NotFoundError('Project not found');
  }

  private static async ensureMilestone(organizationId: string, milestoneId?: string | null) {
    if (!milestoneId) return;
    const milestone = await prisma.projectMilestone.findFirst({
      where: { id: milestoneId, organizationId },
    });
    if (!milestone) throw new NotFoundError('Milestone not found');
  }

  private static async ensureAssignee(organizationId: string, assigneeId?: string | null) {
    if (!assigneeId) return;
    const user = await prisma.user.findFirst({
      where: { id: assigneeId, organizationId, isActive: true },
    });
    if (!user) throw new NotFoundError('Assignee not found');
  }

  static async getProjectTasks(
    organizationId: string,
    filters?: { projectId?: string; assigneeId?: string; status?: string }
  ) {
    const where: any = { organizationId };
    if (filters?.projectId) where.projectId = filters.projectId;
    if (filters?.assigneeId) where.assignedToId = filters.assigneeId;
    if (filters?.status) where.status = filters.status;
    return prisma.projectTask.findMany({ where, include: TASK_INCLUDE, orderBy: { createdAt: 'desc' } });
  }

  static async getProjectTaskById(id: string, organizationId: string) {
    const task = await prisma.projectTask.findFirst({
      where: { id, organizationId },
      include: TASK_INCLUDE,
    });
    if (!task) throw new NotFoundError('Project task not found');
    return task;
  }

  static async createProjectTask(
    organizationId: string,
    createdById: string,
    data: {
      title: string; description?: string | null; status?: any; priority?: any;
      projectId?: string | null; milestoneId?: string | null; assigneeId?: string | null;
      startDate?: Date | null; dueDate?: Date | null; estimatedHours?: number | null;
    },
    req?: any
  ) {
    await this.ensureProject(organizationId, data.projectId);
    await this.ensureMilestone(organizationId, data.milestoneId);
    await this.ensureAssignee(organizationId, data.assigneeId);

    const completedAt = data.status === TaskStatus.done ? new Date() : null;

    const task = await prisma.projectTask.create({
      data: {
        title: data.title,
        description: data.description,
        status: data.status,
        priority: data.priority,
        projectId: data.projectId,
        milestoneId: data.milestoneId,
        assignedToId: data.assigneeId,
        startDate: data.startDate,
        dueDate: data.dueDate,
        estimatedHours: data.estimatedHours,
        completedAt,
        organizationId,
        createdById,
      },
      include: TASK_INCLUDE,
    });
    await AuditService.created(organizationId, createdById, 'project_task', task.id, undefined, req);
    return task;
  }

  static async updateProjectTask(
    id: string,
    organizationId: string,
    actorId: string,
    data: any,
    req?: any
  ) {
    const existing = await this.getProjectTaskById(id, organizationId);
    await this.ensureProject(organizationId, data.projectId ?? existing.projectId);
    await this.ensureMilestone(organizationId, data.milestoneId ?? existing.milestoneId);
    await this.ensureAssignee(organizationId, data.assigneeId ?? existing.assignedToId);

    if (data.projectId === '') data.projectId = null;
    if (data.milestoneId === '') data.milestoneId = null;
    if (data.assigneeId === '') data.assigneeId = null;

    const updateData: any = { ...data };
    if (data.status && data.status !== existing.status) {
      if (data.status === TaskStatus.done) updateData.completedAt = new Date();
      else updateData.completedAt = null;
    }

    const updated = await prisma.projectTask.update({ where: { id }, data: updateData, include: TASK_INCLUDE });
    await AuditService.updated(organizationId, actorId, 'project_task', id, data, req);
    return updated;
  }

  static async updateProjectTaskStatus(
    id: string,
    organizationId: string,
    actorId: string,
    status: any,
    req?: any
  ) {
    await this.getProjectTaskById(id, organizationId);
    const updateData: any = { status };
    if (status === TaskStatus.done) updateData.completedAt = new Date();
    else updateData.completedAt = null;
    const updated = await prisma.projectTask.update({ where: { id }, data: updateData, include: TASK_INCLUDE });
    await AuditService.updated(organizationId, actorId, 'project_task', id, { status }, req);
    return updated;
  }

  static async deleteProjectTask(id: string, organizationId: string, actorId: string, req?: any) {
    await this.getProjectTaskById(id, organizationId);
    await prisma.projectTask.delete({ where: { id } });
    await AuditService.deleted(organizationId, actorId, 'project_task', id, undefined, req);
    return { success: true };
  }
}
