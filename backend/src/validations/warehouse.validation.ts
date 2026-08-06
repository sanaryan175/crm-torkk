import { z } from 'zod';

export const createWarehouseSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    code: z.string().nullable().optional(),
    address: z.string().nullable().optional(),
    managerId: z.string().nullable().optional(),
    isActive: z.boolean().optional(),
  }),
});

export const updateWarehouseSchema = z.object({
  body: createWarehouseSchema.shape.body.partial(),
});
