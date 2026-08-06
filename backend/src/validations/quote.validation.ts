import { z } from 'zod';

const quoteItemSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().nullable().optional(),
  quantity: z.number().positive().default(1),
  unitPrice: z.number().nonnegative().default(0),
  taxRate: z.number().nonnegative().default(0),
});

export const createQuoteSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required'),
    contactId: z.string().nullable().optional(),
    companyId: z.string().nullable().optional(),
    dealId: z.string().nullable().optional(),
    status: z.enum(['draft', 'sent', 'accepted', 'rejected', 'expired', 'converted']).optional(),
    issueDate: z.coerce.date().optional(),
    expiryDate: z.coerce.date().nullable().optional(),
    currency: z.string().optional(),
    taxRate: z.number().nonnegative().optional(),
    discount: z.number().nonnegative().optional(),
    notes: z.string().nullable().optional(),
    items: z.array(quoteItemSchema).optional(),
  }),
});

export const updateQuoteSchema = z.object({
  body: createQuoteSchema.shape.body.partial(),
});

export const convertQuoteSchema = z.object({
  body: z.object({}).optional(),
});
