import { z } from 'zod';

export const createIncomeSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required'),
    category: z.string().nullable().optional(),
    amount: z.number().positive('Amount must be positive'),
    incomeDate: z.coerce.date().optional(),
    method: z.enum(['cash', 'bank_transfer', 'card', 'upi', 'cheque', 'other']).optional(),
    source: z.string().nullable().optional(),
    notes: z.string().nullable().optional(),
  }),
});

export const updateIncomeSchema = z.object({
  body: createIncomeSchema.shape.body.partial(),
});
