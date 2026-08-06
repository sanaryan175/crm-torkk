import prisma from '../config/db';
import { NotFoundError } from '../utils/errors';
import { PayrollStatus } from '@prisma/client';
import { AuditService } from './audit.service';

const PAYROLL_RUN_INCLUDE = {
  entries: {
    include: {
      employee: {
        select: { id: true, firstName: true, lastName: true, employeeCode: true, email: true },
      },
    },
  },
};

export class PayrollService {
  private static async ensureEmployee(organizationId: string, employeeId: string) {
    const employee = await prisma.employee.findFirst({
      where: { id: employeeId, organizationId },
    });
    if (!employee) throw new NotFoundError('Employee not found');
  }

  static async getPayrollRuns(
    organizationId: string,
    filters?: { status?: string; employeeId?: string }
  ) {
    const where: any = { organizationId };
    if (filters?.status) where.status = filters.status;
    if (filters?.employeeId) where.entries = { some: { employeeId: filters.employeeId } };
    return prisma.payrollRun.findMany({
      where,
      include: PAYROLL_RUN_INCLUDE,
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getPayrollRunById(id: string, organizationId: string) {
    const run = await prisma.payrollRun.findFirst({
      where: { id, organizationId },
      include: PAYROLL_RUN_INCLUDE,
    });
    if (!run) throw new NotFoundError('Payroll run not found');
    return run;
  }

  static async createPayrollRun(
    organizationId: string,
    processedById: string,
    data: {
      periodStart: Date;
      periodEnd: Date;
      employees: {
        employeeId: string;
        basicPay?: number;
        allowances?: number;
        deductions?: number;
        tax?: number;
      }[];
    },
    req?: any
  ) {
    for (const entry of data.employees) {
      await this.ensureEmployee(organizationId, entry.employeeId);
    }

    const entries = data.employees.map((e) => {
      const basicPay = e.basicPay ?? 0;
      const allowances = e.allowances ?? 0;
      const deductions = e.deductions ?? 0;
      const tax = e.tax ?? 0;
      return {
        organizationId,
        employeeId: e.employeeId,
        basicPay,
        allowances,
        deductions,
        tax,
        netPay: basicPay + allowances - deductions,
      };
    });

    const totalAmount = entries.reduce((sum, entry) => sum + entry.netPay, 0);

    const run = await prisma.$transaction(async (tx) => {
      return tx.payrollRun.create({
        data: {
          organizationId,
          periodStart: data.periodStart,
          periodEnd: data.periodEnd,
          totalAmount,
          processedById,
          entries: { create: entries },
        },
        include: PAYROLL_RUN_INCLUDE,
      });
    });

    await AuditService.created(
      organizationId,
      processedById,
      'payrollRun',
      run.id,
      { entryCount: entries.length, totalAmount },
      req
    );
    return run;
  }

  static async updatePayrollRun(
    id: string,
    organizationId: string,
    actorId: string,
    data: any,
    req?: any
  ) {
    await this.getPayrollRunById(id, organizationId);
    const updated = await prisma.payrollRun.update({
      where: { id },
      data,
      include: PAYROLL_RUN_INCLUDE,
    });
    await AuditService.updated(organizationId, actorId, 'payrollRun', id, data, req);
    return updated;
  }

  static async updatePayrollRunStatus(
    id: string,
    organizationId: string,
    actorId: string,
    status: string,
    req?: any
  ) {
    const run = await this.getPayrollRunById(id, organizationId);
    const updated = await prisma.payrollRun.update({
      where: { id },
      data: {
        status: status as PayrollStatus,
        ...(status !== 'draft' ? { processedAt: run.processedAt ?? new Date() } : {}),
      },
      include: PAYROLL_RUN_INCLUDE,
    });
    await AuditService.updated(organizationId, actorId, 'payrollRun', id, { status }, req);
    return updated;
  }

  static async deletePayrollRun(id: string, organizationId: string, actorId: string, req?: any) {
    await this.getPayrollRunById(id, organizationId);
    await prisma.payrollRun.delete({ where: { id } });
    await AuditService.deleted(organizationId, actorId, 'payrollRun', id, undefined, req);
    return { success: true };
  }
}
