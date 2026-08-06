import prisma from '../config/db';
import { NotFoundError } from '../utils/errors';
import { AuditService } from './audit.service';

export class EmployeeExitService {
  private static async ensureEmployee(organizationId: string, employeeId: string) {
    const employee = await prisma.employee.findFirst({
      where: { id: employeeId, organizationId },
    });
    if (!employee) throw new NotFoundError('Employee not found');
  }

  static async getEmployeeExits(
    organizationId: string,
    filters?: { employeeId?: string }
  ) {
    const where: any = { organizationId };
    if (filters?.employeeId) where.employeeId = filters.employeeId;
    return prisma.employeeExit.findMany({ where, orderBy: { resignDate: 'desc' } });
  }

  static async getEmployeeExitById(id: string, organizationId: string) {
    const exit = await prisma.employeeExit.findFirst({
      where: { id, organizationId },
    });
    if (!exit) throw new NotFoundError('Employee exit not found');
    return exit;
  }

  static async createEmployeeExit(
    organizationId: string,
    actorId: string,
    data: {
      employeeId: string; resignDate: Date; lastWorkingDay?: Date | null;
      reason?: string | null; exitInterview?: string | null; status?: any;
    },
    req?: any
  ) {
    await this.ensureEmployee(organizationId, data.employeeId);

    const exit = await prisma.employeeExit.create({
      data: {
        employeeId: data.employeeId,
        resignDate: data.resignDate,
        lastWorkingDay: data.lastWorkingDay,
        reason: data.reason,
        exitInterview: data.exitInterview,
        status: data.status,
        approvedById: data.status === 'approved' ? actorId : undefined,
        organizationId,
      },
    });
    await AuditService.created(organizationId, actorId, 'employee_exit', exit.id, undefined, req);
    return exit;
  }

  static async updateEmployeeExit(
    id: string,
    organizationId: string,
    actorId: string,
    data: any,
    req?: any
  ) {
    const existing = await this.getEmployeeExitById(id, organizationId);
    await this.ensureEmployee(organizationId, data.employeeId ?? existing.employeeId);
    if (data.status === 'approved' && !data.approvedById) data.approvedById = actorId;

    const updated = await prisma.employeeExit.update({ where: { id }, data });
    await AuditService.updated(organizationId, actorId, 'employee_exit', id, data, req);
    return updated;
  }

  static async deleteEmployeeExit(id: string, organizationId: string, actorId: string, req?: any) {
    await this.getEmployeeExitById(id, organizationId);
    await prisma.employeeExit.delete({ where: { id } });
    await AuditService.deleted(organizationId, actorId, 'employee_exit', id, undefined, req);
    return { success: true };
  }
}
