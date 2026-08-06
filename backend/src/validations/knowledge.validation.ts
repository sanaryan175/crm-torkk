import { z } from 'zod';

export const createArticleSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required'),
    content: z.string().min(1, 'Content is required'),
    category: z.string().nullable().optional(),
    status: z.enum(['draft', 'published', 'archived']).optional(),
  }),
});

export const updateArticleSchema = z.object({
  body: createArticleSchema.shape.body.partial(),
});
