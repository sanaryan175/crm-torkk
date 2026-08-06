import { z } from 'zod';

export const createFollowUpSchema = z.object({
  body: z.object({
    contactId: z.string().nullable().optional(),
    dealId: z.string().nullable().optional(),
    leadId: z.string().nullable().optional(),
    title: z.string().min(1, 'Title is required'),
    notes: z.string().nullable().optional(),
    scheduledAt: z.string().refine((v) => !isNaN(Date.parse(v)), 'Invalid date'),
    assignedToId: z.string().nullable().optional(),
  }),
});

export const updateFollowUpSchema = z.object({
  body: z.object({
    title: z.string().min(1).optional(),
    notes: z.string().nullable().optional(),
    scheduledAt: z.string().refine((v) => !isNaN(Date.parse(v)), 'Invalid date').optional(),
    assignedToId: z.string().nullable().optional(),
  }),
});

export const completeFollowUpSchema = z.object({
  body: z.object({
    notes: z.string().nullable().optional(),
  }),
});
