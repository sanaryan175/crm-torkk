import { Response, NextFunction } from 'express';
import { ContractService } from '../services/contract.service';
import { sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../middleware/auth';

export class ContractController {
  static async getContracts(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const contracts = await ContractService.getContracts(req.user!.organizationId, {
        status: req.query.status as string | undefined,
        contactId: req.query.contactId as string | undefined,
      });
      sendSuccess(res, contracts);
    } catch (error) { next(error); }
  }

  static async getContractById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const contract = await ContractService.getContractById(req.params.id, req.user!.organizationId);
      sendSuccess(res, contract);
    } catch (error) { next(error); }
  }

  static async createContract(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const contract = await ContractService.createContract(
        req.user!.organizationId, req.user!.userId, req.body, req
      );
      sendSuccess(res, contract, 'Contract created successfully', 201);
    } catch (error) { next(error); }
  }

  static async updateContract(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const contract = await ContractService.updateContract(
        req.params.id, req.user!.organizationId, req.user!.userId, req.body, req
      );
      sendSuccess(res, contract, 'Contract updated successfully');
    } catch (error) { next(error); }
  }

  static async signContract(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const contract = await ContractService.signContract(
        req.params.id, req.user!.organizationId, req.user!.userId, req.body, req
      );
      sendSuccess(res, contract, 'Contract signed successfully');
    } catch (error) { next(error); }
  }

  static async deleteContract(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await ContractService.deleteContract(
        req.params.id, req.user!.organizationId, req.user!.userId, req
      );
      sendSuccess(res, result, 'Contract deleted successfully');
    } catch (error) { next(error); }
  }
}
