import { Response, NextFunction } from 'express';
import { DocumentService } from '../services/document.service';
import { sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../middleware/auth';

export class DocumentController {
  static async getDocuments(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const documents = await DocumentService.getDocuments(req.user!.organizationId, {
        status: req.query.status as string | undefined,
        relatedModel: req.query.type as string | undefined,
        relatedId: req.query.folderId as string | undefined,
        q: req.query.q as string | undefined,
      });
      sendSuccess(res, documents);
    } catch (error) { next(error); }
  }

  static async getDocumentById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const document = await DocumentService.getDocumentById(
        req.params.id, req.user!.organizationId
      );
      sendSuccess(res, document);
    } catch (error) { next(error); }
  }

  static async createDocument(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const document = await DocumentService.createDocument(
        req.user!.organizationId, req.user!.userId, req.body, req
      );
      sendSuccess(res, document, 'Document created successfully', 201);
    } catch (error) { next(error); }
  }

  static async updateDocument(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const document = await DocumentService.updateDocument(
        req.params.id, req.user!.organizationId, req.user!.userId, req.body, req
      );
      sendSuccess(res, document, 'Document updated successfully');
    } catch (error) { next(error); }
  }

  static async getDocumentVersions(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const versions = await DocumentService.getDocumentVersions(
        req.params.id, req.user!.organizationId
      );
      sendSuccess(res, versions);
    } catch (error) { next(error); }
  }

  static async deleteDocument(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await DocumentService.deleteDocument(
        req.params.id, req.user!.organizationId, req.user!.userId, req
      );
      sendSuccess(res, result, 'Document deleted successfully');
    } catch (error) { next(error); }
  }
}
