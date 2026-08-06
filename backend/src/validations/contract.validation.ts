import { z } from 'zod';

export const createContractSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required'),
    contractNumber: z.string().optional(),
    type: z.string().nullable().optional(),
    status: z.enum(['draft', 'active', 'expired', 'terminated']).optional(),
    contactId: z.string().nullable().optional(),
    companyId: z.string().nullable().optional(),
    dealId: z.string().nullable().optional(),
    startDate: z.coerce.date().nullable().optional(),
    endDate: z.coerce.date().nullable().optional(),
    renewalDate: z.coerce.date().nullable().optional(),
    value: z.number().nonnegative().optional(),
    terms: z.string().nullable().optional(),
    fileId: z.string().nullable().optional(),
  }),
});

export const updateContractSchema = z.object({
  body: createContractSchema.shape.body.partial(),
});

export const signContractSchema = z.object({
  body: z.object({
    signedByName: z.string().min(1, 'Signed by name is required'),
  }),
});
