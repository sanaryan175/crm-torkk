import { z } from 'zod';

export const createJobPostingSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required'),
    department: z.string().nullable().optional(),
    location: z.string().nullable().optional(),
    type: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
    requirements: z.string().nullable().optional(),
    salaryRange: z.string().nullable().optional(),
    status: z.enum(['draft', 'published', 'closed']).optional(),
    postedAt: z.coerce.date().nullable().optional(),
  }),
});

export const updateJobPostingSchema = z.object({
  body: createJobPostingSchema.shape.body.partial(),
});

export const publishJobPostingSchema = z.object({
  body: z.object({
    status: z.enum(['draft', 'published', 'closed']).optional(),
  }),
});
