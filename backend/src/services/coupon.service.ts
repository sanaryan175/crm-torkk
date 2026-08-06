import prisma from '../config/db';
import { NotFoundError, BadRequestError } from '../utils/errors';
import { AuditService } from './audit.service';

interface CouponData {
  code?: string;
  name?: string;
  type?: any;
  value?: number;
  minOrderValue?: number | null;
  maxDiscount?: number | null;
  usageLimit?: number;
  validFrom?: Date | null;
  validTo?: Date | null;
  isActive?: boolean;
}

export class CouponService {
  static async getCoupons(organizationId: string) {
    return prisma.coupon.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getCouponById(id: string, organizationId: string) {
    const coupon = await prisma.coupon.findFirst({
      where: { id, organizationId },
    });
    if (!coupon) throw new NotFoundError('Coupon not found');
    return coupon;
  }

  private static normalizeCode(code: string) {
    return code.trim().toUpperCase();
  }

  private static async ensureUniqueCode(
    organizationId: string,
    code: string,
    excludeId?: string
  ) {
    const existing = await prisma.coupon.findFirst({
      where: {
        organizationId,
        code,
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
    });
    if (existing) throw new BadRequestError('Coupon code already exists');
  }

  static async createCoupon(
    organizationId: string,
    createdById: string,
    data: CouponData,
    req?: any
  ) {
    const code = this.normalizeCode(data.code ?? '');
    await this.ensureUniqueCode(organizationId, code);
    const coupon = await prisma.coupon.create({
      data: {
        code,
        name: data.name!,
        type: data.type!,
        value: data.value!,
        minOrderValue: data.minOrderValue,
        maxDiscount: data.maxDiscount,
        usageLimit: data.usageLimit,
        validFrom: data.validFrom,
        validTo: data.validTo,
        isActive: data.isActive,
        organizationId,
        createdById,
      },
    });
    await AuditService.created(organizationId, createdById, 'coupon', coupon.id, { code }, req);
    return coupon;
  }

  static async updateCoupon(
    id: string,
    organizationId: string,
    actorId: string,
    data: CouponData,
    req?: any
  ) {
    await this.getCouponById(id, organizationId);
    if (data.code) {
      const code = this.normalizeCode(data.code);
      await this.ensureUniqueCode(organizationId, code, id);
      data.code = code;
    }
    const updated = await prisma.coupon.update({ where: { id }, data });
    await AuditService.updated(organizationId, actorId, 'coupon', id, data, req);
    return updated;
  }

  static async deleteCoupon(id: string, organizationId: string, actorId: string, req?: any) {
    await this.getCouponById(id, organizationId);
    await prisma.coupon.delete({ where: { id } });
    await AuditService.deleted(organizationId, actorId, 'coupon', id, undefined, req);
    return { success: true };
  }

  static async validateCoupon(organizationId: string, code: string) {
    const coupon = await prisma.coupon.findFirst({
      where: { organizationId, code: this.normalizeCode(code) },
    });

    if (!coupon) return { valid: false as const, reason: 'Coupon not found' };
    if (!coupon.isActive) return { valid: false as const, reason: 'Coupon is inactive' };

    const now = new Date();
    if (coupon.validFrom && coupon.validFrom > now) {
      return { valid: false as const, reason: 'Coupon is not yet valid' };
    }
    if (coupon.validTo && coupon.validTo < now) {
      return { valid: false as const, reason: 'Coupon has expired' };
    }
    if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
      return { valid: false as const, reason: 'Coupon usage limit exceeded' };
    }

    return { valid: true as const, coupon };
  }
}
