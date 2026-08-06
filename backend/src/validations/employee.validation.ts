import { z } from 'zod';

export const createEmployeeSchema = z.object({
  body: z.object({
    userId: z.string().nullable().optional(),
    employeeCode: z.string().min(1, 'Employee code is required'),
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().email(),
    phone: z.string().nullable().optional(),
    departmentId: z.string().nullable().optional(),
    designation: z.string().nullable().optional(),
    employmentType: z.enum(['full_time', 'part_time', 'contract', 'internship']).optional(),
    joinDate: z.coerce.date().nullable().optional(),
    exitDate: z.coerce.date().nullable().optional(),
    status: z.enum(['active', 'on_leave', 'resigned', 'terminated', 'exited']).optional(),
    managerId: z.string().nullable().optional(),
    salary: z.number().nonnegative().nullable().optional(),
    currency: z.string().optional(),
  }),
});

export const updateEmployeeSchema = z.object({
  body: createEmployeeSchema.shape.body.partial(),
});
