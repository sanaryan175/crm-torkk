import prisma from '../config/db';
import { NotFoundError } from '../utils/errors';
import { AuditService } from './audit.service';

const ASSET_INCLUDE = {
  assignedTo: { select: { id: true, firstName: true, lastName: true, email: true } },
};

export class AssetService {
  private static async ensureAssignableEmployee(organizationId: string, assignedToId?: string | null) {
    if (!assignedToId) return;
    const employee = await prisma.employee.findFirst({
      where: { id: assignedToId, organizationId },
    });
    if (!employee) throw new NotFoundError('Assigned employee not found');
  }

  static async getAssets(
    organizationId: string,
    filters?: { status?: string; category?: string; assignedToId?: string; q?: string }
  ) {
    const where: any = { organizationId };
    if (filters?.status) where.status = filters.status;
    if (filters?.category) where.category = filters.category;
    if (filters?.assignedToId) where.assignedToId = filters.assignedToId;
    if (filters?.q) {
      where.OR = [
        { name: { contains: filters.q, mode: 'insensitive' } },
        { assetCode: { contains: filters.q, mode: 'insensitive' } },
        { serialNumber: { contains: filters.q, mode: 'insensitive' } },
      ];
    }
    return prisma.companyAsset.findMany({
      where,
      include: ASSET_INCLUDE,
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getAssetById(id: string, organizationId: string) {
    const asset = await prisma.companyAsset.findFirst({
      where: { id, organizationId },
      include: ASSET_INCLUDE,
    });
    if (!asset) throw new NotFoundError('Asset not found');
    return asset;
  }

  static async createAsset(
    organizationId: string,
    createdById: string,
    data: any,
    req?: any
  ) {
    await this.ensureAssignableEmployee(organizationId, data.assignedToId);

    const created = await prisma.$transaction(async (tx) => {
      const count = await tx.companyAsset.count({ where: { organizationId } });
      const assetCode = data.assetCode ?? `AST-${String(count + 1).padStart(5, '0')}`;
      return tx.companyAsset.create({
        data: {
          name: data.name,
          assetCode,
          category: data.category,
          serialNumber: data.serialNumber,
          purchaseDate: data.purchaseDate,
          purchaseCost: data.purchaseCost ?? 0,
          currentValue: data.currentValue ?? 0,
          depreciationRate: data.depreciationRate,
          vendorName: data.vendorName,
          warrantyExpiry: data.warrantyExpiry,
          status: data.status,
          assignedToId: data.assignedToId,
          notes: data.notes,
          organizationId,
          createdById,
        },
        include: ASSET_INCLUDE,
      });
    });

    await AuditService.created(organizationId, createdById, 'company_asset', created.id, undefined, req);
    return created;
  }

  static async updateAsset(
    id: string,
    organizationId: string,
    actorId: string,
    data: any,
    req?: any
  ) {
    await this.getAssetById(id, organizationId);
    if (data.assignedToId !== undefined) {
      await this.ensureAssignableEmployee(organizationId, data.assignedToId);
      if (data.assignedToId === '') data.assignedToId = null;
    }

    const updateData: any = {};
    const scalarFields = ['name', 'assetCode', 'serialNumber', 'purchaseCost', 'currentValue', 'depreciationRate', 'vendorName', 'status', 'notes'] as const;
    for (const field of scalarFields) {
      if (data[field] !== undefined) updateData[field] = data[field];
    }
    if (data.category !== undefined) updateData.category = data.category;
    if (data.assignedToId !== undefined) updateData.assignedToId = data.assignedToId;
    if (data.purchaseDate !== undefined) {
      updateData.purchaseDate = data.purchaseDate === '' ? null : data.purchaseDate;
    }
    if (data.warrantyExpiry !== undefined) {
      updateData.warrantyExpiry = data.warrantyExpiry === '' ? null : data.warrantyExpiry;
    }

    const updated = await prisma.companyAsset.update({
      where: { id },
      data: updateData,
      include: ASSET_INCLUDE,
    });
    await AuditService.updated(organizationId, actorId, 'company_asset', id, data, req);
    return updated;
  }

  static async deleteAsset(id: string, organizationId: string, actorId: string, req?: any) {
    await this.getAssetById(id, organizationId);
    await prisma.companyAsset.delete({ where: { id } });
    await AuditService.deleted(organizationId, actorId, 'company_asset', id, undefined, req);
    return { success: true };
  }
}
