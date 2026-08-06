import { z } from 'zod';

const invoiceItemSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().nullable().optional(),
  quantity: z.number().positive().default(1),
  unitPrice: z.number().nonnegative().default(0),
  taxRate: z.number().nonnegative().default(0),
});

export const createInvoiceSchema = z.object({
  body: z.object({
    quoteId: z.string().nullable().optional(),
    contactId: z.string().nullable().optional(),
    companyId: z.string().nullable().optional(),
    dealId: z.string().nullable().optional(),
    status: z.enum(['draft', 'sent', 'partial_paid', 'paid', 'overdue', 'cancelled']).optional(),
    issueDate: z.coerce.date().optional(),
    dueDate: z.coerce.date().nullable().optional(),
    currency: z.string().optional(),
    taxRate: z.number().nonnegative().optional(),
    discount: z.number().nonnegative().optional(),
    notes: z.string().nullable().optional(),
    items: z.array(invoiceItemSchema).optional(),
  }),
});

export const updateInvoiceSchema = z.object({
  body: createInvoiceSchema.shape.body.partial(),
});

export const sendInvoiceSchema = z.object({
  body: z.object({}).optional(),
});

export const recordPaymentSchema = z.object({
  body: z.object({
    amount: z.number().positive('Amount must be greater than 0'),
    method: z.enum(['cash', 'bank_transfer', 'card', 'upi', 'cheque', 'other']).optional(),
    reference: z.string().nullable().optional(),
    paidAt: z.coerce.date().optional(),
    status: z.enum(['pending', 'completed', 'failed', 'refunded']).optional(),
    notes: z.string().nullable().optional(),
  }),
});
