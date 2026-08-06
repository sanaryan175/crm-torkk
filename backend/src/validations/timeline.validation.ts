import { z } from 'zod';

export const createTimelineEntrySchema = z.object({
  body: z.object({
    contactId: z.string().nullable().optional(),
    dealId: z.string().nullable().optional(),
    companyId: z.string().nullable().optional(),
    type: z.enum(['note', 'call', 'email', 'meeting', 'system', 'task', 'other']).default('note'),
    title: z.string().min(1, 'Title is required'),
    content: z.string().nullable().optional(),
    metadata: z.record(z.any()).nullable().optional(),
  }),
});
