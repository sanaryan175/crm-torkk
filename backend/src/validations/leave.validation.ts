import { z } from 'zod';

export const createLeaveSchema = z.object({
  body: z.object({
    employeeId: z.string().min(1, 'employeeId is required'),
    type: z.enum(['casual', 'sick', 'paid', 'unpaid', 'maternity', 'paternity', 'bereavement', 'other']),
    status: z.enum(['pending', 'approved', 'rejected', 'cancelled']).optional(),
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    days: z.number().positive().optional(),
    reason: z.string().nullable().optional(),
    reviewNotes: z.string().nullable().optional(),
  }),
});

export const updateLeaveSchema = z.object({
  body: createLeaveSchema.shape.body.partial(),
});

export const updateLeaveStatusSchema = z.object({
  body: z.object({
    status: z.enum(['pending', 'approved', 'rejected', 'cancelled']),
    reviewNotes: z.string().nullable().optional(),
  }),
});
