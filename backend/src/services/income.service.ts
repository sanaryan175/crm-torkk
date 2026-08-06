import prisma from '../config/db';
import { NotFoundError } from '../utils/errors';
import { AuditService } from './audit.service';

export class IncomeService {
  static async getIncomes(
    organizationId: string,
    filters?: { category?: string; from?: string; to?: string }
  ) {
    const where: any = { organizationId };
    if (filters?.category) where.category = filters.category;
    if (filters?.from || filters?.to) {
      where.incomeDate = {};
      if (filters.from) where.incomeDate.gte = new Date(filters.from);
      if (filters.to) where.incomeDate.lte = new Date(filters.to);
    }
    return prisma.income.findMany({ where, orderBy: { incomeDate: 'desc' } });
  }

  static async getIncomeById(id: string, organizationId: string) {
    const income = await prisma.income.findFirst({ where: { id, organizationId } });
    if (!income) throw new NotFoundError('Income not found');
    return income;
  }

  static async createIncome(
    organizationId: string,
    createdById: string,
    data: {
      title: string;
      category?: string | null;
      amount: number;
      incomeDate?: Date;
      method?: any;
      source?: string | null;
      notes?: string | null;
    },
    req?: any
  ) {
    const income = await prisma.income.create({
      data: {
        title: data.title,
        category: data.category,
        amount: data.amount,
        incomeDate: data.incomeDate ?? new Date(),
        method: data.method,
        source: data.source,
        notes: data.notes,
        organizationId,
        createdById,
      },
    });
    await AuditService.created(organizationId, createdById, 'income', income.id, undefined, req);
    return income;
  }

  static async updateIncome(id: string, organizationId: string, actorId: string, data: any, req?: any) {
    await this.getIncomeById(id, organizationId);
    const updated = await prisma.income.update({ where: { id }, data });
    await AuditService.updated(organizationId, actorId, 'income', id, data, req);
    return updated;
  }

  static async deleteIncome(id: string, organizationId: string, actorId: string, req?: any) {
    await this.getIncomeById(id, organizationId);
    await prisma.income.delete({ where: { id } });
    await AuditService.deleted(organizationId, actorId, 'income', id, undefined, req);
    return { success: true };
  }
}
