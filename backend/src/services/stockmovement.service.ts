import prisma from '../config/db';
import { NotFoundError } from '../utils/errors';
import { AuditService } from './audit.service';

const MOVEMENT_INCLUDE = {
  product: { select: { id: true, name: true, sku: true } },
  warehouse: { select: { id: true, name: true } },
};

export class StockMovementService {
  static async getStockMovements(
    organizationId: string,
    filters?: { productId?: string; warehouseId?: string; type?: string }
  ) {
    const where: any = { organizationId };
    if (filters?.productId) where.productId = filters.productId;
    if (filters?.warehouseId) where.warehouseId = filters.warehouseId;
    if (filters?.type) where.type = filters.type;
    return prisma.stockMovement.findMany({
      where,
      include: MOVEMENT_INCLUDE,
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getStockMovementById(id: string, organizationId: string) {
    const movement = await prisma.stockMovement.findFirst({
      where: { id, organizationId },
      include: MOVEMENT_INCLUDE,
    });
    if (!movement) throw new NotFoundError('Stock movement not found');
    return movement;
  }

  static async createStockMovement(
    organizationId: string,
    actorId: string,
    data: {
      productId: string;
      warehouseId?: string | null;
      type: any;
      quantity: number;
      unitCost?: number | null;
      reference?: string | null;
      note?: string | null;
    },
    req?: any
  ) {
    const product = await prisma.product.findFirst({
      where: { id: data.productId, organizationId },
    });
    if (!product) throw new NotFoundError('Product not found');
    if (data.warehouseId) {
      const warehouse = await prisma.warehouse.findFirst({
        where: { id: data.warehouseId, organizationId },
      });
      if (!warehouse) throw new NotFoundError('Warehouse not found');
    }

    const movement = await prisma.$transaction(async (tx) => {
      const movements = await tx.stockMovement.findMany({
        where: { productId: data.productId, organizationId },
        select: { type: true, quantity: true },
      });
      const stock = movements.reduce(
        (sum, m) => sum + (m.type === 'in' ? m.quantity : m.type === 'out' ? -m.quantity : 0),
        0
      );
      if (data.type === 'out' && data.quantity > stock) {
        throw new Error('Insufficient stock for outgoing movement');
      }
      return tx.stockMovement.create({
        data: {
          productId: data.productId,
          warehouseId: data.warehouseId,
          type: data.type,
          quantity: data.quantity,
          unitCost: data.unitCost,
          reference: data.reference,
          note: data.note,
          movedById: actorId,
          organizationId,
        },
        include: MOVEMENT_INCLUDE,
      });
    });

    await AuditService.created(organizationId, actorId, 'stockmovement', movement.id, undefined, req);
    return movement;
  }

  static async deleteStockMovement(id: string, organizationId: string, actorId: string, req?: any) {
    await this.getStockMovementById(id, organizationId);
    await prisma.stockMovement.delete({ where: { id } });
    await AuditService.deleted(organizationId, actorId, 'stockmovement', id, undefined, req);
    return { success: true };
  }
}
