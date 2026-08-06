import prisma from '../config/db';
import { NotFoundError } from '../utils/errors';
import { OfferStatus } from '@prisma/client';
import { AuditService } from './audit.service';

export class OfferLetterService {
  private static async ensureApplication(organizationId: string, applicationId?: string | null) {
    if (!applicationId) return;
    const application = await prisma.application.findFirst({
      where: { id: applicationId, organizationId },
    });
    if (!application) throw new NotFoundError('Application not found');
  }

  static async getOfferLetters(
    organizationId: string,
    filters?: { applicationId?: string; status?: string }
  ) {
    const where: any = { organizationId };
    if (filters?.applicationId) where.applicationId = filters.applicationId;
    if (filters?.status) where.status = filters.status;
    return prisma.offerLetter.findMany({ where, orderBy: { createdAt: 'desc' } });
  }

  static async getOfferLetterById(id: string, organizationId: string) {
    const letter = await prisma.offerLetter.findFirst({
      where: { id, organizationId },
    });
    if (!letter) throw new NotFoundError('Offer letter not found');
    return letter;
  }

  static async createOfferLetter(
    organizationId: string,
    createdById: string,
    data: {
      applicationId?: string | null; candidateName: string; candidateEmail: string; position: string;
      salary?: number; joiningDate?: Date | null; status?: any;
    },
    req?: any
  ) {
    await this.ensureApplication(organizationId, data.applicationId);
    const letter = await prisma.offerLetter.create({
      data: {
        applicationId: data.applicationId,
        candidateName: data.candidateName,
        candidateEmail: data.candidateEmail,
        position: data.position,
        salary: data.salary ?? 0,
        joiningDate: data.joiningDate,
        status: data.status,
        organizationId,
        createdById,
      },
    });
    await AuditService.created(organizationId, createdById, 'offerLetter', letter.id, undefined, req);
    return letter;
  }

  static async updateOfferLetter(
    id: string,
    organizationId: string,
    actorId: string,
    data: any,
    req?: any
  ) {
    await this.getOfferLetterById(id, organizationId);
    await this.ensureApplication(organizationId, data.applicationId);
    const updated = await prisma.offerLetter.update({ where: { id }, data });
    await AuditService.updated(organizationId, actorId, 'offerLetter', id, data, req);
    return updated;
  }

  static async updateOfferLetterStatus(
    id: string,
    organizationId: string,
    actorId: string,
    status: string,
    req?: any
  ) {
    const letter = await this.getOfferLetterById(id, organizationId);
    const updated = await prisma.offerLetter.update({
      where: { id },
      data: {
        status: status as OfferStatus,
        sentAt: status === 'sent' ? letter.sentAt ?? new Date() : letter.sentAt,
        acceptedAt: status === 'accepted' ? letter.acceptedAt ?? new Date() : letter.acceptedAt,
      },
    });
    await AuditService.updated(organizationId, actorId, 'offerLetter', id, { status }, req);
    return updated;
  }

  static async deleteOfferLetter(id: string, organizationId: string, actorId: string, req?: any) {
    await this.getOfferLetterById(id, organizationId);
    await prisma.offerLetter.delete({ where: { id } });
    await AuditService.deleted(organizationId, actorId, 'offerLetter', id, undefined, req);
    return { success: true };
  }
}
