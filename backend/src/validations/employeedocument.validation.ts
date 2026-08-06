import { z } from 'zod';

export const createEmployeeDocumentSchema = z.object({
  body: z.object({
    employeeId: z.string().min(1, 'employeeId is required'),
    name: z.string().min(1, 'Name is required'),
    type: z.enum(['identity', 'education', 'salary', 'contract', 'other']).optional(),
    fileId: z.string().nullable().optional(),
  }),
});

export const updateEmployeeDocumentSchema = z.object({
  body: createEmployeeDocumentSchema.shape.body.partial(),
});
