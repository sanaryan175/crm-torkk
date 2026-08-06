import prisma from '../config/db';
import { NotFoundError } from '../utils/errors';
import { AuditService } from './audit.service';

export class DepartmentService {
  private static async ensureHead(organizationId: string, headId?: string | null) {
    if (!headId) return;
    const employee = await prisma.employee.findFirst({
      where: { id: headId, organizationId },
    });
    if (!employee) throw new NotFoundError('Department head not found');
  }

  static async getDepartments(organizationId: string) {
    return prisma.department.findMany({
      where: { organizationId },
      orderBy: { name: 'asc' },
    });
  }

  static async getDepartmentById(id: string, organizationId: string) {
    const department = await prisma.department.findFirst({
      where: { id, organizationId },
    });
    if (!department) throw new NotFoundError('Department not found');
    return department;
  }

  static async createDepartment(
    organizationId: string,
    actorId: string,
    data: { name: string; headId?: string | null },
    req?: any
  ) {
    await this.ensureHead(organizationId, data.headId);

    const department = await prisma.department.create({
      data: {
        name: data.name,
        headId: data.headId,
        organizationId,
        createdById: actorId,
      },
    });
    await AuditService.created(organizationId, actorId, 'department', department.id, undefined, req);
    return department;
  }

  static async updateDepartment(
    id: string,
    organizationId: string,
    actorId: string,
    data: any,
    req?: any
  ) {
    const existing = await this.getDepartmentById(id, organizationId);
    await this.ensureHead(organizationId, data.headId ?? existing.headId);
    if (data.headId === '') data.headId = null;

    const updated = await prisma.department.update({ where: { id }, data });
    await AuditService.updated(organizationId, actorId, 'department', id, data, req);
    return updated;
  }

  static async deleteDepartment(id: string, organizationId: string, actorId: string, req?: any) {
    await this.getDepartmentById(id, organizationId);
    await prisma.department.delete({ where: { id } });
    await AuditService.deleted(organizationId, actorId, 'department', id, undefined, req);
    return { success: true };
  }
}
