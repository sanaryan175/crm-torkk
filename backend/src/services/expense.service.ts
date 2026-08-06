import prisma from '../config/db';
import { NotFoundError } from '../utils/errors';
import { ExpenseStatus } from '@prisma/client';
import { AuditService } from './audit.service';

const EXPENSE_INCLUDE = {
  paidBy: { select: { id: true, name: true, email: true, avatar: true } },
};

export class ExpenseService {
  static async getExpenses(
    organizationId: string,
    filters?: { category?: string; from?: string; to?: string; status?: string }
  ) {
    const where: any = { organizationId };
    if (filters?.category) where.category = filters.category;
    if (filters?.status) where.status = filters.status;
    if (filters?.from || filters?.to) {
      where.expenseDate = {};
      if (filters.from) where.expenseDate.gte = new Date(filters.from);
      if (filters.to) where.expenseDate.lte = new Date(filters.to);
    }
    return prisma.expense.findMany({
      where,
      include: EXPENSE_INCLUDE,
      orderBy: { expenseDate: 'desc' },
    });
  }

  static async getExpenseById(id: string, organizationId: string) {
    const expense = await prisma.expense.findFirst({
      where: { id, organizationId },
      include: EXPENSE_INCLUDE,
    });
    if (!expense) throw new NotFoundError('Expense not found');
    return expense;
  }

  static async createExpense(
    organizationId: string,
    createdById: string,
    data: {
      title: string;
      category?: string | null;
      amount: number;
      expenseDate?: Date;
      method?: any;
      paidById?: string | null;
      vendorName?: string | null;
      receiptFileId?: string | null;
      status?: any;
      notes?: string | null;
    },
    req?: any
  ) {
    const expense = await prisma.expense.create({
      data: {
        title: data.title,
        category: data.category,
        amount: data.amount,
        expenseDate: data.expenseDate ?? new Date(),
        method: data.method,
        paidById: data.paidById,
        vendorName: data.vendorName,
        receiptFileId: data.receiptFileId,
        status: data.status,
        notes: data.notes,
        organizationId,
        createdById,
      },
      include: EXPENSE_INCLUDE,
    });
    await AuditService.created(organizationId, createdById, 'expense', expense.id, undefined, req);
    return expense;
  }

  static async updateExpense(id: string, organizationId: string, actorId: string, data: any, req?: any) {
    await this.getExpenseById(id, organizationId);
    const updated = await prisma.expense.update({ where: { id }, data, include: EXPENSE_INCLUDE });
    await AuditService.updated(organizationId, actorId, 'expense', id, data, req);
    return updated;
  }

  static async approveExpense(
    id: string,
    organizationId: string,
    actorId: string,
    data?: { status?: ExpenseStatus },
    req?: any
  ) {
    await this.getExpenseById(id, organizationId);
    const status = data?.status ?? ExpenseStatus.approved;
    const updated = await prisma.expense.update({
      where: { id },
      data: { status },
      include: EXPENSE_INCLUDE,
    });
    await AuditService.updated(organizationId, actorId, 'expense', id, { status }, req);
    return updated;
  }

  static async deleteExpense(id: string, organizationId: string, actorId: string, req?: any) {
    await this.getExpenseById(id, organizationId);
    await prisma.expense.delete({ where: { id } });
    await AuditService.deleted(organizationId, actorId, 'expense', id, undefined, req);
    return { success: true };
  }
}
