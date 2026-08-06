import prisma from '../config/db';
import { NotFoundError } from '../utils/errors';
import { ApplicationStatus } from '@prisma/client';
import { AuditService } from './audit.service';

const APPLICATION_INCLUDE = {
  jobPosting: { select: { id: true, title: true, department: true, status: true } },
};

export class ApplicationService {
  private static async ensureJobPosting(organizationId: string, jobPostingId: string) {
    const posting = await prisma.jobPosting.findFirst({
      where: { id: jobPostingId, organizationId },
    });
    if (!posting) throw new NotFoundError('Job posting not found');
  }

  static async getApplications(
    organizationId: string,
    filters?: { jobPostingId?: string; status?: string }
  ) {
    const where: any = { organizationId };
    if (filters?.jobPostingId) where.jobPostingId = filters.jobPostingId;
    if (filters?.status) where.status = filters.status;
    return prisma.application.findMany({
      where,
      include: APPLICATION_INCLUDE,
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getApplicationById(id: string, organizationId: string) {
    const application = await prisma.application.findFirst({
      where: { id, organizationId },
      include: APPLICATION_INCLUDE,
    });
    if (!application) throw new NotFoundError('Application not found');
    return application;
  }

  static async createApplication(
    organizationId: string,
    createdById: string,
    data: {
      jobPostingId: string; candidateName: string; candidateEmail: string; phone?: string | null;
      resumeUrl?: string | null; coverLetter?: string | null; status?: any; source?: string | null;
      notes?: string | null;
    },
    req?: any
  ) {
    await this.ensureJobPosting(organizationId, data.jobPostingId);
    const application = await prisma.application.create({
      data: {
        jobPostingId: data.jobPostingId,
        candidateName: data.candidateName,
        candidateEmail: data.candidateEmail,
        phone: data.phone,
        resumeUrl: data.resumeUrl,
        coverLetter: data.coverLetter,
        status: data.status,
        source: data.source,
        notes: data.notes,
        organizationId,
        createdById,
      },
      include: APPLICATION_INCLUDE,
    });
    await AuditService.created(organizationId, createdById, 'application', application.id, undefined, req);
    return application;
  }

  static async updateApplication(
    id: string,
    organizationId: string,
    actorId: string,
    data: any,
    req?: any
  ) {
    await this.getApplicationById(id, organizationId);
    if (data.jobPostingId) await this.ensureJobPosting(organizationId, data.jobPostingId);
    const updated = await prisma.application.update({
      where: { id },
      data,
      include: APPLICATION_INCLUDE,
    });
    await AuditService.updated(organizationId, actorId, 'application', id, data, req);
    return updated;
  }

  static async updateApplicationStatus(
    id: string,
    organizationId: string,
    actorId: string,
    status: string,
    req?: any
  ) {
    await this.getApplicationById(id, organizationId);
    const updated = await prisma.application.update({
      where: { id },
      data: { status: status as ApplicationStatus },
      include: APPLICATION_INCLUDE,
    });
    await AuditService.updated(organizationId, actorId, 'application', id, { status }, req);
    return updated;
  }

  static async deleteApplication(id: string, organizationId: string, actorId: string, req?: any) {
    await this.getApplicationById(id, organizationId);
    await prisma.application.delete({ where: { id } });
    await AuditService.deleted(organizationId, actorId, 'application', id, undefined, req);
    return { success: true };
  }
}
