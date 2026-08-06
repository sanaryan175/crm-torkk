import { Response, NextFunction } from 'express';
import { ChatService } from '../services/chat.service';
import { sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../middleware/auth';

export class ChatController {
  static async getMessages(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const otherUserId = req.query.userId as string | undefined;
      if (!otherUserId) {
        sendSuccess(res, []);
        return;
      }
      const messages = await ChatService.getMessages(
        req.user!.organizationId, req.user!.userId, otherUserId
      );
      sendSuccess(res, messages);
    } catch (error) { next(error); }
  }

  static async getConversations(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const conversations = await ChatService.getConversations(
        req.user!.organizationId, req.user!.userId
      );
      sendSuccess(res, conversations);
    } catch (error) { next(error); }
  }

  static async createMessage(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const message = await ChatService.sendMessage(
        req.user!.organizationId, req.user!.userId, req.body, req
      );
      sendSuccess(res, message, 'Message sent successfully', 201);
    } catch (error) { next(error); }
  }

  static async getMessageById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const message = await ChatService.getMessageById(req.params.id, req.user!.organizationId);
      sendSuccess(res, message);
    } catch (error) { next(error); }
  }

  static async deleteMessage(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await ChatService.deleteMessage(
        req.params.id, req.user!.organizationId, req.user!.userId, req
      );
      sendSuccess(res, result, 'Message deleted successfully');
    } catch (error) { next(error); }
  }
}
