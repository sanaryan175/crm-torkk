import { z } from 'zod';

export const createDocumentSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    category: z.string().nullable().optional(),
    fileId: z.string().nullable().optional(),
    relatedModel: z.string().nullable().optional(),
    relatedId: z.string().nullable().optional(),
    status: z.enum(['draft', 'active', 'archived']).optional(),
    signed: z.boolean().optional(),
    signedAt: z.coerce.date().nullable().optional(),
    signatureName: z.string().nullable().optional(),
    signatureData: z.string().nullable().optional(),
    size: z.number().nonnegative().optional(),
    note: z.string().nullable().optional(),
  }),
});

export const updateDocumentSchema = z.object({
  body: createDocumentSchema.shape.body.partial(),
});
