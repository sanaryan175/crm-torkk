import prisma from '../config/db';
import { NotFoundError } from '../utils/errors';
import { AuditService } from './audit.service';

const EMPLOYEE_INCLUDE = {
  manager: { select: { id: true, firstName: true, lastName: true, email: true } },
};

export class EmployeeService {
  private static async ensureUser(organizationId: string, userId?: string | null) {
    if (!userId) return;
    const user = await prisma.user.findFirst({
      where: { id: userId, organizationId, isActive: true },
    });
    if (!user) throw new NotFoundError('User not found');
  }

  private static async ensureDepartment(organizationId: string, departmentId?: string | null) {
    if (!departmentId) return;
    const department = await prisma.department.findFirst({
      where: { id: departmentId, organizationId },
    });
    if (!department) throw new NotFoundError('Department not found');
  }

  private static async ensureManager(organizationId: string, managerId?: string | null) {
    if (!managerId) return;
    const manager = await prisma.employee.findFirst({
      where: { id: managerId, organizationId },
    });
    if (!manager) throw new NotFoundError('Manager not found');
  }

  static async getEmployees(
    organizationId: string,
    filters?: { departmentId?: string; status?: string; q?: string }
  ) {
    const where: any = { organizationId };
    if (filters?.departmentId) where.departmentId = filters.departmentId;
    if (filters?.status) where.status = filters.status;
    if (filters?.q) {
      where.OR = [
        { firstName: { contains: filters.q, mode: 'insensitive' } },
        { lastName: { contains: filters.q, mode: 'insensitive' } },
        { email: { contains: filters.q, mode: 'insensitive' } },
        { employeeCode: { contains: filters.q, mode: 'insensitive' } },
      ];
    }
    return prisma.employee.findMany({
      where,
      include: EMPLOYEE_INCLUDE,
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getEmployeeById(id: string, organizationId: string) {
    const employee = await prisma.employee.findFirst({
      where: { id, organizationId },
      include: EMPLOYEE_INCLUDE,
    });
    if (!employee) throw new NotFoundError('Employee not found');
    return employee;
  }

  static async createEmployee(
    organizationId: string,
    actorId: string,
    data: {
      userId?: string | null; employeeCode: string; firstName: string; lastName: string;
      email: string; phone?: string | null; departmentId?: string | null; designation?: string | null;
      employmentType?: any; joinDate?: Date | null; exitDate?: Date | null; status?: any;
      managerId?: string | null; salary?: number | null; currency?: string;
    },
    req?: any
  ) {
    await this.ensureUser(organizationId, data.userId);
    await this.ensureDepartment(organizationId, data.departmentId);
    await this.ensureManager(organizationId, data.managerId);

    const employee = await prisma.employee.create({
      data: {
        userId: data.userId,
        employeeCode: data.employeeCode,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        departmentId: data.departmentId,
        designation: data.designation,
        employmentType: data.employmentType,
        joinDate: data.joinDate,
        exitDate: data.exitDate,
        status: data.status,
        managerId: data.managerId,
        salary: data.salary,
        currency: data.currency ?? 'USD',
        organizationId,
        createdById: actorId,
      },
      include: EMPLOYEE_INCLUDE,
    });
    await AuditService.created(organizationId, actorId, 'employee', employee.id, undefined, req);
    return employee;
  }

  static async updateEmployee(
    id: string,
    organizationId: string,
    actorId: string,
    data: any,
    req?: any
  ) {
    const existing = await this.getEmployeeById(id, organizationId);
    await this.ensureUser(organizationId, data.userId ?? existing.userId);
    await this.ensureDepartment(organizationId, data.departmentId ?? existing.departmentId);
    await this.ensureManager(organizationId, data.managerId ?? existing.managerId);
    if (data.userId === '') data.userId = null;
    if (data.departmentId === '') data.departmentId = null;
    if (data.managerId === '') data.managerId = null;

    const updated = await prisma.employee.update({ where: { id }, data, include: EMPLOYEE_INCLUDE });
    await AuditService.updated(organizationId, actorId, 'employee', id, data, req);
    return updated;
  }

  static async deleteEmployee(id: string, organizationId: string, actorId: string, req?: any) {
    await this.getEmployeeById(id, organizationId);
    await prisma.employee.delete({ where: { id } });
    await AuditService.deleted(organizationId, actorId, 'employee', id, undefined, req);
    return { success: true };
  }
}
