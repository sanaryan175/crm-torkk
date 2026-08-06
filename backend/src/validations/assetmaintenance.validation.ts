import { z } from 'zod';

export const createAssetMaintenanceSchema = z.object({
  body: z.object({
    assetId: z.string().min(1, 'Asset is required'),
    type: z.enum(['repair', 'service', 'inspection', 'upgrade']),
    description: z.string().nullable().optional(),
    scheduledDate: z.coerce.date().nullable().optional(),
    completedDate: z.coerce.date().nullable().optional(),
    cost: z.number().nonnegative().optional(),
    vendor: z.string().nullable().optional(),
    status: z.enum(['scheduled', 'in_progress', 'completed', 'cancelled']).optional(),
  }),
});

export const updateAssetMaintenanceSchema = z.object({
  body: createAssetMaintenanceSchema.shape.body.partial(),
});
