import { z } from 'zod';

export const createPerformanceReviewSchema = z.object({
  body: z.object({
    employeeId: z.string().min(1, 'Employee is required'),
    reviewerId: z.string().min(1, 'Reviewer is required'),
    periodStart: z.coerce.date().nullable().optional(),
    periodEnd: z.coerce.date().nullable().optional(),
    overallRating: z.number().int().min(1).max(5).nullable().optional(),
    strengths: z.string().nullable().optional(),
    improvements: z.string().nullable().optional(),
    goals: z.string().nullable().optional(),
    status: z.enum(['draft', 'submitted', 'completed']).optional(),
  }),
});

export const updatePerformanceReviewSchema = z.object({
  body: createPerformanceReviewSchema.shape.body.partial(),
});

export const submitPerformanceReviewSchema = z.object({
  body: z.object({}).optional(),
});
