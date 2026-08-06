import prisma from '../config/db';
import { NotFoundError } from '../utils/errors';
import { AuditService } from './audit.service';

const DOCUMENT_INCLUDE = {
  versions: { orderBy: { version: 'desc' as const } },
};

export class DocumentService {
  static async getDocuments(
    organizationId: string,
    filters?: { status?: string; relatedModel?: string; relatedId?: string; q?: string }
  ) {
    const where: any = { organizationId };
    if (filters?.status) where.status = filters.status;
    if (filters?.relatedModel) where.relatedModel = filters.relatedModel;
    if (filters?.relatedId) where.relatedId = filters.relatedId;
    if (filters?.q) {
      where.OR = [
        { name: { contains: filters.q, mode: 'insensitive' } },
        { category: { contains: filters.q, mode: 'insensitive' } },
      ];
    }
    return prisma.document.findMany({ where, orderBy: { createdAt: 'desc' } });
  }

  static async getDocumentById(id: string, organizationId: string) {
    const document = await prisma.document.findFirst({
      where: { id, organizationId },
      include: DOCUMENT_INCLUDE,
    });
    if (!document) throw new NotFoundError('Document not found');
    return document;
  }

  static async createDocument(
    organizationId: string,
    actorId: string,
    data: any,
    req?: any
  ) {
    const created = await prisma.$transaction(async (tx) => {
      return tx.document.create({
        data: {
          name: data.name,
          category: data.category,
          fileId: data.fileId,
          relatedModel: data.relatedModel,
          relatedId: data.relatedId,
          status: data.status,
          signed: data.signed,
          signedAt: data.signedAt,
          signatureName: data.signatureName,
          signatureData: data.signatureData,
          version: 1,
          uploadedById: actorId,
          organizationId,
          versions: {
            create: {
              version: 1,
              fileId: data.fileId,
              size: data.size ?? 0,
              note: data.note,
              uploadedById: actorId,
              organizationId,
            },
          },
        },
        include: DOCUMENT_INCLUDE,
      });
    });

    await AuditService.created(organizationId, actorId, 'document', created.id, undefined, req);
    return created;
  }

  static async updateDocument(
    id: string,
    organizationId: string,
    actorId: string,
    data: any,
    req?: any
  ) {
    const existing = await this.getDocumentById(id, organizationId);

    const updateData: any = {};
    const scalarFields = ['name', 'category', 'relatedModel', 'relatedId', 'status'] as const;
    for (const field of scalarFields) {
      if (data[field] !== undefined) updateData[field] = data[field];
    }
    if (data.fileId !== undefined) updateData.fileId = data.fileId === '' ? null : data.fileId;
    if (data.signed !== undefined) updateData.signed = data.signed;
    if (data.signedAt !== undefined) {
      updateData.signedAt = data.signedAt === '' ? null : data.signedAt;
    }
    if (data.signatureName !== undefined) {
      updateData.signatureName = data.signatureName === '' ? null : data.signatureName;
    }
    if (data.signatureData !== undefined) {
      updateData.signatureData = data.signatureData === '' ? null : data.signatureData;
    }

    const nextFileId = data.fileId !== undefined
      ? (data.fileId === '' ? null : data.fileId)
      : existing.fileId;
    const newVersion = existing.version + 1;
    updateData.version = newVersion;

    const updated = await prisma.$transaction(async (tx) => {
      await tx.documentVersion.create({
        data: {
          organizationId,
          documentId: id,
          version: newVersion,
          fileId: nextFileId,
          size: data.size ?? 0,
          note: data.note,
          uploadedById: actorId,
        },
      });
      return tx.document.update({
        where: { id },
        data: updateData,
        include: DOCUMENT_INCLUDE,
      });
    });

    await AuditService.updated(organizationId, actorId, 'document', id, data, req);
    return updated;
  }

  static async getDocumentVersions(id: string, organizationId: string) {
    const document = await prisma.document.findFirst({ where: { id, organizationId } });
    if (!document) throw new NotFoundError('Document not found');
    return prisma.documentVersion.findMany({
      where: { documentId: id, organizationId },
      orderBy: { version: 'desc' },
    });
  }

  static async deleteDocument(id: string, organizationId: string, actorId: string, req?: any) {
    await this.getDocumentById(id, organizationId);
    await prisma.document.delete({ where: { id } });
    await AuditService.deleted(organizationId, actorId, 'document', id, undefined, req);
    return { success: true };
  }
}
