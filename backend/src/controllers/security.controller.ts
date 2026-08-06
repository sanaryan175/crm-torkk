import { Response, NextFunction } from 'express';
import { ApiKeyService, TwoFactorSettingService, LoginHistoryService } from '../services/security.service';
import { sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../middleware/auth';

export class SecurityController {
  static async listApiKeys(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const keys = await ApiKeyService.listApiKeys(req.user!.organizationId);
      sendSuccess(res, keys);
    } catch (error) { next(error); }
  }

  static async createApiKey(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const apiKey = await ApiKeyService.createApiKey(
        req.user!.organizationId, req.user!.userId, req.body, req
      );
      sendSuccess(res, apiKey, 'API key created successfully', 201);
    } catch (error) { next(error); }
  }

  static async revokeApiKey(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await ApiKeyService.revokeApiKey(
        req.params.id, req.user!.organizationId, req.user!.userId, req
      );
      sendSuccess(res, result, 'API key revoked successfully');
    } catch (error) { next(error); }
  }

  static async getTwoFactorSetting(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const setting = await TwoFactorSettingService.getSetting(
        req.user!.organizationId, req.user!.userId
      );
      sendSuccess(res, setting);
    } catch (error) { next(error); }
  }

  static async updateTwoFactorSetting(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const setting = await TwoFactorSettingService.updateSetting(
        req.user!.organizationId, req.user!.userId, req.body, req
      );
      sendSuccess(res, setting, 'Two-factor setting updated successfully');
    } catch (error) { next(error); }
  }

  static async verifyTwoFactor(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await TwoFactorSettingService.verifySetting(
        req.user!.organizationId, req.user!.userId, req.body, req
      );
      sendSuccess(res, result, 'Two-factor verified successfully');
    } catch (error) { next(error); }
  }

  static async getLoginHistory(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const history = await LoginHistoryService.getLoginHistory(
        req.user!.organizationId,
        req.query.userId as string | undefined
      );
      sendSuccess(res, history);
    } catch (error) { next(error); }
  }
}
