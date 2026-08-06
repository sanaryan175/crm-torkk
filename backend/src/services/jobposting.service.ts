import prisma from '../config/db';
import { NotFoundError } from '../utils/errors';
import { JobStatus } from '@prisma/client';
import { AuditService } from './audit.service';

export class JobPostingService {
  static async getJobPostings(
    organizationId: string,
    filters?: { status?: string; department?: string }
  ) {
    const where: any = { organizationId };
    if (filters?.status) where.status = filters.status;
    if (filters?.department) where.department = filters.department;
    return prisma.jobPosting.findMany({ where, orderBy: { createdAt: 'desc' } });
  }

  static async getJobPostingById(id: string, organizationId: string) {
    const posting = await prisma.jobPosting.findFirst({
      where: { id, organizationId },
    });
    if (!posting) throw new NotFoundError('Job posting not found');
    return posting;
  }

  static async createJobPosting(
    organizationId: string,
    createdById: string,
    data: {
      title: string; department?: string | null; location?: string | null; type?: string | null;
      description?: string | null; requirements?: string | null; salaryRange?: string | null;
      status?: any; postedAt?: Date | null;
    },
    req?: any
  ) {
    const posting = await prisma.jobPosting.create({
      data: {
        title: data.title,
        department: data.department,
        location: data.location,
        type: data.type,
        description: data.description,
        requirements: data.requirements,
        salaryRange: data.salaryRange,
        status: data.status,
        postedAt: data.postedAt,
        organizationId,
        createdById,
      },
    });
    await AuditService.created(organizationId, createdById, 'jobPosting', posting.id, undefined, req);
    return posting;
  }

  static async updateJobPosting(
    id: string,
    organizationId: string,
    actorId: string,
    data: any,
    req?: any
  ) {
    await this.getJobPostingById(id, organizationId);
    const updated = await prisma.jobPosting.update({ where: { id }, data });
    await AuditService.updated(organizationId, actorId, 'jobPosting', id, data, req);
    return updated;
  }

  static async publishJobPosting(
    id: string,
    organizationId: string,
    actorId: string,
    status?: string,
    req?: any
  ) {
    const posting = await this.getJobPostingById(id, organizationId);
    const nextStatus = status ?? 'published';
    const updated = await prisma.jobPosting.update({
      where: { id },
      data: {
        status: nextStatus as JobStatus,
        postedAt: nextStatus === 'published' ? posting.postedAt ?? new Date() : posting.postedAt,
      },
    });
    await AuditService.updated(organizationId, actorId, 'jobPosting', id, { status: nextStatus }, req);
    return updated;
  }

  static async deleteJobPosting(id: string, organizationId: string, actorId: string, req?: any) {
    await this.getJobPostingById(id, organizationId);
    await prisma.jobPosting.delete({ where: { id } });
    await AuditService.deleted(organizationId, actorId, 'jobPosting', id, undefined, req);
    return { success: true };
  }
}
