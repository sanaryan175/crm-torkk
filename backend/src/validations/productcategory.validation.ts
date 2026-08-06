import { z } from 'zod';

export const createProductCategorySchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    parentId: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
  }),
});

export const updateProductCategorySchema = z.object({
  body: createProductCategorySchema.shape.body.partial(),
});
