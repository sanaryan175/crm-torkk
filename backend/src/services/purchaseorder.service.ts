import prisma from '../config/db';
import { NotFoundError } from '../utils/errors';
import { PurchaseOrderStatus } from '@prisma/client';
import { AuditService } from './audit.service';

const PO_INCLUDE = {
  items: true,
  vendor: { select: { id: true, name: true } },
};

interface ItemPayload {
  name: string;
  productId?: string | null;
  quantity: number;
  unitPrice: number;
  taxRate: number;
}

export class PurchaseOrderService {
  private static computeTotals(items: ItemPayload[]) {
    const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const tax = items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice * (item.taxRate / 100),
      0
    );
    return { subtotal, tax, total: subtotal + tax };
  }

  private static async ensureVendor(organizationId: string, vendorId?: string | null) {
    if (!vendorId) return;
    const vendor = await prisma.vendor.findFirst({ where: { id: vendorId, organizationId } });
    if (!vendor) throw new NotFoundError('Vendor not found');
  }

  static async getPurchaseOrders(
    organizationId: string,
    filters?: { vendorId?: string; status?: string }
  ) {
    const where: any = { organizationId };
    if (filters?.vendorId) where.vendorId = filters.vendorId;
    if (filters?.status) where.status = filters.status;
    return prisma.purchaseOrder.findMany({
      where,
      include: PO_INCLUDE,
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getPurchaseOrderById(id: string, organizationId: string) {
    const purchaseOrder = await prisma.purchaseOrder.findFirst({
      where: { id, organizationId },
      include: PO_INCLUDE,
    });
    if (!purchaseOrder) throw new NotFoundError('Purchase order not found');
    return purchaseOrder;
  }

  static async createPurchaseOrder(
    organizationId: string,
    createdById: string,
    data: any,
    req?: any
  ) {
    await this.ensureVendor(organizationId, data.vendorId);

    const items: ItemPayload[] = (data.items ?? []).map(
      (item: any) => ({
        name: item.name,
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        taxRate: item.taxRate ?? 0,
      })
    );
    const totals = this.computeTotals(items);

    const created = await prisma.$transaction(async (tx) => {
      const count = await tx.purchaseOrder.count({ where: { organizationId } });
      const poNumber = `PO-${String(count + 1).padStart(5, '0')}`;
      return tx.purchaseOrder.create({
        data: {
          poNumber,
          vendorId: data.vendorId,
          status: data.status,
          orderDate: data.orderDate,
          expectedDate: data.expectedDate,
          currency: data.currency,
          subtotal: totals.subtotal,
          tax: totals.tax,
          total: totals.total,
          notes: data.notes,
          organizationId,
          createdById,
          items: {
            create: items.map((item) => ({
              name: item.name,
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              lineTotal: item.quantity * item.unitPrice,
              organizationId,
            })),
          },
        },
        include: PO_INCLUDE,
      });
    });

    await AuditService.created(
      organizationId, createdById, 'purchase_order', created.id, undefined, req
    );
    return created;
  }

  static async updatePurchaseOrder(
    id: string,
    organizationId: string,
    actorId: string,
    data: any,
    req?: any
  ) {
    await this.getPurchaseOrderById(id, organizationId);
    if (data.vendorId !== undefined) {
      await this.ensureVendor(organizationId, data.vendorId);
      if (data.vendorId === '') data.vendorId = null;
    }

    const updateData: any = {};
    const scalarFields = ['status', 'currency', 'notes'] as const;
    for (const field of scalarFields) {
      if (data[field] !== undefined) updateData[field] = data[field];
    }
    if (data.vendorId !== undefined) updateData.vendorId = data.vendorId;
    if (data.orderDate !== undefined) updateData.orderDate = data.orderDate;
    if (data.expectedDate !== undefined) {
      updateData.expectedDate = data.expectedDate === '' ? null : data.expectedDate;
    }

    if (data.items) {
      const items: ItemPayload[] = (data.items as any[]).map((item: any) => ({
        name: item.name,
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        taxRate: item.taxRate ?? 0,
      }));
      const totals = this.computeTotals(items);
      updateData.subtotal = totals.subtotal;
      updateData.tax = totals.tax;
      updateData.total = totals.total;
    }

    const updated = await prisma.$transaction(async (tx) => {
      if (data.items) {
        await tx.purchaseOrderItem.deleteMany({ where: { poId: id } });
        await tx.purchaseOrderItem.createMany({
          data: (data.items as any[]).map((item: any) => ({
            poId: id,
            organizationId,
            name: item.name,
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            lineTotal: item.quantity * item.unitPrice,
          })),
        });
      }
      return tx.purchaseOrder.update({ where: { id }, data: updateData, include: PO_INCLUDE });
    });

    await AuditService.updated(organizationId, actorId, 'purchase_order', id, data, req);
    return updated;
  }

  static async updatePurchaseOrderStatus(
    id: string,
    organizationId: string,
    actorId: string,
    status: string,
    req?: any
  ) {
    await this.getPurchaseOrderById(id, organizationId);
    const updateData: any = { status };
    if (status === PurchaseOrderStatus.received) {
      updateData.receivedAt = new Date();
    }
    const updated = await prisma.purchaseOrder.update({
      where: { id },
      data: updateData,
      include: PO_INCLUDE,
    });
    await AuditService.updated(organizationId, actorId, 'purchase_order', id, { status }, req);
    return updated;
  }

  static async createPayment(
    poId: string,
    organizationId: string,
    actorId: string,
    data: any,
    req?: any
  ) {
    const po = await this.getPurchaseOrderById(poId, organizationId);
    const payment = await prisma.vendorPayment.create({
      data: {
        organizationId,
        vendorId: po.vendorId,
        poId,
        amount: data.amount,
        method: data.method,
        status: data.status,
        reference: data.reference,
        paidAt: data.paidAt,
        notes: data.notes,
        createdById: actorId,
      },
    });
    await AuditService.created(
      organizationId, actorId, 'vendor_payment', payment.id, { poId }, req
    );
    return payment;
  }

  static async deletePurchaseOrder(id: string, organizationId: string, actorId: string, req?: any) {
    await this.getPurchaseOrderById(id, organizationId);
    await prisma.purchaseOrder.delete({ where: { id } });
    await AuditService.deleted(organizationId, actorId, 'purchase_order', id, undefined, req);
    return { success: true };
  }
}
