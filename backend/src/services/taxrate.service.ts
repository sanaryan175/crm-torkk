import prisma from '../config/db';
import { NotFoundError } from '../utils/errors';
import { AuditService } from './audit.service';

export class TaxRateService {
  static async getTaxRates(organizationId: string) {
    return prisma.taxRate.findMany({ where: { organizationId }, orderBy: { name: 'asc' } });
  }

  static async getTaxRateById(id: string, organizationId: string) {
    const taxRate = await prisma.taxRate.findFirst({ where: { id, organizationId } });
    if (!taxRate) throw new NotFoundError('Tax rate not found');
    return taxRate;
  }

  static async createTaxRate(
    organizationId: string,
    actorId: string,
    data: {
      name: string;
      rate: number;
      type: any;
      cgst?: number | null;
      sgst?: number | null;
      igst?: number | null;
      isDefault?: boolean;
      isActive?: boolean;
    },
    req?: any
  ) {
    const taxRate = await prisma.taxRate.create({
      data: {
        name: data.name,
        rate: data.rate,
        type: data.type,
        cgst: data.cgst,
        sgst: data.sgst,
        igst: data.igst,
        isDefault: data.isDefault,
        isActive: data.isActive,
        organizationId,
      },
    });
    await AuditService.created(organizationId, actorId, 'taxrate', taxRate.id, undefined, req);
    return taxRate;
  }

  static async updateTaxRate(id: string, organizationId: string, actorId: string, data: any, req?: any) {
    await this.getTaxRateById(id, organizationId);
    const updated = await prisma.taxRate.update({ where: { id }, data });
    await AuditService.updated(organizationId, actorId, 'taxrate', id, data, req);
    return updated;
  }

  static async deleteTaxRate(id: string, organizationId: string, actorId: string, req?: any) {
    await this.getTaxRateById(id, organizationId);
    await prisma.taxRate.delete({ where: { id } });
    await AuditService.deleted(organizationId, actorId, 'taxrate', id, undefined, req);
    return { success: true };
  }
}
