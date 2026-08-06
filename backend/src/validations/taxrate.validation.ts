import { z } from 'zod';

export const createTaxRateSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    rate: z.number().nonnegative('Rate must be non-negative'),
    type: z.enum(['gst', 'vat', 'service_tax', 'custom']),
    cgst: z.number().nonnegative().nullable().optional(),
    sgst: z.number().nonnegative().nullable().optional(),
    igst: z.number().nonnegative().nullable().optional(),
    isDefault: z.boolean().optional(),
    isActive: z.boolean().optional(),
  }),
});

export const updateTaxRateSchema = z.object({
  body: createTaxRateSchema.shape.body.partial(),
});
