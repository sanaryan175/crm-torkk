import { z } from 'zod';

export const createBankAccountSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    bankName: z.string().min(1, 'Bank name is required'),
    accountNumber: z.string().min(1, 'Account number is required'),
    accountType: z.enum(['current', 'savings', 'overdraft']).optional(),
    ifsc: z.string().nullable().optional(),
    branch: z.string().nullable().optional(),
    openingBalance: z.number().default(0),
    balance: z.number().default(0),
    isDefault: z.boolean().optional(),
    isActive: z.boolean().optional(),
  }),
});

export const updateBankAccountSchema = z.object({
  body: createBankAccountSchema.shape.body.partial(),
});
