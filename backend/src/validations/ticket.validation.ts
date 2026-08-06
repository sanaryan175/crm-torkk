import { z } from 'zod';

export const createTicketSchema = z.object({
  body: z.object({
    subject: z.string().min(1, 'Subject is required'),
    description: z.string().nullable().optional(),
    status: z.enum(['open', 'in_progress', 'on_hold', 'resolved', 'closed']).optional(),
    priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
    contactId: z.string().nullable().optional(),
    customerName: z.string().nullable().optional(),
    customerEmail: z.string().email().nullable().optional(),
    assignedToId: z.string().nullable().optional(),
    slaDueAt: z.string().refine((v) => !isNaN(Date.parse(v)), 'Invalid date').nullable().optional(),
    tags: z.array(z.string()).optional(),
  }),
});

export const updateTicketSchema = z.object({
  body: createTicketSchema.shape.body.partial(),
});

export const createTicketCommentSchema = z.object({
  body: z.object({
    content: z.string().min(1, 'Content is required'),
    isInternal: z.boolean().optional(),
  }),
});
