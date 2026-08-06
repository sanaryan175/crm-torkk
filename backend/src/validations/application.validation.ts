import { z } from 'zod';

export const createApplicationSchema = z.object({
  body: z.object({
    jobPostingId: z.string().min(1, 'Job posting is required'),
    candidateName: z.string().min(1, 'Candidate name is required'),
    candidateEmail: z.string().email('A valid email is required'),
    phone: z.string().nullable().optional(),
    resumeUrl: z.string().nullable().optional(),
    coverLetter: z.string().nullable().optional(),
    status: z.enum(['applied', 'shortlisted', 'interviewing', 'offered', 'hired', 'rejected', 'withdrawn']).optional(),
    source: z.string().nullable().optional(),
    notes: z.string().nullable().optional(),
  }),
});

export const updateApplicationSchema = z.object({
  body: createApplicationSchema.shape.body.partial(),
});

export const updateApplicationStatusSchema = z.object({
  body: z.object({
    status: z.enum(['applied', 'shortlisted', 'interviewing', 'offered', 'hired', 'rejected', 'withdrawn']),
  }),
});
