import prisma from '../config/db';
import { NotFoundError } from '../utils/errors';
import { ArticleStatus } from '@prisma/client';
import { AuditService } from './audit.service';

export class KnowledgeService {
  private static generateSlug(title: string): string {
    const base = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60);
    return `${base || 'article'}-${Date.now().toString(36)}`;
  }

  static async getArticles(
    organizationId: string,
    filters?: { category?: string; status?: string; q?: string }
  ) {
    const where: any = { organizationId };
    if (filters?.category) where.category = filters.category;
    if (filters?.status) where.status = filters.status;
    if (filters?.q) {
      where.OR = [
        { title: { contains: filters.q, mode: 'insensitive' } },
        { content: { contains: filters.q, mode: 'insensitive' } },
      ];
    }
    return prisma.knowledgeArticle.findMany({ where, orderBy: { createdAt: 'desc' } });
  }

  static async getArticleById(id: string, organizationId: string) {
    const article = await prisma.knowledgeArticle.findFirst({ where: { id, organizationId } });
    if (!article) throw new NotFoundError('Knowledge article not found');
    return article;
  }

  static async createArticle(
    organizationId: string,
    authorId: string,
    data: { title: string; content: string; category?: string | null; status?: any },
    req?: any
  ) {
    const article = await prisma.knowledgeArticle.create({
      data: {
        title: data.title,
        slug: this.generateSlug(data.title),
        content: data.content,
        category: data.category,
        status: data.status ?? ArticleStatus.draft,
        publishedAt: data.status === 'published' ? new Date() : undefined,
        organizationId,
        authorId,
      },
    });
    await AuditService.created(organizationId, authorId, 'knowledgeArticle', article.id, undefined, req);
    return article;
  }

  static async updateArticle(id: string, organizationId: string, actorId: string, data: any, req?: any) {
    const existing = await this.getArticleById(id, organizationId);
    if (data.status === 'published' && !existing.publishedAt) data.publishedAt = new Date();
    const updated = await prisma.knowledgeArticle.update({ where: { id }, data });
    await AuditService.updated(organizationId, actorId, 'knowledgeArticle', id, data, req);
    return updated;
  }

  static async deleteArticle(id: string, organizationId: string, actorId: string, req?: any) {
    await this.getArticleById(id, organizationId);
    await prisma.knowledgeArticle.delete({ where: { id } });
    await AuditService.deleted(organizationId, actorId, 'knowledgeArticle', id, undefined, req);
    return { success: true };
  }
}
