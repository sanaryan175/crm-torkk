import { Response, NextFunction } from 'express';
import { EmployeeDocumentService } from '../services/employeedocument.service';
import { sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../middleware/auth';

export class EmployeeDocumentController {
  static async getEmployeeDocuments(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const documents = await EmployeeDocumentService.getEmployeeDocuments(req.user!.organizationId, {
        employeeId: req.query.employeeId as string | undefined,
      });
      sendSuccess(res, documents);
    } catch (error) { next(error); }
  }

  static async getEmployeeDocumentById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const document = await EmployeeDocumentService.getEmployeeDocumentById(req.params.id, req.user!.organizationId);
      sendSuccess(res, document);
    } catch (error) { next(error); }
  }

  static async createEmployeeDocument(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const document = await EmployeeDocumentService.createEmployeeDocument(
        req.user!.organizationId, req.user!.userId, req.body, req
      );
      sendSuccess(res, document, 'Employee document created successfully', 201);
    } catch (error) { next(error); }
  }

  static async updateEmployeeDocument(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const document = await EmployeeDocumentService.updateEmployeeDocument(
        req.params.id, req.user!.organizationId, req.user!.userId, req.body, req
      );
      sendSuccess(res, document, 'Employee document updated successfully');
    } catch (error) { next(error); }
  }

  static async deleteEmployeeDocument(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await EmployeeDocumentService.deleteEmployeeDocument(
        req.params.id, req.user!.organizationId, req.user!.userId, req
      );
      sendSuccess(res, result, 'Employee document deleted successfully');
    } catch (error) { next(error); }
  }
}
