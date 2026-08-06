import prisma from '../config/db';
import { NotFoundError } from '../utils/errors';
import { AuditService } from './audit.service';

interface ReferralData {
  referrerName?: string;
  referrerEmail?: string | null;
  referredName?: string;
  referredEmail?: string | null;
  referredPhone?: string | null;
  status?: string;
  rewardAmount?: number | null;
  convertedAt?: Date | null;
}

export class ReferralService {
  static async getReferrals(organizationId: string) {
    return prisma.referral.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getReferralById(id: string, organizationId: string) {
    const referral = await prisma.referral.findFirst({
      where: { id, organizationId },
    });
    if (!referral) throw new NotFoundError('Referral not found');
    return referral;
  }

  static async createReferral(
    organizationId: string,
    actorId: string,
    data: ReferralData,
    req?: any
  ) {
    const referral = await prisma.referral.create({
      data: {
        referrerName: data.referrerName!,
        referrerEmail: data.referrerEmail,
        referredName: data.referredName!,
        referredEmail: data.referredEmail,
        referredPhone: data.referredPhone,
        status: data.status ?? 'pending',
        rewardAmount: data.rewardAmount,
        convertedAt: data.convertedAt,
        organizationId,
      },
    });
    await AuditService.created(organizationId, actorId, 'referral', referral.id, undefined, req);
    return referral;
  }

  static async updateReferral(
    id: string,
    organizationId: string,
    actorId: string,
    data: ReferralData,
    req?: any
  ) {
    await this.getReferralById(id, organizationId);
    const updated = await prisma.referral.update({ where: { id }, data });
    await AuditService.updated(organizationId, actorId, 'referral', id, data, req);
    return updated;
  }

  static async deleteReferral(id: string, organizationId: string, actorId: string, req?: any) {
    await this.getReferralById(id, organizationId);
    await prisma.referral.delete({ where: { id } });
    await AuditService.deleted(organizationId, actorId, 'referral', id, undefined, req);
    return { success: true };
  }
}
