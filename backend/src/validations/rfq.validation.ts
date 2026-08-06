import { z } from 'zod';

const rfqItemSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  quantity: z.number().positive().default(1),
  unitPrice: z.number().nonnegative().default(0),
  notes: z.string().nullable().optional(),
});

export const createRfqSchema = z.object({
  body: z.object({
    vendorId: z.string().nullable().optional(),
    title: z.string().min(1, 'Title is required'),
    status: z.enum(['draft', 'sent', 'received', 'closed']).optional(),
    issuedDate: z.coerce.date().nullable().optional(),
    dueDate: z.coerce.date().nullable().optional(),
    items: z.array(rfqItemSchema).optional(),
    notes: z.string().nullable().optional(),
  }),
});

export const updateRfqSchema = z.object({
  body: createRfqSchema.shape.body.partial(),
});
