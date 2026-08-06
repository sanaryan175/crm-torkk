import { z } from 'zod';

export const createOfferLetterSchema = z.object({
  body: z.object({
    applicationId: z.string().nullable().optional(),
    candidateName: z.string().min(1, 'Candidate name is required'),
    candidateEmail: z.string().email('A valid email is required'),
    position: z.string().min(1, 'Position is required'),
    salary: z.number().nonnegative().optional(),
    joiningDate: z.coerce.date().nullable().optional(),
    status: z.enum(['draft', 'sent', 'accepted', 'rejected', 'withdrawn']).optional(),
  }),
});

export const updateOfferLetterSchema = z.object({
  body: createOfferLetterSchema.shape.body.partial(),
});

export const updateOfferLetterStatusSchema = z.object({
  body: z.object({
    status: z.enum(['draft', 'sent', 'accepted', 'rejected', 'withdrawn']),
  }),
});
