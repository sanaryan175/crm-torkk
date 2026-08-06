import { z } from 'zod';

export const createProductSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    sku: z.string().nullable().optional(),
    barcode: z.string().nullable().optional(),
    categoryId: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
    unit: z.string().nullable().optional(),
    price: z.number().nonnegative().optional(),
    cost: z.number().nonnegative().optional(),
    taxRate: z.number().nonnegative().optional(),
    reorderLevel: z.number().int().nonnegative().optional(),
    status: z.enum(['active', 'inactive', 'discontinued']).optional(),
  }),
});

export const updateProductSchema = z.object({
  body: createProductSchema.shape.body.partial(),
});
