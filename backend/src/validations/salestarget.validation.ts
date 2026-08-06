import { z } from 'zod';

export const createSalesTargetSchema = z.object({
  body: z.object({
    assignedToId: z.string().min(1, 'Assigned user is required'),
    period: z.string().min(1, 'Period is required'),
    periodStart: z.coerce.date(),
    periodEnd: z.coerce.date(),
    targetAmount: z.number().nonnegative('Target amount must be positive'),
  }),
});

export const updateSalesTargetSchema = z.object({
  body: createSalesTargetSchema.shape.body.partial(),
});
