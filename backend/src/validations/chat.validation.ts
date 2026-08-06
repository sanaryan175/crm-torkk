import { z } from 'zod';

const messageBodySchema = z.object({
  receiverId: z.string().min(1, 'receiverId is required'),
  content: z.string().min(1).optional(),
  message: z.string().min(1).optional(),
});

export const createMessageSchema = z.object({
  body: messageBodySchema.refine((v) => !!v.content || !!v.message, {
    message: 'Provide either content or message',
    path: ['content'],
  }),
});
