import prisma from '../config/db';
import { NotFoundError } from '../utils/errors';
import { AuditService } from './audit.service';

export class AttendanceService {
  private static async ensureEmployee(organizationId: string, employeeId: string) {
    const employee = await prisma.employee.findFirst({
      where: { id: employeeId, organizationId },
    });
    if (!employee) throw new NotFoundError('Employee not found');
  }

  private static computeHours(checkIn?: Date | null, checkOut?: Date | null): number | null {
    if (!checkIn || !checkOut) return null;
    const diff = checkOut.getTime() - checkIn.getTime();
    if (diff <= 0) return 0;
    return Number((diff / (1000 * 60 * 60)).toFixed(2));
  }

  static async getAttendance(
    organizationId: string,
    filters?: { employeeId?: string; from?: string; to?: string }
  ) {
    const where: any = { organizationId };
    if (filters?.employeeId) where.employeeId = filters.employeeId;
    if (filters?.from) {
      where.date = { ...(where.date ?? {}), gte: new Date(filters.from) };
    }
    if (filters?.to) {
      where.date = { ...(where.date ?? {}), lte: new Date(filters.to) };
    }
    return prisma.attendance.findMany({ where, orderBy: { date: 'desc' } });
  }

  static async getAttendanceById(id: string, organizationId: string) {
    const attendance = await prisma.attendance.findFirst({
      where: { id, organizationId },
    });
    if (!attendance) throw new NotFoundError('Attendance not found');
    return attendance;
  }

  static async createAttendance(
    organizationId: string,
    actorId: string,
    data: {
      employeeId: string; date: Date; status?: any; checkIn?: Date | null; checkOut?: Date | null;
      hours?: number | null; overtime?: number | null; notes?: string | null;
    },
    req?: any
  ) {
    await this.ensureEmployee(organizationId, data.employeeId);

    const attendance = await prisma.attendance.create({
      data: {
        employeeId: data.employeeId,
        date: data.date,
        status: data.status,
        checkIn: data.checkIn,
        checkOut: data.checkOut,
        hours: data.hours ?? this.computeHours(data.checkIn, data.checkOut),
        overtime: data.overtime,
        notes: data.notes,
        markedById: actorId,
        organizationId,
      },
    });
    await AuditService.created(organizationId, actorId, 'attendance', attendance.id, undefined, req);
    return attendance;
  }

  static async updateAttendance(
    id: string,
    organizationId: string,
    actorId: string,
    data: any,
    req?: any
  ) {
    const existing = await this.getAttendanceById(id, organizationId);
    await this.ensureEmployee(organizationId, data.employeeId ?? existing.employeeId);

    const checkIn = data.checkIn !== undefined ? data.checkIn : existing.checkIn;
    const checkOut = data.checkOut !== undefined ? data.checkOut : existing.checkOut;
    if (data.hours === undefined) {
      data.hours = this.computeHours(checkIn, checkOut);
    }

    const updated = await prisma.attendance.update({ where: { id }, data });
    await AuditService.updated(organizationId, actorId, 'attendance', id, data, req);
    return updated;
  }

  static async deleteAttendance(id: string, organizationId: string, actorId: string, req?: any) {
    await this.getAttendanceById(id, organizationId);
    await prisma.attendance.delete({ where: { id } });
    await AuditService.deleted(organizationId, actorId, 'attendance', id, undefined, req);
    return { success: true };
  }
}
