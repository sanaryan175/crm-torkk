import { z } from 'zod';

export const createTrainingSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().nullable().optional(),
    type: z.string().nullable().optional(),
    startDate: z.coerce.date().nullable().optional(),
    endDate: z.coerce.date().nullable().optional(),
    status: z.enum(['planned', 'in_progress', 'completed', 'cancelled']).optional(),
  }),
});

export const updateTrainingSchema = z.object({
  body: createTrainingSchema.shape.body.partial(),
});

export const enrollTrainingSchema = z.object({
  body: z.object({
    employeeId: z.string().min(1, 'Employee is required'),
  }),
});

export const completeTrainingEnrollmentSchema = z.object({
  body: z.object({}).optional(),
});
