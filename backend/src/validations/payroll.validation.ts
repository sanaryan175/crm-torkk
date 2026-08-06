import { z } from 'zod';

const payrollEntrySchema = z.object({
  employeeId: z.string().min(1, 'Employee is required'),
  basicPay: z.number().nonnegative().optional(),
  allowances: z.number().nonnegative().optional(),
  deductions: z.number().nonnegative().optional(),
  tax: z.number().nonnegative().optional(),
});

export const createPayrollRunSchema = z.object({
  body: z.object({
    periodStart: z.coerce.date(),
    periodEnd: z.coerce.date(),
    employees: z.array(payrollEntrySchema).min(1, 'At least one employee is required'),
  }),
});

export const updatePayrollRunSchema = z.object({
  body: z.object({
    periodStart: z.coerce.date().optional(),
    periodEnd: z.coerce.date().optional(),
  }),
});

export const updatePayrollStatusSchema = z.object({
  body: z.object({
    status: z.enum(['draft', 'processed', 'approved', 'paid']),
  }),
});
