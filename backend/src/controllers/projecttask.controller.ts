import { Response, NextFunction } from 'express';
import { ProjectTaskService } from '../services/projecttask.service';
import { sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../middleware/auth';

export class ProjectTaskController {
  static async getTasks(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const tasks = await ProjectTaskService.getProjectTasks(req.user!.organizationId, {
        projectId: req.query.projectId as string | undefined,
        assigneeId: req.query.assigneeId as string | undefined,
        status: req.query.status as string | undefined,
      });
      sendSuccess(res, tasks);
    } catch (error) { next(error); }
  }

  static async getTaskById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const task = await ProjectTaskService.getProjectTaskById(req.params.id, req.user!.organizationId);
      sendSuccess(res, task);
    } catch (error) { next(error); }
  }

  static async createTask(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const task = await ProjectTaskService.createProjectTask(
        req.user!.organizationId, req.user!.userId, req.body, req
      );
      sendSuccess(res, task, 'Task created successfully', 201);
    } catch (error) { next(error); }
  }

  static async updateTask(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const task = await ProjectTaskService.updateProjectTask(
        req.params.id, req.user!.organizationId, req.user!.userId, req.body, req
      );
      sendSuccess(res, task, 'Task updated successfully');
    } catch (error) { next(error); }
  }

  static async updateTaskStatus(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const task = await ProjectTaskService.updateProjectTaskStatus(
        req.params.id, req.user!.organizationId, req.user!.userId, req.body.status, req
      );
      sendSuccess(res, task, 'Task status updated successfully');
    } catch (error) { next(error); }
  }

  static async deleteTask(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await ProjectTaskService.deleteProjectTask(
        req.params.id, req.user!.organizationId, req.user!.userId, req
      );
      sendSuccess(res, result, 'Task deleted successfully');
    } catch (error) { next(error); }
  }
}
