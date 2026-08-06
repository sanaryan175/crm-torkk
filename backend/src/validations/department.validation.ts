import { z } from 'zod';

export const createDepartmentSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    headId: z.string().nullable().optional(),
  }),
});

export const updateDepartmentSchema = z.object({
  body: createDepartmentSchema.shape.body.partial(),
});
