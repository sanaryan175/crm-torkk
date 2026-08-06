import prisma from '../config/db';
import { AuditService } from './audit.service';

export class SubscriptionService {
  static async getSubscription(organizationId: string) {
    return prisma.subscription.findFirst({ where: { organizationId } });
  }

  static async updateSubscription(
    organizationId: string,
    actorId: string,
    data: any,
    req?: any
  ) {
    const existing = await prisma.subscription.findFirst({ where: { organizationId } });
    if (!existing) {
      const created = await prisma.subscription.create({
        data: {
          organizationId,
          plan: data.plan,
          status: data.status,
          seats: data.seats,
          amount: data.amount,
          renewDate: data.renewDate ? new Date(data.renewDate) : undefined,
          createdById: actorId,
        },
      });
      await AuditService.created(organizationId, actorId, 'subscription', created.id, { plan: data.plan }, req);
      return created;
    }
    const updated = await prisma.subscription.update({
      where: { id: existing.id },
      data: {
        plan: data.plan,
        status: data.status,
        seats: data.seats,
        amount: data.amount,
        renewDate: data.renewDate ? new Date(data.renewDate) : undefined,
      },
    });
    await AuditService.updated(organizationId, actorId, 'subscription', existing.id, data, req);
    return updated;
  }
}
