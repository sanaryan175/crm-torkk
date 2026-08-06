import { z } from 'zod';

const poItemSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  productId: z.string().nullable().optional(),
  quantity: z.number().positive().default(1),
  unitPrice: z.number().nonnegative().default(0),
  taxRate: z.number().nonnegative().default(0),
});

export const createPurchaseOrderSchema = z.object({
  body: z.object({
    vendorId: z.string().nullable().optional(),
    status: z.enum(['draft', 'ordered', 'partial_received', 'received', 'cancelled']).optional(),
    orderDate: z.coerce.date().optional(),
    expectedDate: z.coerce.date().nullable().optional(),
    currency: z.string().optional(),
    notes: z.string().nullable().optional(),
    items: z.array(poItemSchema).min(1, 'At least one item is required'),
  }),
});

export const updatePurchaseOrderSchema = z.object({
  body: createPurchaseOrderSchema.shape.body.partial(),
});

export const updatePurchaseOrderStatusSchema = z.object({
  body: z.object({
    status: z.enum(['draft', 'ordered', 'partial_received', 'received', 'cancelled']),
  }),
});

export const createVendorPaymentSchema = z.object({
  body: z.object({
    amount: z.number().positive(),
    method: z.enum(['cash', 'bank_transfer', 'card', 'upi', 'cheque', 'other']).optional(),
    status: z.enum(['pending', 'paid', 'failed']).optional(),
    reference: z.string().nullable().optional(),
    paidAt: z.coerce.date().nullable().optional(),
    notes: z.string().nullable().optional(),
  }),
});
