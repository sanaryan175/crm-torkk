import { z } from 'zod';

export const markReadSchema = z.object({
  body: z
    .object({
      id: z.string().min(1).optional(),
      all: z.boolean().optional(),
    })
    .refine((v) => !!v.id || !!v.all, {
      message: 'Provide an id or set all to true',
      path: ['id'],
    }),
});
