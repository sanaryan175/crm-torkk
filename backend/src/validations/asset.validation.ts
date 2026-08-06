import { z } from 'zod';

export const createAssetSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    assetCode: z.string().nullable().optional(),
    category: z.enum(['laptop', 'phone', 'tablet', 'furniture', 'vehicle', 'machinery', 'software', 'other']).optional(),
    serialNumber: z.string().nullable().optional(),
    purchaseDate: z.coerce.date().nullable().optional(),
    purchaseCost: z.number().nonnegative().optional(),
    currentValue: z.number().nonnegative().optional(),
    depreciationRate: z.number().nonnegative().nullable().optional(),
    vendorName: z.string().nullable().optional(),
    warrantyExpiry: z.coerce.date().nullable().optional(),
    status: z.enum(['available', 'assigned', 'under_maintenance', 'retired']).optional(),
    assignedToId: z.string().nullable().optional(),
    notes: z.string().nullable().optional(),
  }),
});

export const updateAssetSchema = z.object({
  body: createAssetSchema.shape.body.partial(),
});
