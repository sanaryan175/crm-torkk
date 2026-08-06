import { z } from 'zod';

export const createVendorSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    company: z.string().nullable().optional(),
    email: z.string().email().nullable().optional(),
    phone: z.string().nullable().optional(),
    address: z.string().nullable().optional(),
    paymentTerms: z.string().nullable().optional(),
    notes: z.string().nullable().optional(),
    status: z.string().optional(),
  }),
});

export const updateVendorSchema = z.object({
  body: createVendorSchema.shape.body.partial(),
});
