import prisma from '../config/db';
import { NotFoundError } from '../utils/errors';
import { AuditService } from './audit.service';

const PRODUCT_INCLUDE = {
  category: { select: { id: true, name: true } },
};

export class ProductService {
  private static async ensureCategory(organizationId: string, categoryId?: string | null) {
    if (!categoryId) return;
    const category = await prisma.productCategory.findFirst({
      where: { id: categoryId, organizationId },
    });
    if (!category) throw new NotFoundError('Category not found');
  }

  static async getProducts(
    organizationId: string,
    filters?: { categoryId?: string; q?: string; lowStock?: string }
  ) {
    const where: any = { organizationId };
    if (filters?.categoryId) where.categoryId = filters.categoryId;
    if (filters?.q) {
      where.OR = [
        { name: { contains: filters.q, mode: 'insensitive' } },
        { sku: { contains: filters.q, mode: 'insensitive' } },
        { barcode: { contains: filters.q, mode: 'insensitive' } },
      ];
    }
    let products = await prisma.product.findMany({
      where,
      include: PRODUCT_INCLUDE,
      orderBy: { createdAt: 'desc' },
    });
    if (filters?.lowStock === 'true') {
      const movements = await prisma.stockMovement.findMany({
        where: { organizationId, productId: { in: products.map((p) => p.id) } },
        select: { productId: true, type: true, quantity: true },
      });
      const stockMap = new Map<string, number>();
      for (const m of movements) {
        const delta = m.type === 'in' ? m.quantity : m.type === 'out' ? -m.quantity : 0;
        stockMap.set(m.productId, (stockMap.get(m.productId) ?? 0) + delta);
      }
      products = products.filter((p) => (stockMap.get(p.id) ?? 0) <= p.reorderLevel);
    }
    return products;
  }

  static async getProductById(id: string, organizationId: string) {
    const product = await prisma.product.findFirst({
      where: { id, organizationId },
      include: PRODUCT_INCLUDE,
    });
    if (!product) throw new NotFoundError('Product not found');
    return product;
  }

  static async createProduct(
    organizationId: string,
    createdById: string,
    data: {
      name: string;
      sku?: string | null;
      barcode?: string | null;
      categoryId?: string | null;
      description?: string | null;
      unit?: string | null;
      price?: number;
      cost?: number;
      taxRate?: number;
      reorderLevel?: number;
      status?: any;
    },
    req?: any
  ) {
    await this.ensureCategory(organizationId, data.categoryId);
    const product = await prisma.product.create({
      data: {
        name: data.name,
        sku: data.sku,
        barcode: data.barcode,
        categoryId: data.categoryId,
        description: data.description,
        unit: data.unit,
        price: data.price,
        cost: data.cost,
        taxRate: data.taxRate,
        reorderLevel: data.reorderLevel,
        status: data.status,
        organizationId,
        createdById,
      },
      include: PRODUCT_INCLUDE,
    });
    await AuditService.created(organizationId, createdById, 'product', product.id, undefined, req);
    return product;
  }

  static async updateProduct(id: string, organizationId: string, actorId: string, data: any, req?: any) {
    await this.getProductById(id, organizationId);
    await this.ensureCategory(organizationId, data.categoryId);
    const updated = await prisma.product.update({
      where: { id },
      data,
      include: PRODUCT_INCLUDE,
    });
    await AuditService.updated(organizationId, actorId, 'product', id, data, req);
    return updated;
  }

  static async deleteProduct(id: string, organizationId: string, actorId: string, req?: any) {
    await this.getProductById(id, organizationId);
    await prisma.product.delete({ where: { id } });
    await AuditService.deleted(organizationId, actorId, 'product', id, undefined, req);
    return { success: true };
  }
}
