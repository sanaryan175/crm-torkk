import prisma from '../config/db';
import { NotFoundError } from '../utils/errors';
import { AuditService } from './audit.service';

export class BankAccountService {
  static async getBankAccounts(organizationId: string) {
    return prisma.bankAccount.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getBankAccountById(id: string, organizationId: string) {
    const account = await prisma.bankAccount.findFirst({ where: { id, organizationId } });
    if (!account) throw new NotFoundError('Bank account not found');
    return account;
  }

  static async getBankAccountTransactions(bankAccountId: string, organizationId: string) {
    await this.getBankAccountById(bankAccountId, organizationId);
    return prisma.bankTransaction.findMany({
      where: { bankAccountId },
      orderBy: { transactionDate: 'desc' },
    });
  }

  static async createBankAccount(
    organizationId: string,
    createdById: string,
    data: {
      name: string;
      bankName: string;
      accountNumber: string;
      accountType?: any;
      ifsc?: string | null;
      branch?: string | null;
      openingBalance?: number;
      balance?: number;
      isDefault?: boolean;
      isActive?: boolean;
    },
    req?: any
  ) {
    const account = await prisma.bankAccount.create({
      data: {
        name: data.name,
        bankName: data.bankName,
        accountNumber: data.accountNumber,
        accountType: data.accountType,
        ifsc: data.ifsc,
        branch: data.branch,
        openingBalance: data.openingBalance ?? 0,
        balance: data.balance ?? data.openingBalance ?? 0,
        isDefault: data.isDefault,
        isActive: data.isActive,
        organizationId,
        createdById,
      },
    });
    await AuditService.created(organizationId, createdById, 'bankaccount', account.id, undefined, req);
    return account;
  }

  static async updateBankAccount(id: string, organizationId: string, actorId: string, data: any, req?: any) {
    await this.getBankAccountById(id, organizationId);
    const updated = await prisma.bankAccount.update({ where: { id }, data });
    await AuditService.updated(organizationId, actorId, 'bankaccount', id, data, req);
    return updated;
  }

  static async deleteBankAccount(id: string, organizationId: string, actorId: string, req?: any) {
    await this.getBankAccountById(id, organizationId);
    await prisma.bankAccount.delete({ where: { id } });
    await AuditService.deleted(organizationId, actorId, 'bankaccount', id, undefined, req);
    return { success: true };
  }
}
