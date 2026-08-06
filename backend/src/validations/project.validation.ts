import { z } from 'zod';

export const createProjectSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Project name is required'),
    code: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
    status: z.enum(['planning', 'active', 'on_hold', 'completed', 'archived']).optional(),
    startDate: z.coerce.date().nullable().optional(),
    endDate: z.coerce.date().nullable().optional(),
    budget: z.number().nonnegative('Budget must be positive').nullable().optional(),
    managerId: z.string().nullable().optional(),
  }),
});

export const updateProjectSchema = z.object({
  body: createProjectSchema.shape.body.partial(),
});

export const addProjectMemberSchema = z.object({
  body: z.object({
    userId: z.string().min(1, 'userId is required'),
    role: z.string().optional(),
  }),
});

export const createProjectMilestoneSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Milestone name is required'),
    description: z.string().nullable().optional(),
    dueDate: z.coerce.date().nullable().optional(),
    status: z.string().optional(),
  }),
});

export const updateProjectMilestoneSchema = z.object({
  body: createProjectMilestoneSchema.shape.body.partial(),
});
