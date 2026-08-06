import prisma from '../config/db';
import { NotFoundError } from '../utils/errors';
import { ReviewStatus } from '@prisma/client';
import { AuditService } from './audit.service';

const PERFORMANCE_REVIEW_INCLUDE = {
  reviewer: { select: { id: true, name: true, email: true, avatar: true } },
};

export class PerformanceReviewService {
  private static async ensureEmployee(organizationId: string, employeeId: string) {
    const employee = await prisma.employee.findFirst({
      where: { id: employeeId, organizationId },
    });
    if (!employee) throw new NotFoundError('Employee not found');
  }

  private static async ensureReviewer(organizationId: string, reviewerId?: string | null) {
    if (!reviewerId) return;
    const user = await prisma.user.findFirst({
      where: { id: reviewerId, organizationId, isActive: true },
    });
    if (!user) throw new NotFoundError('Reviewer not found');
  }

  static async getPerformanceReviews(
    organizationId: string,
    filters?: { employeeId?: string; period?: string }
  ) {
    const where: any = { organizationId };
    if (filters?.employeeId) where.employeeId = filters.employeeId;
    if (filters?.period) {
      const parsed = new Date(filters.period);
      if (!Number.isNaN(parsed.getTime())) {
        where.OR = [
          { periodStart: { lte: parsed } },
          { periodEnd: { gte: parsed } },
        ];
      }
    }
    return prisma.performanceReview.findMany({
      where,
      include: PERFORMANCE_REVIEW_INCLUDE,
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getPerformanceReviewById(id: string, organizationId: string) {
    const review = await prisma.performanceReview.findFirst({
      where: { id, organizationId },
      include: PERFORMANCE_REVIEW_INCLUDE,
    });
    if (!review) throw new NotFoundError('Performance review not found');
    return review;
  }

  static async createPerformanceReview(
    organizationId: string,
    data: {
      employeeId: string; reviewerId: string; periodStart?: Date | null; periodEnd?: Date | null;
      overallRating?: number | null; strengths?: string | null; improvements?: string | null;
      goals?: string | null; status?: any;
    },
    req?: any
  ) {
    await this.ensureEmployee(organizationId, data.employeeId);
    await this.ensureReviewer(organizationId, data.reviewerId);
    const review = await prisma.performanceReview.create({
      data: {
        employeeId: data.employeeId,
        reviewerId: data.reviewerId,
        periodStart: data.periodStart,
        periodEnd: data.periodEnd,
        overallRating: data.overallRating,
        strengths: data.strengths,
        improvements: data.improvements,
        goals: data.goals,
        status: data.status,
        organizationId,
      },
      include: PERFORMANCE_REVIEW_INCLUDE,
    });
    await AuditService.created(organizationId, data.reviewerId, 'performanceReview', review.id, undefined, req);
    return review;
  }

  static async updatePerformanceReview(
    id: string,
    organizationId: string,
    actorId: string,
    data: any,
    req?: any
  ) {
    await this.getPerformanceReviewById(id, organizationId);
    if (data.employeeId) await this.ensureEmployee(organizationId, data.employeeId);
    await this.ensureReviewer(organizationId, data.reviewerId);
    const updated = await prisma.performanceReview.update({
      where: { id },
      data,
      include: PERFORMANCE_REVIEW_INCLUDE,
    });
    await AuditService.updated(organizationId, actorId, 'performanceReview', id, data, req);
    return updated;
  }

  static async submitPerformanceReview(
    id: string,
    organizationId: string,
    actorId: string,
    req?: any
  ) {
    await this.getPerformanceReviewById(id, organizationId);
    const updated = await prisma.performanceReview.update({
      where: { id },
      data: {
        status: ReviewStatus.submitted,
        submittedAt: new Date(),
      },
      include: PERFORMANCE_REVIEW_INCLUDE,
    });
    await AuditService.updated(organizationId, actorId, 'performanceReview', id, { status: 'submitted' }, req);
    return updated;
  }

  static async deletePerformanceReview(id: string, organizationId: string, actorId: string, req?: any) {
    await this.getPerformanceReviewById(id, organizationId);
    await prisma.performanceReview.delete({ where: { id } });
    await AuditService.deleted(organizationId, actorId, 'performanceReview', id, undefined, req);
    return { success: true };
  }
}
