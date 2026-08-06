import prisma from '../config/db';
import { NotFoundError } from '../utils/errors';
import { AuditService } from './audit.service';

const MAINT_INCLUDE = {
  asset: { select: { id: true, name: true, assetCode: true } },
};

export class AssetMaintenanceService {
  private static async ensureAsset(organizationId: string, assetId: string) {
    const asset = await prisma.companyAsset.findFirst({
      where: { id: assetId, organizationId },
    });
    if (!asset) throw new NotFoundError('Asset not found');
  }

  static async getAssetMaintenances(
    organizationId: string,
    filters?: { assetId?: string; status?: string }
  ) {
    const where: any = { organizationId };
    if (filters?.assetId) where.assetId = filters.assetId;
    if (filters?.status) where.status = filters.status;
    return prisma.assetMaintenance.findMany({
      where,
      include: MAINT_INCLUDE,
      orderBy: { scheduledDate: 'desc' },
    });
  }

  static async getAssetMaintenanceById(id: string, organizationId: string) {
    const maintenance = await prisma.assetMaintenance.findFirst({
      where: { id, organizationId },
      include: MAINT_INCLUDE,
    });
    if (!maintenance) throw new NotFoundError('Asset maintenance record not found');
    return maintenance;
  }

  static async createAssetMaintenance(
    organizationId: string,
    actorId: string,
    data: any,
    req?: any
  ) {
    await this.ensureAsset(organizationId, data.assetId);

    const created = await prisma.assetMaintenance.create({
      data: {
        organizationId,
        assetId: data.assetId,
        type: data.type,
        description: data.description,
        scheduledDate: data.scheduledDate,
        completedDate: data.completedDate,
        cost: data.cost ?? 0,
        vendor: data.vendor,
        status: data.status,
      },
      include: MAINT_INCLUDE,
    });

    await AuditService.created(
      organizationId, actorId, 'asset_maintenance', created.id, undefined, req
    );
    return created;
  }

  static async updateAssetMaintenance(
    id: string,
    organizationId: string,
    actorId: string,
    data: any,
    req?: any
  ) {
    await this.getAssetMaintenanceById(id, organizationId);
    if (data.assetId !== undefined) {
      await this.ensureAsset(organizationId, data.assetId);
    }

    const updateData: any = {};
    const scalarFields = ['description', 'cost', 'vendor', 'status'] as const;
    for (const field of scalarFields) {
      if (data[field] !== undefined) updateData[field] = data[field];
    }
    if (data.assetId !== undefined) updateData.assetId = data.assetId;
    if (data.type !== undefined) updateData.type = data.type;
    if (data.scheduledDate !== undefined) {
      updateData.scheduledDate = data.scheduledDate === '' ? null : data.scheduledDate;
    }
    if (data.completedDate !== undefined) {
      updateData.completedDate = data.completedDate === '' ? null : data.completedDate;
    }

    const updated = await prisma.assetMaintenance.update({
      where: { id },
      data: updateData,
      include: MAINT_INCLUDE,
    });
    await AuditService.updated(
      organizationId, actorId, 'asset_maintenance', id, data, req
    );
    return updated;
  }

  static async deleteAssetMaintenance(
    id: string,
    organizationId: string,
    actorId: string,
    req?: any
  ) {
    await this.getAssetMaintenanceById(id, organizationId);
    await prisma.assetMaintenance.delete({ where: { id } });
    await AuditService.deleted(
      organizationId, actorId, 'asset_maintenance', id, undefined, req
    );
    return { success: true };
  }
}
