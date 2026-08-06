import prisma from '../config/db';
import { NotFoundError } from '../utils/errors';
import { AuditService } from './audit.service';

const COMPANY_INCLUDE = {
  owner: { select: { id: true, name: true, email: true, avatar: true } },
  _count: { select: { contacts: true, deals: true } },
};

export class CompanyService {
  private static async ensureOwner(organizationId: string, ownerId?: string | null) {
    if (!ownerId) return;
    const user = await prisma.user.findFirst({ where: { id: ownerId, organizationId } });
    if (!user) throw new NotFoundError('Owner user not found');
  }

  static async getCompanies(organizationId: string, q?: string) {
    const where: any = { organizationId };
    if (q) {
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { industry: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
      ];
    }
    return prisma.company.findMany({ where, include: COMPANY_INCLUDE, orderBy: { createdAt: 'desc' } });
  }

  static async getCompanyById(id: string, organizationId: string) {
    const company = await prisma.company.findFirst({
      where: { id, organizationId },
      include: COMPANY_INCLUDE,
    });
    if (!company) throw new NotFoundError('Company not found');
    return company;
  }

  static async createCompany(organizationId: string, createdById: string, data: any, req?: any) {
    await this.ensureOwner(organizationId, data.ownerId);
    const company = await prisma.company.create({
      data: {
        name: data.name,
        website: data.website,
        industry: data.industry,
        size: data.size,
        phone: data.phone,
        email: data.email ?? '',
        address: data.address,
        city: data.city,
        state: data.state,
        country: data.country,
        description: data.description,
        tags: data.tags ?? [],
        ownerId: data.ownerId,
        organizationId,
        createdById,
      },
      include: COMPANY_INCLUDE,
    });
    await AuditService.created(organizationId, createdById, 'company', company.id, undefined, req);
    return company;
  }

  static async updateCompany(id: string, organizationId: string, actorId: string, data: any, req?: any) {
    await this.getCompanyById(id, organizationId);
    await this.ensureOwner(organizationId, data.ownerId);
    const updated = await prisma.company.update({ where: { id }, data, include: COMPANY_INCLUDE });
    await AuditService.updated(organizationId, actorId, 'company', id, data, req);
    return updated;
  }

  static async deleteCompany(id: string, organizationId: string, actorId: string, req?: any) {
    await this.getCompanyById(id, organizationId);
    await prisma.company.delete({ where: { id } });
    await AuditService.deleted(organizationId, actorId, 'company', id, undefined, req);
    return { success: true };
  }
}
