import { z } from 'zod';

export const auditLogsQuerySchema = z.object({
  query: z.object({
    userId: z.string().optional(),
    resource: z.string().optional(),
    from: z.string().optional(),
    to: z.string().optional(),
  }),
});
