import { z } from 'zod';

export const createApprovalFlowSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    description: z.string().nullable().optional(),
    module: z.string().min(1, 'Module is required'),
    steps: z.any(),
    isActive: z.boolean().optional(),
  }),
});

export const updateApprovalFlowSchema = z.object({
  body: createApprovalFlowSchema.shape.body.partial(),
});

export const createApprovalRequestSchema = z.object({
  body: z.object({
    flowId: z.string().min(1).optional(),
    module: z.string().optional(),
    resourceId: z.string().optional(),
    title: z.string().min(1, 'Title is required'),
    reason: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
    data: z.any().optional(),
  }),
});

export const decideApprovalSchema = z.object({
  body: z.object({
    decision: z.enum(['approved', 'rejected']),
    comment: z.string().nullable().optional(),
  }),
});
