import { z } from 'zod';

export const createEmailTrackingSchema = z.object({
  body: z.object({
    activityId: z.string().nullable().optional(),
    toEmail: z.string().email(),
    subject: z.string().nullable().optional(),
    metadata: z.record(z.any()).nullable().optional(),
  }),
});
