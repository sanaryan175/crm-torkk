import { Response, NextFunction } from 'express';
import { KnowledgeService } from '../services/knowledge.service';
import { sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../middleware/auth';

export class KnowledgeController {
  static async getArticles(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const articles = await KnowledgeService.getArticles(req.user!.organizationId, {
        category: req.query.category as string | undefined,
        status: (req.query.status as string | undefined) ?? 'published',
        q: req.query.q as string | undefined,
      });
      sendSuccess(res, articles);
    } catch (error) { next(error); }
  }

  static async getArticleById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const article = await KnowledgeService.getArticleById(req.params.id, req.user!.organizationId);
      sendSuccess(res, article);
    } catch (error) { next(error); }
  }

  static async createArticle(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const article = await KnowledgeService.createArticle(
        req.user!.organizationId, req.user!.userId, req.body, req
      );
      sendSuccess(res, article, 'Knowledge article created successfully', 201);
    } catch (error) { next(error); }
  }

  static async updateArticle(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const article = await KnowledgeService.updateArticle(
        req.params.id, req.user!.organizationId, req.user!.userId, req.body, req
      );
      sendSuccess(res, article, 'Knowledge article updated successfully');
    } catch (error) { next(error); }
  }

  static async deleteArticle(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await KnowledgeService.deleteArticle(
        req.params.id, req.user!.organizationId, req.user!.userId, req
      );
      sendSuccess(res, result, 'Knowledge article deleted successfully');
    } catch (error) { next(error); }
  }
}
