import { z } from 'zod';

export const createProjectTaskSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Task title is required'),
    description: z.string().nullable().optional(),
    status: z.enum(['todo', 'in_progress', 'in_review', 'done']).optional(),
    priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
    projectId: z.string().nullable().optional(),
    milestoneId: z.string().nullable().optional(),
    assigneeId: z.string().nullable().optional(),
    startDate: z.coerce.date().nullable().optional(),
    dueDate: z.coerce.date().nullable().optional(),
    estimatedHours: z.number().nonnegative('Estimated hours must be positive').nullable().optional(),
  }),
});

export const updateProjectTaskSchema = z.object({
  body: createProjectTaskSchema.shape.body.partial(),
});

export const updateProjectTaskStatusSchema = z.object({
  body: z.object({
    status: z.enum(['todo', 'in_progress', 'in_review', 'done']),
  }),
});
