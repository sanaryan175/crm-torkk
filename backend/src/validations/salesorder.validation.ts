import { z } from 'zod';

const salesOrderItemSchema = z.object({
  name: z.string().min(1, 'Item name is required'),
  description: z.string().nullable().optional(),
  quantity: z.number().positive().default(1),
  unitPrice: z.number().nonnegative().default(0),
  taxRate: z.number().nonnegative().default(0),
  sortOrder: z.number().int().optional(),
});

export const createSalesOrderSchema = z.object({
  body: z.object({
    contactId: z.string().nullable().optional(),
    companyId: z.string().nullable().optional(),
    dealId: z.string().nullable().optional(),
    status: z.enum(['draft', 'confirmed', 'shipped', 'delivered', 'cancelled']).optional(),
    orderDate: z.coerce.date().optional(),
    deliveryDate: z.coerce.date().nullable().optional(),
    currency: z.string().optional(),
    taxRate: z.number().nonnegative().optional(),
    discount: z.number().nonnegative().optional(),
    notes: z.string().nullable().optional(),
    items: z.array(salesOrderItemSchema).optional(),
  }),
});

export const updateSalesOrderSchema = z.object({
  body: createSalesOrderSchema.shape.body.partial(),
});
