import { Response, NextFunction } from 'express';
import { TrainingService } from '../services/training.service';
import { sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../middleware/auth';

export class TrainingController {
  static async getTrainings(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const trainings = await TrainingService.getTrainings(req.user!.organizationId);
      sendSuccess(res, trainings);
    } catch (error) { next(error); }
  }

  static async getTrainingById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const training = await TrainingService.getTrainingById(req.params.id, req.user!.organizationId);
      sendSuccess(res, training);
    } catch (error) { next(error); }
  }

  static async createTraining(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const training = await TrainingService.createTraining(
        req.user!.organizationId, req.user!.userId, req.body, req
      );
      sendSuccess(res, training, 'Training created successfully', 201);
    } catch (error) { next(error); }
  }

  static async updateTraining(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const training = await TrainingService.updateTraining(
        req.params.id, req.user!.organizationId, req.user!.userId, req.body, req
      );
      sendSuccess(res, training, 'Training updated successfully');
    } catch (error) { next(error); }
  }

  static async enrollEmployee(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const enrollment = await TrainingService.enrollEmployee(
        req.params.id, req.user!.organizationId, req.user!.userId, req.body.employeeId, req
      );
      sendSuccess(res, enrollment, 'Employee enrolled successfully', 201);
    } catch (error) { next(error); }
  }

  static async completeEnrollment(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const enrollment = await TrainingService.completeEnrollment(
        req.params.id, req.params.enrollmentId, req.user!.organizationId, req.user!.userId, req
      );
      sendSuccess(res, enrollment, 'Training enrollment completed successfully');
    } catch (error) { next(error); }
  }

  static async deleteTraining(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await TrainingService.deleteTraining(
        req.params.id, req.user!.organizationId, req.user!.userId, req
      );
      sendSuccess(res, result, 'Training deleted successfully');
    } catch (error) { next(error); }
  }
}
