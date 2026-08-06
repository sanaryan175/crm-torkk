import prisma from '../config/db';
import { NotFoundError } from '../utils/errors';
import { AuditService } from './audit.service';

export class SlaPolicyService {
  static async getSlaPolicies(organizationId: string) {
    return prisma.slaPolicy.findMany({ where: { organizationId }, orderBy: { name: 'asc' } });
  }

  static async getSlaPolicyById(id: string, organizationId: string) {
    const policy = await prisma.slaPolicy.findFirst({ where: { id, organizationId } });
    if (!policy) throw new NotFoundError('SLA policy not found');
    return policy;
  }

  static async createSlaPolicy(
    organizationId: string,
    actorId: string,
    data: { name: string; priority: string; responseHours: number; resolutionHours: number; isDefault?: boolean },
    req?: any
  ) {
    const policy = await prisma.slaPolicy.create({
      data: {
        name: data.name,
        priority: data.priority,
        responseHours: data.responseHours,
        resolutionHours: data.resolutionHours,
        isDefault: data.isDefault ?? false,
        organizationId,
      },
    });
    await AuditService.created(organizationId, actorId, 'slaPolicy', policy.id, undefined, req);
    return policy;
  }

  static async updateSlaPolicy(id: string, organizationId: string, actorId: string, data: any, req?: any) {
    await this.getSlaPolicyById(id, organizationId);
    const updated = await prisma.slaPolicy.update({ where: { id }, data });
    await AuditService.updated(organizationId, actorId, 'slaPolicy', id, data, req);
    return updated;
  }

  static async deleteSlaPolicy(id: string, organizationId: string, actorId: string, req?: any) {
    await this.getSlaPolicyById(id, organizationId);
    await prisma.slaPolicy.delete({ where: { id } });
    await AuditService.deleted(organizationId, actorId, 'slaPolicy', id, undefined, req);
    return { success: true };
  }
}
