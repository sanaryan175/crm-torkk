import { z } from 'zod';

export const getCommissionsSchema = z.object({
  query: z.object({
    userId: z.string().optional(),
  }),
});
