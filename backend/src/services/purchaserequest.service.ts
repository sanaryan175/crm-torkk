import prisma from '../config/db';
import { NotFoundError } from '../utils/errors';
import { PurchaseRequestStatus } from '@prisma/client';
import { AuditService } from './audit.service';

export class PurchaseRequestService {
  static async getPurchaseRequests(
    organizationId: string,
    filters?: { status?: string; q?: string }
  ) {
    const where: any = { organizationId };
    if (filters?.status) where.status = filters.status;
    if (filters?.q) {
      where.OR = [
        { title: { contains: filters.q, mode: 'insensitive' } },
        { prNumber: { contains: filters.q, mode: 'insensitive' } },
      ];
    }
    return prisma.purchaseRequest.findMany({ where, orderBy: { createdAt: 'desc' } });
  }

  static async getPurchaseRequestById(id: string, organizationId: string) {
    const purchaseRequest = await prisma.purchaseRequest.findFirst({
      where: { id, organizationId },
    });
    if (!purchaseRequest) throw new NotFoundError('Purchase request not found');
    return purchaseRequest;
  }

  static async createPurchaseRequest(
    organizationId: string,
    createdById: string,
    data: any,
    req?: any
  ) {
    const created = await prisma.$transaction(async (tx) => {
      const count = await tx.purchaseRequest.count({ where: { organizationId } });
      const prNumber = `PR-${String(count + 1).padStart(5, '0')}`;
      return tx.purchaseRequest.create({
        data: {
          prNumber,
          title: data.title,
          department: data.department,
          requestedById: data.requestedById ?? createdById,
          requestedDate: data.requestedDate,
          neededDate: data.neededDate,
          status: data.status,
          items: data.items ? JSON.parse(JSON.stringify(data.items)) : undefined,
          notes: data.notes,
          organizationId,
        },
      });
    });

    await AuditService.created(
      organizationId, createdById, 'purchase_request', created.id, undefined, req
    );
    return created;
  }

  static async updatePurchaseRequest(
    id: string,
    organizationId: string,
    actorId: string,
    data: any,
    req?: any
  ) {
    await this.getPurchaseRequestById(id, organizationId);

    const updateData: any = {};
    const scalarFields = ['title', 'department', 'status', 'notes'] as const;
    for (const field of scalarFields) {
      if (data[field] !== undefined) updateData[field] = data[field];
    }
    if (data.requestedById !== undefined) updateData.requestedById = data.requestedById;
    if (data.requestedDate !== undefined) updateData.requestedDate = data.requestedDate;
    if (data.neededDate !== undefined) {
      updateData.neededDate = data.neededDate === '' ? null : data.neededDate;
    }
    if (data.items !== undefined) updateData.items = JSON.parse(JSON.stringify(data.items));

    const updated = await prisma.purchaseRequest.update({ where: { id }, data: updateData });
    await AuditService.updated(organizationId, actorId, 'purchase_request', id, data, req);
    return updated;
  }

  static async approvePurchaseRequest(
    id: string,
    organizationId: string,
    actorId: string,
    req?: any
  ) {
    await this.getPurchaseRequestById(id, organizationId);
    const updated = await prisma.purchaseRequest.update({
      where: { id },
      data: {
        status: PurchaseRequestStatus.approved,
        approvedById: actorId,
        approvedAt: new Date(),
      },
    });
    await AuditService.updated(
      organizationId, actorId, 'purchase_request', id, { status: 'approved' }, req
    );
    return updated;
  }

  static async deletePurchaseRequest(
    id: string,
    organizationId: string,
    actorId: string,
    req?: any
  ) {
    await this.getPurchaseRequestById(id, organizationId);
    await prisma.purchaseRequest.delete({ where: { id } });
    await AuditService.deleted(organizationId, actorId, 'purchase_request', id, undefined, req);
    return { success: true };
  }
}
