import { z } from 'zod';

export const createCouponSchema = z.object({
  body: z.object({
    code: z.string().min(1, 'Coupon code is required'),
    name: z.string().min(1, 'Coupon name is required'),
    type: z.enum(['percent', 'fixed']),
    value: z.number().nonnegative('Coupon value must be positive'),
    minOrderValue: z.number().nonnegative().nullable().optional(),
    maxDiscount: z.number().nonnegative().nullable().optional(),
    usageLimit: z.number().int().nonnegative().optional(),
    validFrom: z.coerce.date().nullable().optional(),
    validTo: z.coerce.date().nullable().optional(),
    isActive: z.boolean().optional(),
  }),
});

export const updateCouponSchema = z.object({
  body: createCouponSchema.shape.body.partial(),
});

export const validateCouponSchema = z.object({
  body: z.object({
    code: z.string().min(1, 'Coupon code is required'),
  }),
});
