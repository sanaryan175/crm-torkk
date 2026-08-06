import { z } from 'zod';

export const createSlaPolicySchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    priority: z.string().min(1, 'Priority is required'),
    responseHours: z.number().nonnegative(),
    resolutionHours: z.number().nonnegative(),
    isDefault: z.boolean().optional(),
  }),
});

export const updateSlaPolicySchema = z.object({
  body: createSlaPolicySchema.shape.body.partial(),
});
