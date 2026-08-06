import prisma from '../config/db';
import { NotFoundError } from '../utils/errors';
import { AuditService } from './audit.service';

export class EmployeeDocumentService {
  private static async ensureEmployee(organizationId: string, employeeId: string) {
    const employee = await prisma.employee.findFirst({
      where: { id: employeeId, organizationId },
    });
    if (!employee) throw new NotFoundError('Employee not found');
  }

  static async getEmployeeDocuments(
    organizationId: string,
    filters?: { employeeId?: string }
  ) {
    const where: any = { organizationId };
    if (filters?.employeeId) where.employeeId = filters.employeeId;
    return prisma.employeeDocument.findMany({ where, orderBy: { createdAt: 'desc' } });
  }

  static async getEmployeeDocumentById(id: string, organizationId: string) {
    const document = await prisma.employeeDocument.findFirst({
      where: { id, organizationId },
    });
    if (!document) throw new NotFoundError('Employee document not found');
    return document;
  }

  static async createEmployeeDocument(
    organizationId: string,
    actorId: string,
    data: { employeeId: string; name: string; type?: any; fileId?: string | null },
    req?: any
  ) {
    await this.ensureEmployee(organizationId, data.employeeId);

    const document = await prisma.employeeDocument.create({
      data: {
        employeeId: data.employeeId,
        name: data.name,
        type: data.type,
        fileId: data.fileId,
        uploadedById: actorId,
        organizationId,
      },
    });
    await AuditService.created(organizationId, actorId, 'employee_document', document.id, undefined, req);
    return document;
  }

  static async updateEmployeeDocument(
    id: string,
    organizationId: string,
    actorId: string,
    data: any,
    req?: any
  ) {
    const existing = await this.getEmployeeDocumentById(id, organizationId);
    await this.ensureEmployee(organizationId, data.employeeId ?? existing.employeeId);
    if (data.fileId === '') data.fileId = null;

    const updated = await prisma.employeeDocument.update({ where: { id }, data });
    await AuditService.updated(organizationId, actorId, 'employee_document', id, data, req);
    return updated;
  }

  static async deleteEmployeeDocument(id: string, organizationId: string, actorId: string, req?: any) {
    await this.getEmployeeDocumentById(id, organizationId);
    await prisma.employeeDocument.delete({ where: { id } });
    await AuditService.deleted(organizationId, actorId, 'employee_document', id, undefined, req);
    return { success: true };
  }
}
