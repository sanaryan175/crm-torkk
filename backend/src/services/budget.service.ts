import prisma from '../config/db';
import { NotFoundError } from '../utils/errors';
import { AuditService } from './audit.service';

export class BudgetService {
  static async getBudgets(organizationId: string) {
    return prisma.budget.findMany({
      where: { organizationId },
      orderBy: { periodStart: 'desc' },
    });
  }

  static async getBudgetById(id: string, organizationId: string) {
    const budget = await prisma.budget.findFirst({ where: { id, organizationId } });
    if (!budget) throw new NotFoundError('Budget not found');
    return budget;
  }

  static async createBudget(
    organizationId: string,
    createdById: string,
    data: {
      name: string;
      category?: string | null;
      amount: number;
      periodStart: Date;
      periodEnd: Date;
      status?: any;
    },
    req?: any
  ) {
    const budget = await prisma.budget.create({
      data: {
        name: data.name,
        category: data.category,
        amount: data.amount,
        periodStart: data.periodStart,
        periodEnd: data.periodEnd,
        status: data.status,
        organizationId,
        createdById,
      },
    });
    await AuditService.created(organizationId, createdById, 'budget', budget.id, undefined, req);
    return budget;
  }

  static async updateBudget(id: string, organizationId: string, actorId: string, data: any, req?: any) {
    await this.getBudgetById(id, organizationId);
    const updated = await prisma.budget.update({ where: { id }, data });
    await AuditService.updated(organizationId, actorId, 'budget', id, data, req);
    return updated;
  }

  static async deleteBudget(id: string, organizationId: string, actorId: string, req?: any) {
    await this.getBudgetById(id, organizationId);
    await prisma.budget.delete({ where: { id } });
    await AuditService.deleted(organizationId, actorId, 'budget', id, undefined, req);
    return { success: true };
  }
}
