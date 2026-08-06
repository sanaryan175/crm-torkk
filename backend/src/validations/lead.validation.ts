import { z } from 'zod';

export const createLeadSchema = z.object({
  body: z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().email().nullable().optional(),
    phone: z.string().nullable().optional(),
    company: z.string().nullable().optional(),
    jobTitle: z.string().nullable().optional(),
    source: z.enum(['website', 'referral', 'cold_outreach', 'event', 'partner', 'other', 'social_media', 'paid_ads']).optional(),
    status: z.enum(['new', 'contacted', 'qualified', 'unqualified', 'converted', 'lost']).optional(),
    tags: z.array(z.string()).optional(),
    value: z.number().nonnegative().nullable().optional(),
    notes: z.string().nullable().optional(),
    assignedToId: z.string().nullable().optional(),
  }),
});

export const updateLeadSchema = z.object({
  body: createLeadSchema.shape.body.partial(),
});

export const convertLeadSchema = z.object({
  body: z.object({
    status: z.enum(['converted', 'lost']).default('converted'),
    contactId: z.string().nullable().optional(),
    dealTitle: z.string().nullable().optional(),
    dealValue: z.number().nonnegative().nullable().optional(),
  }),
});
