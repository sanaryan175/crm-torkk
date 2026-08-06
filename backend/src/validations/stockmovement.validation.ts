import { z } from 'zod';

export const createStockMovementSchema = z.object({
  body: z.object({
    productId: z.string().min(1, 'productId is required'),
    warehouseId: z.string().nullable().optional(),
    type: z.enum(['in', 'out', 'adjustment', 'transfer']),
    quantity: z.number().positive('Quantity must be positive'),
    unitCost: z.number().nonnegative().nullable().optional(),
    reference: z.string().nullable().optional(),
    note: z.string().nullable().optional(),
  }),
});
