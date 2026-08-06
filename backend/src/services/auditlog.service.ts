import prisma from '../config/db';

export class AuditLogService {
  static async getAuditLogs(
    organizationId: string,
    filters?: { userId?: string; resource?: string; from?: string; to?: string }
  ) {
    const where: any = { organizationId };
    if (filters?.userId) where.userId = filters.userId;
    if (filters?.resource) where.resource = filters.resource;
    if (filters?.from) where.createdAt = { ...(where.createdAt ?? {}), gte: new Date(filters.from) };
    if (filters?.to) where.createdAt = { ...(where.createdAt ?? {}), lte: new Date(filters.to) };
    return prisma.auditLog.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true, avatar: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
