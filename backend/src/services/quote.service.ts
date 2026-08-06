import prisma from '../config/db';
import { NotFoundError } from '../utils/errors';
import { QuoteStatus, InvoiceStatus } from '@prisma/client';
import { AuditService } from './audit.service';

const QUOTE_INCLUDE = {
  items: { orderBy: { sortOrder: 'asc' as const } },
};

interface ItemPayload {
  name: string;
  description?: string | null;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  sortOrder?: number;
}

export class QuoteService {
  private static computeTotals(items: ItemPayload[], discount = 0) {
    const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const taxAmount = items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice * (item.taxRate / 100),
      0
    );
    return { subtotal, taxAmount, total: subtotal + taxAmount - discount };
  }

  static async getQuotes(
    organizationId: string,
    filters?: { status?: string; contactId?: string }
  ) {
    const where: any = { organizationId };
    if (filters?.status) where.status = filters.status;
    if (filters?.contactId) where.contactId = filters.contactId;
    return prisma.quote.findMany({ where, include: QUOTE_INCLUDE, orderBy: { createdAt: 'desc' } });
  }

  static async getQuoteById(id: string, organizationId: string) {
    const quote = await prisma.quote.findFirst({
      where: { id, organizationId },
      include: QUOTE_INCLUDE,
    });
    if (!quote) throw new NotFoundError('Quote not found');
    return quote;
  }

  static async createQuote(
    organizationId: string,
    createdById: string,
    data: any,
    req?: any
  ) {
    const items: ItemPayload[] = (data.items ?? []).map(
      (item: any, index: number) => ({ ...item, sortOrder: index })
    );
    const totals = this.computeTotals(items, data.discount ?? 0);

    const quote = await prisma.$transaction(async (tx) => {
      const count = await tx.quote.count({ where: { organizationId } });
      const quoteNumber = `QT-${String(count + 1).padStart(4, '0')}`;
      return tx.quote.create({
        data: {
          quoteNumber,
          title: data.title,
          contactId: data.contactId,
          companyId: data.companyId,
          dealId: data.dealId,
          status: data.status,
          issueDate: data.issueDate,
          expiryDate: data.expiryDate,
          currency: data.currency,
          taxRate: data.taxRate ?? 0,
          discount: data.discount ?? 0,
          subtotal: totals.subtotal,
          taxAmount: totals.taxAmount,
          total: totals.total,
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
        include: QUOTE_INCLUDE,
      });
    });

    await AuditService.created(organizationId, createdById, 'quote', quote.id, undefined, req);
    return quote;
  }

  static async updateQuote(
    id: string,
    organizationId: string,
    actorId: string,
    data: any,
    req?: any
  ) {
    const existing = await this.getQuoteById(id, organizationId);

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
        await tx.quoteItem.deleteMany({ where: { quoteId: id } });
        await tx.quoteItem.createMany({
          data: items.map((item) => ({
            quoteId: id,
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
      const scalarFields = ['title', 'status', 'currency', 'notes'] as const;
      for (const field of scalarFields) {
        if (data[field] !== undefined) updateData[field] = data[field];
      }
      const nullableFields = ['contactId', 'companyId', 'dealId'] as const;
      for (const field of nullableFields) {
        if (data[field] !== undefined) updateData[field] = data[field] === '' ? null : data[field];
      }
      if (data.issueDate !== undefined) updateData.issueDate = data.issueDate;
      if (data.expiryDate !== undefined) {
        updateData.expiryDate = data.expiryDate === '' ? null : data.expiryDate;
      }
      if (data.taxRate !== undefined) updateData.taxRate = data.taxRate;
      if (data.discount !== undefined) updateData.discount = data.discount;
      updateData.subtotal = totals.subtotal;
      updateData.taxAmount = totals.taxAmount;
      updateData.total = totals.total;

      return tx.quote.update({ where: { id }, data: updateData, include: QUOTE_INCLUDE });
    });

    await AuditService.updated(organizationId, actorId, 'quote', id, data, req);
    return updated;
  }

  static async convertQuote(id: string, organizationId: string, actorId: string, req?: any) {
    const quote = await this.getQuoteById(id, organizationId);

    const invoice = await prisma.$transaction(async (tx) => {
      const count = await tx.invoice.count({ where: { organizationId } });
      const created = await tx.invoice.create({
        data: {
          invoiceNumber: `INV-${String(count + 1).padStart(4, '0')}`,
          quoteId: quote.id,
          contactId: quote.contactId,
          companyId: quote.companyId,
          dealId: quote.dealId,
          status: InvoiceStatus.sent,
          issueDate: new Date(),
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          currency: quote.currency,
          taxRate: quote.taxRate,
          discount: quote.discount,
          subtotal: quote.subtotal,
          taxAmount: quote.taxAmount,
          total: quote.total,
          amountPaid: 0,
          notes: quote.notes,
          organizationId,
          createdById: actorId,
          items: {
            create: quote.items.map((item) => ({
              name: item.name,
              description: item.description,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              taxRate: item.taxRate,
              lineTotal: item.lineTotal,
              sortOrder: item.sortOrder,
              organizationId,
            })),
          },
        },
        include: { items: { orderBy: { sortOrder: 'asc' } }, payments: true },
      });
      await tx.quote.update({ where: { id }, data: { status: QuoteStatus.converted } });
      return created;
    });

    await AuditService.created(
      organizationId, actorId, 'invoice', invoice.id, { fromQuote: quote.id }, req
    );
    await AuditService.updated(
      organizationId, actorId, 'quote', quote.id, { status: QuoteStatus.converted }, req
    );
    return invoice;
  }

  static async deleteQuote(id: string, organizationId: string, actorId: string, req?: any) {
    await this.getQuoteById(id, organizationId);
    await prisma.quote.delete({ where: { id } });
    await AuditService.deleted(organizationId, actorId, 'quote', id, undefined, req);
    return { success: true };
  }
}
