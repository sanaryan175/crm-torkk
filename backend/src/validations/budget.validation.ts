import { z } from 'zod';

export const createBudgetSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    category: z.string().nullable().optional(),
    amount: z.number().positive('Amount must be positive'),
    periodStart: z.coerce.date(),
    periodEnd: z.coerce.date(),
    status: z.enum(['draft', 'active', 'closed']).optional(),
  }),
});

export const updateBudgetSchema = z.object({
  body: createBudgetSchema.shape.body.partial(),
});
