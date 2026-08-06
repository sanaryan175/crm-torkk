import prisma from '../config/db';
import { NotFoundError } from '../utils/errors';

const COMMISSION_INCLUDE = {
  user: { select: { id: true, name: true, email: true, avatar: true } },
};

export class CommissionService {
  static async getCommissions(organizationId: string, filters?: { userId?: string }) {
    const where: any = { organizationId };
    if (filters?.userId) where.userId = filters.userId;
    return prisma.commission.findMany({
      where,
      include: COMMISSION_INCLUDE,
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getCommissionById(id: string, organizationId: string) {
    const commission = await prisma.commission.findFirst({
      where: { id, organizationId },
      include: COMMISSION_INCLUDE,
    });
    if (!commission) throw new NotFoundError('Commission not found');
    return commission;
  }
}
