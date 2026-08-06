import prisma from '../config/db';
import { NotFoundError } from '../utils/errors';
import { AuditService } from './audit.service';

const RFQ_INCLUDE = {
  vendor: { select: { id: true, name: true } },
};

export class RfqService {
  private static async ensureVendor(organizationId: string, vendorId?: string | null) {
    if (!vendorId) return;
    const vendor = await prisma.vendor.findFirst({ where: { id: vendorId, organizationId } });
    if (!vendor) throw new NotFoundError('Vendor not found');
  }

  static async getRfqs(
    organizationId: string,
    filters?: { status?: string; vendorId?: string }
  ) {
    const where: any = { organizationId };
    if (filters?.status) where.status = filters.status;
    if (filters?.vendorId) where.vendorId = filters.vendorId;
    return prisma.rfq.findMany({ where, include: RFQ_INCLUDE, orderBy: { createdAt: 'desc' } });
  }

  static async getRfqById(id: string, organizationId: string) {
    const rfq = await prisma.rfq.findFirst({
      where: { id, organizationId },
      include: RFQ_INCLUDE,
    });
    if (!rfq) throw new NotFoundError('RFQ not found');
    return rfq;
  }

  static async createRfq(
    organizationId: string,
    createdById: string,
    data: any,
    req?: any
  ) {
    await this.ensureVendor(organizationId, data.vendorId);

    const created = await prisma.$transaction(async (tx) => {
      const count = await tx.rfq.count({ where: { organizationId } });
      const rfqNumber = `RFQ-${String(count + 1).padStart(5, '0')}`;
      return tx.rfq.create({
        data: {
          rfqNumber,
          vendorId: data.vendorId,
          title: data.title,
          status: data.status,
          issuedDate: data.issuedDate,
          dueDate: data.dueDate,
          items: data.items ? JSON.parse(JSON.stringify(data.items)) : undefined,
          notes: data.notes,
          organizationId,
          createdById,
        },
        include: RFQ_INCLUDE,
      });
    });

    await AuditService.created(organizationId, createdById, 'rfq', created.id, undefined, req);
    return created;
  }

  static async updateRfq(
    id: string,
    organizationId: string,
    actorId: string,
    data: any,
    req?: any
  ) {
    await this.getRfqById(id, organizationId);
    if (data.vendorId !== undefined) {
      await this.ensureVendor(organizationId, data.vendorId);
      if (data.vendorId === '') data.vendorId = null;
    }

    const updateData: any = {};
    const scalarFields = ['title', 'status', 'notes'] as const;
    for (const field of scalarFields) {
      if (data[field] !== undefined) updateData[field] = data[field];
    }
    if (data.vendorId !== undefined) updateData.vendorId = data.vendorId;
    if (data.issuedDate !== undefined) {
      updateData.issuedDate = data.issuedDate === '' ? null : data.issuedDate;
    }
    if (data.dueDate !== undefined) {
      updateData.dueDate = data.dueDate === '' ? null : data.dueDate;
    }
    if (data.items !== undefined) updateData.items = JSON.parse(JSON.stringify(data.items));

    const updated = await prisma.rfq.update({ where: { id }, data: updateData, include: RFQ_INCLUDE });
    await AuditService.updated(organizationId, actorId, 'rfq', id, data, req);
    return updated;
  }

  static async deleteRfq(id: string, organizationId: string, actorId: string, req?: any) {
    await this.getRfqById(id, organizationId);
    await prisma.rfq.delete({ where: { id } });
    await AuditService.deleted(organizationId, actorId, 'rfq', id, undefined, req);
    return { success: true };
  }
}
