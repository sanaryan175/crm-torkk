import prisma from '../config/db';
import { NotFoundError } from '../utils/errors';
import { AuditService } from './audit.service';

export class BrandService {
  static async listBrands(organizationId: string) {
    return prisma.brand.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'asc' },
    });
  }

  static async getBrandById(id: string, organizationId: string) {
    const brand = await prisma.brand.findFirst({ where: { id, organizationId } });
    if (!brand) throw new NotFoundError('Brand not found');
    return brand;
  }

  static async createBrand(
    organizationId: string,
    createdById: string,
    data: any,
    req?: any
  ) {
    const existing = await prisma.brand.findFirst({ where: { organizationId } });
    const isDefault = data.isDefault ?? !existing;
    if (isDefault) {
      await prisma.brand.updateMany({
        where: { organizationId, isDefault: true },
        data: { isDefault: false },
      });
    }
    const brand = await prisma.brand.create({
      data: {
        organizationId,
        name: data.name,
        logo: data.logo,
        primaryColor: data.primaryColor,
        secondaryColor: data.secondaryColor,
        isDefault,
      },
    });
    await AuditService.created(organizationId, createdById, 'brand', brand.id, { name: brand.name }, req);
    return brand;
  }

  static async updateBrand(
    id: string,
    organizationId: string,
    actorId: string,
    data: any,
    req?: any
  ) {
    await this.getBrandById(id, organizationId);
    if (data.isDefault) {
      await prisma.brand.updateMany({
        where: { organizationId, isDefault: true, id: { not: id } },
        data: { isDefault: false },
      });
    }
    const updated = await prisma.brand.update({ where: { id }, data });
    await AuditService.updated(organizationId, actorId, 'brand', id, data, req);
    return updated;
  }

  static async deleteBrand(id: string, organizationId: string, actorId: string, req?: any) {
    await this.getBrandById(id, organizationId);
    await prisma.brand.delete({ where: { id } });
    await AuditService.deleted(organizationId, actorId, 'brand', id, undefined, req);
    return { success: true };
  }
}
