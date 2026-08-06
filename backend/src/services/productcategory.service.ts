import prisma from '../config/db';
import { NotFoundError } from '../utils/errors';
import { AuditService } from './audit.service';

export class ProductCategoryService {
  private static async ensureParentCategory(organizationId: string, parentId?: string | null) {
    if (!parentId) return;
    const parent = await prisma.productCategory.findFirst({
      where: { id: parentId, organizationId },
    });
    if (!parent) throw new NotFoundError('Parent category not found');
  }

  static async getProductCategories(organizationId: string) {
    return prisma.productCategory.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getProductCategoryById(id: string, organizationId: string) {
    const category = await prisma.productCategory.findFirst({ where: { id, organizationId } });
    if (!category) throw new NotFoundError('Product category not found');
    return category;
  }

  static async createProductCategory(
    organizationId: string,
    createdById: string,
    data: { name: string; parentId?: string | null; description?: string | null },
    req?: any
  ) {
    await this.ensureParentCategory(organizationId, data.parentId);
    const category = await prisma.productCategory.create({
      data: {
        name: data.name,
        parentId: data.parentId,
        description: data.description,
        organizationId,
        createdById,
      },
    });
    await AuditService.created(organizationId, createdById, 'productcategory', category.id, undefined, req);
    return category;
  }

  static async updateProductCategory(id: string, organizationId: string, actorId: string, data: any, req?: any) {
    await this.getProductCategoryById(id, organizationId);
    await this.ensureParentCategory(organizationId, data.parentId);
    const updated = await prisma.productCategory.update({ where: { id }, data });
    await AuditService.updated(organizationId, actorId, 'productcategory', id, data, req);
    return updated;
  }

  static async deleteProductCategory(id: string, organizationId: string, actorId: string, req?: any) {
    await this.getProductCategoryById(id, organizationId);
    await prisma.productCategory.delete({ where: { id } });
    await AuditService.deleted(organizationId, actorId, 'productcategory', id, undefined, req);
    return { success: true };
  }
}
