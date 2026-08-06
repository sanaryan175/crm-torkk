import prisma from '../config/db';
import { NotFoundError } from '../utils/errors';
import { AuditService } from './audit.service';

const ORDER_INCLUDE = {
  items: true,
};

interface OrderItemInput {
  name: string;
  description?: string | null;
  quantity?: number;
  unitPrice?: number;
  taxRate?: number;
  sortOrder?: number;
}

interface OrderData {
  contactId?: string | null;
  companyId?: string | null;
  dealId?: string | null;
  status?: any;
  orderDate?: Date;
  deliveryDate?: Date | null;
  currency?: string;
  taxRate?: number;
  discount?: number;
  notes?: string | null;
  items?: OrderItemInput[];
}

function computeTotals(items: OrderItemInput[], discount = 0) {
  const normalized = items.map((item) => {
    const quantity = item.quantity ?? 1;
    const unitPrice = item.unitPrice ?? 0;
    const taxRate = item.taxRate ?? 0;
    const lineTotal = Number((quantity * unitPrice).toFixed(2));
    return { ...item, quantity, unitPrice, taxRate, lineTotal };
  });
  const subtotal = Number(normalized.reduce((sum, i) => sum + i.lineTotal, 0).toFixed(2));
  const taxAmount = Number(
    normalized.reduce((sum, i) => sum + i.lineTotal * (i.taxRate / 100), 0).toFixed(2)
  );
  const total = Number((subtotal + taxAmount - discount).toFixed(2));
  return { normalized, subtotal, taxAmount, total };
}

export class SalesOrderService {
  static async getSalesOrders(
    organizationId: string,
    filters?: { status?: string; contactId?: string }
  ) {
    const where: any = { organizationId };
    if (filters?.status) where.status = filters.status;
    if (filters?.contactId) where.contactId = filters.contactId;
    return prisma.salesOrder.findMany({ where, include: ORDER_INCLUDE, orderBy: { createdAt: 'desc' } });
  }

  static async getSalesOrderById(id: string, organizationId: string) {
    const order = await prisma.salesOrder.findFirst({
      where: { id, organizationId },
      include: ORDER_INCLUDE,
    });
    if (!order) throw new NotFoundError('Sales order not found');
    return order;
  }

  static async createSalesOrder(
    organizationId: string,
    createdById: string,
    data: OrderData,
    req?: any
  ) {
    const count = await prisma.salesOrder.count({ where: { organizationId } });
    const orderNumber = `SO-${String(count + 1).padStart(5, '0')}`;

    const { normalized, subtotal, taxAmount, total } = computeTotals(
      data.items ?? [],
      data.discount ?? 0
    );

    const order = await prisma.salesOrder.create({
      data: {
        orderNumber,
        contactId: data.contactId,
        companyId: data.companyId,
        dealId: data.dealId,
        status: data.status,
        orderDate: data.orderDate,
        deliveryDate: data.deliveryDate,
        currency: data.currency,
        taxRate: data.taxRate,
        discount: data.discount,
        subtotal,
        taxAmount,
        total,
        notes: data.notes,
        organizationId,
        createdById,
        items: {
          create: normalized.map((item, index) => ({
            name: item.name,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            taxRate: item.taxRate,
            lineTotal: item.lineTotal,
            sortOrder: item.sortOrder ?? index,
            organizationId,
          })),
        },
      },
      include: ORDER_INCLUDE,
    });

    await AuditService.created(organizationId, createdById, 'sales_order', order.id, { orderNumber }, req);
    return order;
  }

  static async updateSalesOrder(
    id: string,
    organizationId: string,
    actorId: string,
    data: OrderData,
    req?: any
  ) {
    await this.getSalesOrderById(id, organizationId);

    const updateData: any = {
      contactId: data.contactId,
      companyId: data.companyId,
      dealId: data.dealId,
      status: data.status,
      orderDate: data.orderDate,
      deliveryDate: data.deliveryDate,
      currency: data.currency,
      taxRate: data.taxRate,
      discount: data.discount,
      notes: data.notes,
    };

    if (data.items) {
      const { normalized, subtotal, taxAmount, total } = computeTotals(data.items, data.discount ?? 0);
      updateData.subtotal = subtotal;
      updateData.taxAmount = taxAmount;
      updateData.total = total;
      await prisma.$transaction([
        prisma.salesOrderItem.deleteMany({ where: { orderId: id, organizationId } }),
        prisma.salesOrder.update({
          where: { id },
          data: {
            ...updateData,
            items: {
              create: normalized.map((item, index) => ({
                name: item.name,
                description: item.description,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                taxRate: item.taxRate,
                lineTotal: item.lineTotal,
                sortOrder: item.sortOrder ?? index,
                organizationId,
              })),
            },
          },
          include: ORDER_INCLUDE,
        }),
      ]);
    } else {
      await prisma.salesOrder.update({ where: { id }, data: updateData, include: ORDER_INCLUDE });
    }

    const updated = await this.getSalesOrderById(id, organizationId);
    await AuditService.updated(organizationId, actorId, 'sales_order', id, updateData, req);
    return updated;
  }

  static async deleteSalesOrder(id: string, organizationId: string, actorId: string, req?: any) {
    await this.getSalesOrderById(id, organizationId);
    await prisma.salesOrder.delete({ where: { id } });
    await AuditService.deleted(organizationId, actorId, 'sales_order', id, undefined, req);
    return { success: true };
  }
}
