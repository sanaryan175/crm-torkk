import { z } from 'zod';

export const createApiKeySchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    scopes: z.array(z.string()).optional(),
    expiresAt: z.string().optional().refine(
      (v) => v === undefined || !isNaN(Date.parse(v)),
      { message: 'Invalid expiresAt date' }
    ),
  }),
});

export const updateTwoFactorSchema = z.object({
  body: z.object({
    enabled: z.boolean(),
    method: z.string().optional(),
  }),
});

export const verifyTwoFactorSchema = z.object({
  body: z.object({
    code: z.string().min(1, 'Verification code is required'),
  }),
});

export const loginHistoryQuerySchema = z.object({
  query: z.object({
    userId: z.string().optional(),
  }),
});
