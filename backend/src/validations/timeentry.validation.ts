import { z } from 'zod';

export const createTimeEntrySchema = z.object({
  body: z.object({
    userId: z.string().min(1, 'userId is required'),
    projectId: z.string().nullable().optional(),
    taskId: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
    hours: z.number().positive('Hours must be positive'),
    billable: z.boolean().optional(),
    entryDate: z.coerce.date().optional(),
  }),
});

export const updateTimeEntrySchema = z.object({
  body: createTimeEntrySchema.shape.body.partial(),
});
