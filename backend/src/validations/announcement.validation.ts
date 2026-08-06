import { z } from 'zod';

export const createAnnouncementSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required'),
    content: z.string().min(1, 'Content is required'),
    status: z.enum(['draft', 'published', 'archived']).optional(),
    publishedAt: z.coerce.date().nullable().optional(),
  }),
});

export const updateAnnouncementSchema = z.object({
  body: createAnnouncementSchema.shape.body.partial(),
});
