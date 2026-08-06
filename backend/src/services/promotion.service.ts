import prisma from '../config/db';
import { NotFoundError } from '../utils/errors';
import { AuditService } from './audit.service';

export class PromotionService {
  private static async ensureEmployee(organizationId: string, employeeId: string) {
    const employee = await prisma.employee.findFirst({
      where: { id: employeeId, organizationId },
    });
    if (!employee) throw new NotFoundError('Employee not found');
  }

  static async getPromotions(
    organizationId: string,
    filters?: { employeeId?: string }
  ) {
    const where: any = { organizationId };
    if (filters?.employeeId) where.employeeId = filters.employeeId;
    return prisma.promotion.findMany({
      where,
      orderBy: { effectiveDate: 'desc' },
    });
  }

  static async getPromotionById(id: string, organizationId: string) {
    const promotion = await prisma.promotion.findFirst({
      where: { id, organizationId },
    });
    if (!promotion) throw new NotFoundError('Promotion not found');
    return promotion;
  }

  static async createPromotion(
    organizationId: string,
    data: {
      employeeId: string; fromDesignation?: string | null; toDesignation: string;
      effectiveDate?: Date | null; reason?: string | null; approvedById?: string | null;
      approvedAt?: Date | null; oldSalary?: number | null; newSalary?: number | null;
    },
    req?: any
  ) {
    await this.ensureEmployee(organizationId, data.employeeId);
    const promotion = await prisma.promotion.create({
      data: {
        employeeId: data.employeeId,
        fromDesignation: data.fromDesignation,
        toDesignation: data.toDesignation,
        effectiveDate: data.effectiveDate,
        reason: data.reason,
        approvedById: data.approvedById,
        approvedAt: data.approvedAt,
        oldSalary: data.oldSalary,
        newSalary: data.newSalary,
        organizationId,
      },
    });
    await AuditService.created(organizationId, '', 'promotion', promotion.id, undefined, req);
    return promotion;
  }

  static async updatePromotion(
    id: string,
    organizationId: string,
    actorId: string,
    data: any,
    req?: any
  ) {
    await this.getPromotionById(id, organizationId);
    if (data.employeeId) await this.ensureEmployee(organizationId, data.employeeId);
    const updated = await prisma.promotion.update({ where: { id }, data });
    await AuditService.updated(organizationId, actorId, 'promotion', id, data, req);
    return updated;
  }

  static async deletePromotion(id: string, organizationId: string, actorId: string, req?: any) {
    await this.getPromotionById(id, organizationId);
    await prisma.promotion.delete({ where: { id } });
    await AuditService.deleted(organizationId, actorId, 'promotion', id, undefined, req);
    return { success: true };
  }
}
