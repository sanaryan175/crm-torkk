import { z } from 'zod';

const prItemSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  quantity: z.number().positive().default(1),
  unitPrice: z.number().nonnegative().default(0),
  notes: z.string().nullable().optional(),
});

export const createPurchaseRequestSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required'),
    department: z.string().nullable().optional(),
    requestedById: z.string().optional(),
    requestedDate: z.coerce.date().optional(),
    neededDate: z.coerce.date().nullable().optional(),
    status: z.enum(['draft', 'pending', 'approved', 'rejected']).optional(),
    items: z.array(prItemSchema).optional(),
    notes: z.string().nullable().optional(),
  }),
});

export const updatePurchaseRequestSchema = z.object({
  body: createPurchaseRequestSchema.shape.body.partial(),
});

export const approvePurchaseRequestSchema = z.object({
  body: z.object({}).optional(),
});
