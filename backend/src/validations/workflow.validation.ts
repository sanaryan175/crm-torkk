import { z } from 'zod';

export const createScheduledJobSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    type: z.string().min(1, 'Type is required'),
    cron: z.string().nullable().optional(),
    payload: z.any().optional(),
    isActive: z.boolean().optional(),
    lastRunAt: z.coerce.date().nullable().optional(),
    nextRunAt: z.coerce.date().nullable().optional(),
  }),
});

export const updateScheduledJobSchema = z.object({
  body: createScheduledJobSchema.shape.body.partial(),
});

export const createBusinessRuleSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    entity: z.string().min(1, 'Entity is required'),
    condition: z.any(),
    action: z.any(),
    isActive: z.boolean().optional(),
  }),
});

export const updateBusinessRuleSchema = z.object({
  body: createBusinessRuleSchema.shape.body.partial(),
});
