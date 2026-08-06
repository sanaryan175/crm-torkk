import { z } from 'zod';

export const createInterviewSchema = z.object({
  body: z.object({
    applicationId: z.string().nullable().optional(),
    jobPostingId: z.string().nullable().optional(),
    candidateName: z.string().min(1, 'Candidate name is required'),
    candidateEmail: z.string().email('A valid email is required'),
    scheduledAt: z.coerce.date(),
    duration: z.number().int().positive().optional(),
    type: z.enum(['phone', 'video', 'onsite', 'technical', 'hr']),
    interviewerId: z.string().nullable().optional(),
    notes: z.string().nullable().optional(),
    rating: z.number().int().min(0).max(5).nullable().optional(),
  }),
});

export const updateInterviewSchema = z.object({
  body: createInterviewSchema.shape.body.partial(),
});

export const updateInterviewResultSchema = z.object({
  body: z.object({
    result: z.enum(['scheduled', 'completed', 'cancelled', 'no_show']),
  }),
});
