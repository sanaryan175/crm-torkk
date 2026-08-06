import { z } from 'zod';

export const createAttendanceSchema = z.object({
  body: z.object({
    employeeId: z.string().min(1, 'employeeId is required'),
    date: z.coerce.date(),
    status: z.enum(['present', 'absent', 'half_day', 'late', 'holiday']).optional(),
    checkIn: z.coerce.date().nullable().optional(),
    checkOut: z.coerce.date().nullable().optional(),
    hours: z.number().nonnegative().nullable().optional(),
    overtime: z.number().nonnegative().nullable().optional(),
    notes: z.string().nullable().optional(),
  }),
});

export const updateAttendanceSchema = z.object({
  body: createAttendanceSchema.shape.body.partial(),
});
