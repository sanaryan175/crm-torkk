import { z } from 'zod';

export const createEmployeeExitSchema = z.object({
  body: z.object({
    employeeId: z.string().min(1, 'employeeId is required'),
    resignDate: z.coerce.date(),
    lastWorkingDay: z.coerce.date().nullable().optional(),
    reason: z.string().nullable().optional(),
    exitInterview: z.string().nullable().optional(),
    status: z.enum(['requested', 'approved', 'completed', 'withdrawn']).optional(),
  }),
});

export const updateEmployeeExitSchema = z.object({
  body: createEmployeeExitSchema.shape.body.partial(),
});
