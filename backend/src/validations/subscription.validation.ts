import { z } from 'zod';

export const updateSubscriptionSchema = z.object({
  body: z.object({
    plan: z.enum(['free', 'starter', 'growth', 'enterprise']),
    status: z.enum(['trial', 'active', 'past_due', 'cancelled', 'expired']).optional(),
    seats: z.number().int().nonnegative().optional(),
    amount: z.number().nonnegative().optional(),
    renewDate: z.string().optional().refine(
      (v) => v === undefined || !isNaN(Date.parse(v)),
      { message: 'Invalid renewDate' }
    ),
  }),
});
