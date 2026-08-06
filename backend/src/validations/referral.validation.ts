import { z } from 'zod';

export const createReferralSchema = z.object({
  body: z.object({
    referrerName: z.string().min(1, 'Referrer name is required'),
    referrerEmail: z.string().email().nullable().optional(),
    referredName: z.string().min(1, 'Referred name is required'),
    referredEmail: z.string().email().nullable().optional(),
    referredPhone: z.string().nullable().optional(),
    status: z.string().optional(),
    rewardAmount: z.number().nonnegative().nullable().optional(),
    convertedAt: z.coerce.date().nullable().optional(),
  }),
});

export const updateReferralSchema = z.object({
  body: createReferralSchema.shape.body.partial(),
});
