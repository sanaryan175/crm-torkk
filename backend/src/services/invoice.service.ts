import prisma from '../config/db';
import { NotFoundError } from '../utils/errors';
import { InvoiceStatus, PaymentMethod, PaymentStatus } from '@prisma/client';
import { AuditService } from './audit.service';

const INVOICE_INCLUDE = {
  items: { orderBy: { sortOrder: 'asc' as const } },
  payments: { orderBy: { paidAt: 'desc' as const } },
};

const PAYMENT_INCLUDE = {
  invoice: {
    select: { id: true, invoiceNumber: true, total: true, amountPaid: true, contactId: true },
  },
};

interface ItemPayload {
  name: string;
  description?: string | null;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  sortOrder?: number;
}

export class InvoiceService {
  private static computeTotals(items: ItemPayload[], discount = 0) {
    const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const taxAmount = items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice * (item.taxRate / 100),
      0
    );
    return { subtotal, taxAmount, total: subtotal + taxAmount - discount };
  }

  static async getInvoices(
    organizationId: string,
    filters?: { status?: string; contactId?: string }
  ) {
    const where: any = { organizationId };
    if (filters?.status) where.status = filters.status;
    if (filters?.contactId) where.contactId = filters.contactId;
    return prisma.invoice.findMany({ where, include: INVOICE_INCLUDE, orderBy: { createdAt: 'desc' } });
  }

  static async getInvoiceById(id: string, organizationId: string) {
    const invoice = await prisma.invoice.findFirst({
      where: { id, organizationId },
      include: INVOICE_INCLUDE,
    });
    if (!invoice) throw new NotFoundError('Invoice not found');
    return invoice;
  }

  static async createInvoice(
    organizationId: string,
    createdById: string,
    data: any,
    req?: any
  ) {
    const items: ItemPayload[] = (data.items ?? []).map(
      (item: any, index: number) => ({ ...item, sortOrder: index })
    );
    const totals = this.computeTotals(items, data.discount ?? 0);

    const invoice = await prisma.$transaction(async (tx) => {
      const count = await tx.invoice.count({ where: { organizationId } });
      const invoiceNumber = `INV-${String(count + 1).padStart(4, '0')}`;
      return tx.invoice.create({
        data: {
          invoiceNumber,
          quoteId: data.quoteId,
          contactId: data.contactId,
          companyId: data.companyId,
          dealId: data.dealId,
          status: data.status,
          issueDate: data.issueDate,
          dueDate: data.dueDate,
          currency: data.currency,
          taxRate: data.taxRate ?? 0,
          discount: data.discount ?? 0,
          subtotal: totals.subtotal,
          taxAmount: totals.taxAmount,
          total: totals.total,
          amountPaid: 0,
          notes: data.notes,
          organizationId,
          createdById,
          items: {
            create: items.map((item, index) => ({
              name: item.name,
              description: item.description,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              taxRate: item.taxRate,
              lineTotal: item.quantity * item.unitPrice,
              sortOrder: index,
              organizationId,
            })),
          },
        },
        include: INVOICE_INCLUDE,
      });
    });

    await AuditService.created(organizationId, createdById, 'invoice', invoice.id, undefined, req);
    return invoice;
  }

  static async updateInvoice(
    id: string,
    organizationId: string,
    actorId: string,
    data: any,
    req?: any
  ) {
    const existing = await this.getInvoiceById(id, organizationId);

    const items: ItemPayload[] = data.items
      ? (data.items as any[]).map((item: any, index: number) => ({ ...item, sortOrder: index }))
      : existing.items.map((item) => ({
          name: item.name,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          taxRate: item.taxRate,
          sortOrder: item.sortOrder,
        }));
    const totals = this.computeTotals(items, data.discount ?? existing.discount);

    const updated = await prisma.$transaction(async (tx) => {
      if (data.items) {
        await tx.invoiceItem.deleteMany({ where: { invoiceId: id } });
        await tx.invoiceItem.createMany({
          data: items.map((item) => ({
            invoiceId: id,
            organizationId,
            name: item.name,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            taxRate: item.taxRate,
            lineTotal: item.quantity * item.unitPrice,
            sortOrder: item.sortOrder ?? 0,
          })),
        });
      }

      const updateData: any = {};
      const scalarFields = ['status', 'currency', 'notes'] as const;
      for (const field of scalarFields) {
        if (data[field] !== undefined) updateData[field] = data[field];
      }
      const nullableFields = ['quoteId', 'contactId', 'companyId', 'dealId'] as const;
      for (const field of nullableFields) {
        if (data[field] !== undefined) updateData[field] = data[field] === '' ? null : data[field];
      }
      if (data.issueDate !== undefined) updateData.issueDate = data.issueDate;
      if (data.dueDate !== undefined) {
        updateData.dueDate = data.dueDate === '' ? null : data.dueDate;
      }
      if (data.taxRate !== undefined) updateData.taxRate = data.taxRate;
      if (data.discount !== undefined) updateData.discount = data.discount;
      updateData.subtotal = totals.subtotal;
      updateData.taxAmount = totals.taxAmount;
      updateData.total = totals.total;

      return tx.invoice.update({ where: { id }, data: updateData, include: INVOICE_INCLUDE });
    });

    await AuditService.updated(organizationId, actorId, 'invoice', id, data, req);
    return updated;
  }

  static async sendInvoice(id: string, organizationId: string, actorId: string, req?: any) {
    await this.getInvoiceById(id, organizationId);
    const updated = await prisma.invoice.update({
      where: { id },
      data: { status: InvoiceStatus.sent },
      include: INVOICE_INCLUDE,
    });
    await AuditService.updated(organizationId, actorId, 'invoice', id, { status: 'sent' }, req);
    return updated;
  }

  static async recordPayment(
    invoiceId: string,
    organizationId: string,
    actorId: string,
    data: any,
    req?: any
  ) {
    const invoice = await this.getInvoiceById(invoiceId, organizationId);

    const payment = await prisma.payment.create({
      data: {
        invoiceId: invoice.id,
        amount: data.amount,
        method: data.method ?? PaymentMethod.bank_transfer,
        reference: data.reference,
        paidAt: data.paidAt ? new Date(data.paidAt) : new Date(),
        status: data.status ?? PaymentStatus.completed,
        notes: data.notes,
        organizationId,
        createdById: actorId,
      },
      include: PAYMENT_INCLUDE,
    });

    const amountPaid = invoice.amountPaid + data.amount;
    const fullyPaid = amountPaid >= invoice.total;
    const updated = await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        amountPaid,
        status: fullyPaid
          ? InvoiceStatus.paid
          : amountPaid > 0
            ? InvoiceStatus.partial_paid
            : invoice.status,
        paidAt: fullyPaid ? new Date() : undefined,
      },
      include: INVOICE_INCLUDE,
    });

    await AuditService.created(
      organizationId, actorId, 'payment', payment.id, { invoiceId: invoice.id, amount: data.amount }, req
    );
    await AuditService.updated(
      organizationId, actorId, 'invoice', invoice.id, { amountPaid, status: updated.status }, req
    );
    return payment;
  }

  static async getPayments(
    organizationId: string,
    filters?: { status?: string; contactId?: string }
  ) {
    const where: any = { organizationId };
    if (filters?.status) where.status = filters.status;
    if (filters?.contactId) where.invoice = { contactId: filters.contactId };
    return prisma.payment.findMany({
      where,
      include: PAYMENT_INCLUDE,
      orderBy: { paidAt: 'desc' },
    });
  }

  static async getPaymentById(id: string, organizationId: string) {
    const payment = await prisma.payment.findFirst({
      where: { id, organizationId },
      include: PAYMENT_INCLUDE,
    });
    if (!payment) throw new NotFoundError('Payment not found');
    return payment;
  }

  static async deleteInvoice(id: string, organizationId: string, actorId: string, req?: any) {
    await this.getInvoiceById(id, organizationId);
    await prisma.invoice.delete({ where: { id } });
    await AuditService.deleted(organizationId, actorId, 'invoice', id, undefined, req);
    return { success: true };
  }
}
