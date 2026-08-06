import prisma from '../config/db';
import { NotFoundError } from '../utils/errors';
import { LeaveStatus } from '@prisma/client';
import { AuditService } from './audit.service';

export class LeaveService {
  private static async ensureEmployee(organizationId: string, employeeId: string) {
    const employee = await prisma.employee.findFirst({
      where: { id: employeeId, organizationId },
    });
    if (!employee) throw new NotFoundError('Employee not found');
  }

  private static computeDays(startDate: Date, endDate: Date): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    const diff = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return Math.max(diff, 1);
  }

  static async getLeaves(
    organizationId: string,
    filters?: { employeeId?: string; status?: string }
  ) {
    const where: any = { organizationId };
    if (filters?.employeeId) where.employeeId = filters.employeeId;
    if (filters?.status) where.status = filters.status;
    return prisma.leave.findMany({ where, orderBy: { startDate: 'desc' } });
  }

  static async getLeaveById(id: string, organizationId: string) {
    const leave = await prisma.leave.findFirst({
      where: { id, organizationId },
    });
    if (!leave) throw new NotFoundError('Leave not found');
    return leave;
  }

  static async createLeave(
    organizationId: string,
    actorId: string,
    data: {
      employeeId: string; type: any; status?: any; startDate: Date; endDate: Date;
      days?: number; reason?: string | null; reviewNotes?: string | null;
    },
    req?: any
  ) {
    await this.ensureEmployee(organizationId, data.employeeId);

    const leave = await prisma.leave.create({
      data: {
        employeeId: data.employeeId,
        type: data.type,
        status: data.status,
        startDate: data.startDate,
        endDate: data.endDate,
        days: data.days ?? this.computeDays(data.startDate, data.endDate),
        reason: data.reason,
        reviewNotes: data.reviewNotes,
        organizationId,
      },
    });
    await AuditService.created(organizationId, actorId, 'leave', leave.id, undefined, req);
    return leave;
  }

  static async updateLeave(
    id: string,
    organizationId: string,
    actorId: string,
    data: any,
    req?: any
  ) {
    const existing = await this.getLeaveById(id, organizationId);
    await this.ensureEmployee(organizationId, data.employeeId ?? existing.employeeId);
    if (data.days === undefined) {
      const start = data.startDate ?? existing.startDate;
      const end = data.endDate ?? existing.endDate;
      data.days = this.computeDays(new Date(start), new Date(end));
    }

    const updated = await prisma.leave.update({ where: { id }, data });
    await AuditService.updated(organizationId, actorId, 'leave', id, data, req);
    return updated;
  }

  static async updateLeaveStatus(
    id: string,
    organizationId: string,
    actorId: string,
    data: { status: string; reviewNotes?: string | null },
    req?: any
  ) {
    await this.getLeaveById(id, organizationId);

    const updateData: any = {
      status: data.status as LeaveStatus,
      reviewedById: actorId,
      reviewNotes: data.reviewNotes,
    };
    if (data.status === 'approved') updateData.approvedAt = new Date();

    const updated = await prisma.leave.update({ where: { id }, data: updateData });
    await AuditService.updated(organizationId, actorId, 'leave', id, updateData, req);
    return updated;
  }

  static async deleteLeave(id: string, organizationId: string, actorId: string, req?: any) {
    await this.getLeaveById(id, organizationId);
    await prisma.leave.delete({ where: { id } });
    await AuditService.deleted(organizationId, actorId, 'leave', id, undefined, req);
    return { success: true };
  }
}
