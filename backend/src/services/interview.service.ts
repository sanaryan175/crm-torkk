import prisma from '../config/db';
import { NotFoundError } from '../utils/errors';
import { InterviewStatus } from '@prisma/client';
import { AuditService } from './audit.service';

const INTERVIEW_INCLUDE = {
  application: { select: { id: true, candidateName: true, candidateEmail: true, status: true } },
  interviewer: { select: { id: true, name: true, email: true, avatar: true } },
};

export class InterviewService {
  private static async ensureInterviewer(organizationId: string, interviewerId?: string | null) {
    if (!interviewerId) return;
    const user = await prisma.user.findFirst({
      where: { id: interviewerId, organizationId, isActive: true },
    });
    if (!user) throw new NotFoundError('Interviewer not found');
  }

  private static async ensureApplication(organizationId: string, applicationId?: string | null) {
    if (!applicationId) return;
    const application = await prisma.application.findFirst({
      where: { id: applicationId, organizationId },
    });
    if (!application) throw new NotFoundError('Application not found');
  }

  static async getInterviews(
    organizationId: string,
    filters?: { applicationId?: string; interviewerId?: string }
  ) {
    const where: any = { organizationId };
    if (filters?.applicationId) where.applicationId = filters.applicationId;
    if (filters?.interviewerId) where.interviewerId = filters.interviewerId;
    return prisma.interview.findMany({
      where,
      include: INTERVIEW_INCLUDE,
      orderBy: { scheduledAt: 'desc' },
    });
  }

  static async getInterviewById(id: string, organizationId: string) {
    const interview = await prisma.interview.findFirst({
      where: { id, organizationId },
      include: INTERVIEW_INCLUDE,
    });
    if (!interview) throw new NotFoundError('Interview not found');
    return interview;
  }

  static async createInterview(
    organizationId: string,
    data: {
      applicationId?: string | null; jobPostingId?: string | null; candidateName: string;
      candidateEmail: string; scheduledAt: Date; duration?: number; type: any;
      interviewerId?: string | null; notes?: string | null; rating?: number | null;
    },
    req?: any
  ) {
    await this.ensureInterviewer(organizationId, data.interviewerId);
    await this.ensureApplication(organizationId, data.applicationId);
    const interview = await prisma.interview.create({
      data: {
        applicationId: data.applicationId,
        jobPostingId: data.jobPostingId,
        candidateName: data.candidateName,
        candidateEmail: data.candidateEmail,
        scheduledAt: data.scheduledAt,
        duration: data.duration ?? 60,
        type: data.type,
        interviewerId: data.interviewerId,
        notes: data.notes,
        rating: data.rating,
        organizationId,
      },
      include: INTERVIEW_INCLUDE,
    });
    await AuditService.created(organizationId, data.interviewerId ?? '', 'interview', interview.id, undefined, req);
    return interview;
  }

  static async updateInterview(
    id: string,
    organizationId: string,
    actorId: string,
    data: any,
    req?: any
  ) {
    await this.getInterviewById(id, organizationId);
    await this.ensureInterviewer(organizationId, data.interviewerId);
    await this.ensureApplication(organizationId, data.applicationId);
    const updated = await prisma.interview.update({
      where: { id },
      data,
      include: INTERVIEW_INCLUDE,
    });
    await AuditService.updated(organizationId, actorId, 'interview', id, data, req);
    return updated;
  }

  static async updateInterviewResult(
    id: string,
    organizationId: string,
    actorId: string,
    result: string,
    req?: any
  ) {
    await this.getInterviewById(id, organizationId);
    const updated = await prisma.interview.update({
      where: { id },
      data: { status: result as InterviewStatus },
      include: INTERVIEW_INCLUDE,
    });
    await AuditService.updated(organizationId, actorId, 'interview', id, { status: result }, req);
    return updated;
  }

  static async deleteInterview(id: string, organizationId: string, actorId: string, req?: any) {
    await this.getInterviewById(id, organizationId);
    await prisma.interview.delete({ where: { id } });
    await AuditService.deleted(organizationId, actorId, 'interview', id, undefined, req);
    return { success: true };
  }
}
