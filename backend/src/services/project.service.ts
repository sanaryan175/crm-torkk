import prisma from '../config/db';
import { NotFoundError } from '../utils/errors';
import { AuditService } from './audit.service';

const PROJECT_INCLUDE = {
  manager: { select: { id: true, name: true, email: true, avatar: true } },
  members: true,
  milestones: { orderBy: { dueDate: 'asc' as const } },
  _count: { select: { tasks: true } },
};

export class ProjectService {
  private static async ensureManager(organizationId: string, managerId?: string | null) {
    if (!managerId) return;
    const user = await prisma.user.findFirst({
      where: { id: managerId, organizationId, isActive: true },
    });
    if (!user) throw new NotFoundError('Project manager not found');
  }

  private static async ensureUser(organizationId: string, userId: string) {
    const user = await prisma.user.findFirst({
      where: { id: userId, organizationId, isActive: true },
    });
    if (!user) throw new NotFoundError('User not found');
  }

  static async getProjects(
    organizationId: string,
    filters?: { status?: string; managerId?: string; q?: string }
  ) {
    const where: any = { organizationId };
    if (filters?.status) where.status = filters.status;
    if (filters?.managerId) where.managerId = filters.managerId;
    if (filters?.q) {
      where.OR = [
        { name: { contains: filters.q, mode: 'insensitive' } },
        { code: { contains: filters.q, mode: 'insensitive' } },
        { description: { contains: filters.q, mode: 'insensitive' } },
      ];
    }
    return prisma.project.findMany({ where, include: PROJECT_INCLUDE, orderBy: { createdAt: 'desc' } });
  }

  static async getProjectById(id: string, organizationId: string) {
    const project = await prisma.project.findFirst({
      where: { id, organizationId },
      include: PROJECT_INCLUDE,
    });
    if (!project) throw new NotFoundError('Project not found');
    return project;
  }

  static async createProject(
    organizationId: string,
    createdById: string,
    data: {
      name: string; code?: string | null; description?: string | null; status?: any;
      startDate?: Date | null; endDate?: Date | null; budget?: number | null; managerId?: string | null;
    },
    req?: any
  ) {
    await this.ensureManager(organizationId, data.managerId);
    const project = await prisma.project.create({
      data: {
        name: data.name,
        code: data.code ?? null,
        description: data.description,
        status: data.status,
        startDate: data.startDate,
        endDate: data.endDate,
        budget: data.budget ?? 0,
        managerId: data.managerId,
        organizationId,
        createdById,
      },
      include: PROJECT_INCLUDE,
    });
    await AuditService.created(organizationId, createdById, 'project', project.id, undefined, req);
    return project;
  }

  static async updateProject(
    id: string,
    organizationId: string,
    actorId: string,
    data: any,
    req?: any
  ) {
    await this.getProjectById(id, organizationId);
    await this.ensureManager(organizationId, data.managerId);
    if (data.managerId === '') data.managerId = null;
    const updated = await prisma.project.update({ where: { id }, data, include: PROJECT_INCLUDE });
    await AuditService.updated(organizationId, actorId, 'project', id, data, req);
    return updated;
  }

  static async addProjectMember(
    projectId: string,
    organizationId: string,
    actorId: string,
    data: { userId: string; role?: string },
    req?: any
  ) {
    await this.getProjectById(projectId, organizationId);
    await this.ensureUser(organizationId, data.userId);
    const existing = await prisma.projectMember.findFirst({
      where: { projectId, userId: data.userId, organizationId },
    });
    if (existing) {
      const member = await prisma.projectMember.update({
        where: { id: existing.id },
        data: { role: data.role ?? existing.role },
      });
      await AuditService.updated(organizationId, actorId, 'project_member', member.id, data, req);
      return member;
    }
    const member = await prisma.projectMember.create({
      data: {
        projectId,
        userId: data.userId,
        role: data.role ?? 'member',
        organizationId,
      },
    });
    await AuditService.created(organizationId, actorId, 'project_member', member.id, data, req);
    return member;
  }

  static async removeProjectMember(
    projectId: string,
    memberId: string,
    organizationId: string,
    actorId: string,
    req?: any
  ) {
    const member = await prisma.projectMember.findFirst({
      where: { id: memberId, projectId, organizationId },
    });
    if (!member) throw new NotFoundError('Project member not found');
    await prisma.projectMember.delete({ where: { id: member.id } });
    await AuditService.deleted(organizationId, actorId, 'project_member', member.id, undefined, req);
    return { success: true };
  }

  static async addMilestone(
    projectId: string,
    organizationId: string,
    actorId: string,
    data: { name: string; description?: string | null; dueDate?: Date | null; status?: string },
    req?: any
  ) {
    await this.getProjectById(projectId, organizationId);
    const milestone = await prisma.projectMilestone.create({
      data: {
        projectId,
        name: data.name,
        description: data.description,
        dueDate: data.dueDate,
        status: data.status ?? 'pending',
        organizationId,
      },
    });
    await AuditService.created(organizationId, actorId, 'project_milestone', milestone.id, data, req);
    return milestone;
  }

  static async updateMilestone(
    projectId: string,
    milestoneId: string,
    organizationId: string,
    actorId: string,
    data: any,
    req?: any
  ) {
    const milestone = await prisma.projectMilestone.findFirst({
      where: { id: milestoneId, projectId, organizationId },
    });
    if (!milestone) throw new NotFoundError('Project milestone not found');

    const updateData: any = { ...data };
    if (data.status === 'complete') {
      updateData.completedAt = data.completedAt ?? new Date();
    } else if (data.status && milestone.completedAt) {
      updateData.completedAt = null;
    }

    const updated = await prisma.projectMilestone.update({ where: { id: milestone.id }, data: updateData });
    await AuditService.updated(organizationId, actorId, 'project_milestone', milestone.id, data, req);
    return updated;
  }

  static async deleteMilestone(
    projectId: string,
    milestoneId: string,
    organizationId: string,
    actorId: string,
    req?: any
  ) {
    const milestone = await prisma.projectMilestone.findFirst({
      where: { id: milestoneId, projectId, organizationId },
    });
    if (!milestone) throw new NotFoundError('Project milestone not found');
    await prisma.projectMilestone.delete({ where: { id: milestone.id } });
    await AuditService.deleted(organizationId, actorId, 'project_milestone', milestone.id, undefined, req);
    return { success: true };
  }

  static async deleteProject(id: string, organizationId: string, actorId: string, req?: any) {
    await this.getProjectById(id, organizationId);
    await prisma.project.delete({ where: { id } });
    await AuditService.deleted(organizationId, actorId, 'project', id, undefined, req);
    return { success: true };
  }
}
