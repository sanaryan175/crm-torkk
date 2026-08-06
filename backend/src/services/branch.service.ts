import prisma from '../config/db';
import { NotFoundError } from '../utils/errors';
import { AuditService } from './audit.service';

export class BranchService {
  static async listBranches(organizationId: string, brandId?: string) {
    return prisma.branch.findMany({
      where: brandId ? { organizationId, brandId } : { organizationId },
      include: {
        brand: { select: { id: true, name: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  static async getBranchById(id: string, organizationId: string) {
    const branch = await prisma.branch.findFirst({
      where: { id, organizationId },
      include: {
        brand: { select: { id: true, name: true } },
      },
    });
    if (!branch) throw new NotFoundError('Branch not found');
    return branch;
  }

  private static async ensureBrand(organizationId: string, brandId?: string | null) {
    if (!brandId) return;
    const brand = await prisma.brand.findFirst({ where: { id: brandId, organizationId } });
    if (!brand) throw new NotFoundError('Brand not found');
  }

  static async createBranch(
    organizationId: string,
    createdById: string,
    data: any,
    req?: any
  ) {
    await this.ensureBrand(organizationId, data.brandId);
    const branch = await prisma.branch.create({
      data: {
        organizationId,
        name: data.name,
        brandId: data.brandId,
        code: data.code,
        address: data.address,
        city: data.city,
        state: data.state,
        country: data.country,
        phone: data.phone,
        email: data.email,
        isActive: data.isActive,
      },
      include: {
        brand: { select: { id: true, name: true } },
      },
    });
    await AuditService.created(organizationId, createdById, 'branch', branch.id, { name: branch.name }, req);
    return branch;
  }

  static async updateBranch(
    id: string,
    organizationId: string,
    actorId: string,
    data: any,
    req?: any
  ) {
    await this.getBranchById(id, organizationId);
    await this.ensureBrand(organizationId, data.brandId);
    const updated = await prisma.branch.update({
      where: { id },
      data,
      include: {
        brand: { select: { id: true, name: true } },
      },
    });
    await AuditService.updated(organizationId, actorId, 'branch', id, data, req);
    return updated;
  }

  static async deleteBranch(id: string, organizationId: string, actorId: string, req?: any) {
    await this.getBranchById(id, organizationId);
    await prisma.branch.delete({ where: { id } });
    await AuditService.deleted(organizationId, actorId, 'branch', id, undefined, req);
    return { success: true };
  }
}
