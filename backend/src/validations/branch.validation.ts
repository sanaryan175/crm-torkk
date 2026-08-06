import { z } from 'zod';

const branchFields = z.object({
  name: z.string().min(1, 'Name is required'),
  brandId: z.string().nullable().optional(),
  code: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  state: z.string().nullable().optional(),
  country: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  email: z.string().email().nullable().optional(),
  isActive: z.boolean().optional(),
});

export const createBranchSchema = z.object({
  body: branchFields,
});

export const updateBranchSchema = z.object({
  body: branchFields.partial(),
});

export const branchQuerySchema = z.object({
  query: z.object({
    brandId: z.string().optional(),
  }),
});
