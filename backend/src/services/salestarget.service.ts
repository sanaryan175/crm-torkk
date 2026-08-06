import prisma from '../config/db';
import { NotFoundError } from '../utils/errors';
import { AuditService } from './audit.service';

const TARGET_INCLUDE = {
  assignedTo: { select: { id: true, name: true, email: true, avatar: true } },
};

interface SalesTargetData {
  assignedToId?: string;
  period?: string;
  periodStart?: Date;
  periodEnd?: Date;
  targetAmount?: number;
}

export class SalesTargetService {
  private static async ensureAssignableUser(organizationId: string, assignedToId?: string) {
    if (!assignedToId) return;
    const user = await prisma.user.findFirst({
      where: { id: assignedToId, organizationId, isActive: true },
    });
    if (!user) throw new NotFoundError('Assigned user not found');
  }

  static async getSalesTargets(organizationId: string) {
    return prisma.salesTarget.findMany({
      where: { organizationId },
      include: TARGET_INCLUDE,
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getSalesTargetById(id: string, organizationId: string) {
    const target = await prisma.salesTarget.findFirst({
      where: { id, organizationId },
      include: TARGET_INCLUDE,
    });
    if (!target) throw new NotFoundError('Sales target not found');
    return target;
  }

  static async createSalesTarget(
    organizationId: string,
    createdById: string,
    data: SalesTargetData,
    req?: any
  ) {
    await this.ensureAssignableUser(organizationId, data.assignedToId);
    const target = await prisma.salesTarget.create({
      data: {
        assignedToId: data.assignedToId!,
        period: data.period!,
        periodStart: data.periodStart!,
        periodEnd: data.periodEnd!,
        targetAmount: data.targetAmount!,
        organizationId,
        createdById,
      },
      include: TARGET_INCLUDE,
    });
    await AuditService.created(organizationId, createdById, 'sales_target', target.id, undefined, req);
    return target;
  }

  static async updateSalesTarget(
    id: string,
    organizationId: string,
    actorId: string,
    data: SalesTargetData,
    req?: any
  ) {
    await this.getSalesTargetById(id, organizationId);
    await this.ensureAssignableUser(organizationId, data.assignedToId);
    const updated = await prisma.salesTarget.update({
      where: { id },
      data,
      include: TARGET_INCLUDE,
    });
    await AuditService.updated(organizationId, actorId, 'sales_target', id, data, req);
    return updated;
  }

  static async deleteSalesTarget(id: string, organizationId: string, actorId: string, req?: any) {
    await this.getSalesTargetById(id, organizationId);
    await prisma.salesTarget.delete({ where: { id } });
    await AuditService.deleted(organizationId, actorId, 'sales_target', id, undefined, req);
    return { success: true };
  }
}
