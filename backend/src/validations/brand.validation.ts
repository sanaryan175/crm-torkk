import { z } from 'zod';

const brandFields = z.object({
  name: z.string().min(1, 'Name is required'),
  logo: z.string().nullable().optional(),
  primaryColor: z.string().nullable().optional(),
  secondaryColor: z.string().nullable().optional(),
  isDefault: z.boolean().optional(),
});

export const createBrandSchema = z.object({
  body: brandFields,
});

export const updateBrandSchema = z.object({
  body: brandFields.partial(),
});
