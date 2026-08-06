import { z } from 'zod';

export const createPromotionSchema = z.object({
  body: z.object({
    employeeId: z.string().min(1, 'Employee is required'),
    fromDesignation: z.string().nullable().optional(),
    toDesignation: z.string().min(1, 'To designation is required'),
    effectiveDate: z.coerce.date().nullable().optional(),
    reason: z.string().nullable().optional(),
    approvedById: z.string().nullable().optional(),
    approvedAt: z.coerce.date().nullable().optional(),
    oldSalary: z.number().nonnegative().nullable().optional(),
    newSalary: z.number().nonnegative().nullable().optional(),
  }),
});

export const updatePromotionSchema = z.object({
  body: createPromotionSchema.shape.body.partial(),
});
