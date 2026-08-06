import prisma from '../config/db';
import { NotFoundError } from '../utils/errors';
import { AuditService } from './audit.service';

export class VendorService {
  static async getVendors(
    organizationId: string,
    filters?: { status?: string; q?: string }
  ) {
    const where: any = { organizationId };
    if (filters?.status) where.status = filters.status;
    if (filters?.q) {
      where.OR = [
        { name: { contains: filters.q, mode: 'insensitive' } },
        { company: { contains: filters.q, mode: 'insensitive' } },
        { email: { contains: filters.q, mode: 'insensitive' } },
        { phone: { contains: filters.q, mode: 'insensitive' } },
      ];
    }
    return prisma.vendor.findMany({ where, orderBy: { createdAt: 'desc' } });
  }

  static async getVendorById(id: string, organizationId: string) {
    const vendor = await prisma.vendor.findFirst({ where: { id, organizationId } });
    if (!vendor) throw new NotFoundError('Vendor not found');
    return vendor;
  }

  static async createVendor(
    organizationId: string,
    createdById: string,
    data: any,
    req?: any
  ) {
    const vendor = await prisma.vendor.create({
      data: {
        name: data.name,
        company: data.company,
        email: data.email,
        phone: data.phone,
        address: data.address,
        paymentTerms: data.paymentTerms,
        notes: data.notes,
        status: data.status,
        organizationId,
        createdById,
      },
    });
    await AuditService.created(organizationId, createdById, 'vendor', vendor.id, undefined, req);
    return vendor;
  }

  static async updateVendor(
    id: string,
    organizationId: string,
    actorId: string,
    data: any,
    req?: any
  ) {
    await this.getVendorById(id, organizationId);
    if (data.email === '') data.email = null;
    if (data.name === undefined) delete data.name;
    const updated = await prisma.vendor.update({ where: { id }, data });
    await AuditService.updated(organizationId, actorId, 'vendor', id, data, req);
    return updated;
  }

  static async deleteVendor(id: string, organizationId: string, actorId: string, req?: any) {
    await this.getVendorById(id, organizationId);
    await prisma.vendor.delete({ where: { id } });
    await AuditService.deleted(organizationId, actorId, 'vendor', id, undefined, req);
    return { success: true };
  }
}
