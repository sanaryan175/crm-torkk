import prisma from '../config/db';
import { NotFoundError } from '../utils/errors';
import { AuditService } from './audit.service';

export class WarehouseService {
  static async getWarehouses(organizationId: string) {
    return prisma.warehouse.findMany({ where: { organizationId }, orderBy: { createdAt: 'desc' } });
  }

  static async getWarehouseById(id: string, organizationId: string) {
    const warehouse = await prisma.warehouse.findFirst({ where: { id, organizationId } });
    if (!warehouse) throw new NotFoundError('Warehouse not found');
    return warehouse;
  }

  static async createWarehouse(
    organizationId: string,
    actorId: string,
    data: { name: string; code?: string | null; address?: string | null; managerId?: string | null; isActive?: boolean },
    req?: any
  ) {
    const warehouse = await prisma.warehouse.create({
      data: {
        name: data.name,
        code: data.code,
        address: data.address,
        managerId: data.managerId,
        isActive: data.isActive,
        organizationId,
      },
    });
    await AuditService.created(organizationId, actorId, 'warehouse', warehouse.id, undefined, req);
    return warehouse;
  }

  static async updateWarehouse(id: string, organizationId: string, actorId: string, data: any, req?: any) {
    await this.getWarehouseById(id, organizationId);
    const updated = await prisma.warehouse.update({ where: { id }, data });
    await AuditService.updated(organizationId, actorId, 'warehouse', id, data, req);
    return updated;
  }

  static async deleteWarehouse(id: string, organizationId: string, actorId: string, req?: any) {
    await this.getWarehouseById(id, organizationId);
    await prisma.warehouse.delete({ where: { id } });
    await AuditService.deleted(organizationId, actorId, 'warehouse', id, undefined, req);
    return { success: true };
  }
}
