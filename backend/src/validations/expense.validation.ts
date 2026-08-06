import { z } from 'zod';

export const createExpenseSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required'),
    category: z.string().nullable().optional(),
    amount: z.number().positive('Amount must be positive'),
    expenseDate: z.coerce.date().optional(),
    method: z.enum(['cash', 'bank_transfer', 'card', 'upi', 'cheque', 'other']).optional(),
    paidById: z.string().nullable().optional(),
    vendorName: z.string().nullable().optional(),
    receiptFileId: z.string().nullable().optional(),
    status: z.enum(['pending', 'approved', 'rejected', 'reimbursed']).optional(),
    notes: z.string().nullable().optional(),
  }),
});

export const updateExpenseSchema = z.object({
  body: createExpenseSchema.shape.body.partial(),
});

export const approveExpenseSchema = z.object({
  body: z.object({
    status: z.enum(['pending', 'approved', 'rejected', 'reimbursed']).optional(),
  }).optional(),
});
