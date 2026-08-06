import { z } from 'zod';

export const createCampaignSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Campaign name is required'),
    type: z.enum(['email', 'whatsapp', 'sms', 'push']),
    status: z.enum(['draft', 'scheduled', 'sending', 'sent', 'completed', 'paused', 'failed']).optional(),
    subject: z.string().nullable().optional(),
    content: z.string().min(1, 'Campaign content is required'),
    audience: z.any().optional(),
    scheduledAt: z.coerce.date().nullable().optional(),
  }),
});

export const updateCampaignSchema = z.object({
  body: createCampaignSchema.shape.body.partial(),
});

export const sendCampaignSchema = z.object({
  body: z.object({
    recipients: z.array(
      z.object({
        contactId: z.string().optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
      })
    ).min(1, 'At least one recipient is required'),
  }),
});
