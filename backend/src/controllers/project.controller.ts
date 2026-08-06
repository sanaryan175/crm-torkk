import { Response, NextFunction } from 'express';
import { ProjectService } from '../services/project.service';
import { sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../middleware/auth';

export class ProjectController {
  static async getProjects(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const projects = await ProjectService.getProjects(req.user!.organizationId, {
        status: req.query.status as string | undefined,
        managerId: req.query.managerId as string | undefined,
        q: req.query.q as string | undefined,
      });
      sendSuccess(res, projects);
    } catch (error) { next(error); }
  }

  static async getProjectById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const project = await ProjectService.getProjectById(req.params.id, req.user!.organizationId);
      sendSuccess(res, project);
    } catch (error) { next(error); }
  }

  static async createProject(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const project = await ProjectService.createProject(
        req.user!.organizationId, req.user!.userId, req.body, req
      );
      sendSuccess(res, project, 'Project created successfully', 201);
    } catch (error) { next(error); }
  }

  static async updateProject(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const project = await ProjectService.updateProject(
        req.params.id, req.user!.organizationId, req.user!.userId, req.body, req
      );
      sendSuccess(res, project, 'Project updated successfully');
    } catch (error) { next(error); }
  }

  static async addMember(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const member = await ProjectService.addProjectMember(
        req.params.id, req.user!.organizationId, req.user!.userId, req.body, req
      );
      sendSuccess(res, member, 'Member added successfully', 201);
    } catch (error) { next(error); }
  }

  static async removeMember(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await ProjectService.removeProjectMember(
        req.params.id, req.params.memberId, req.user!.organizationId, req.user!.userId, req
      );
      sendSuccess(res, result, 'Member removed successfully');
    } catch (error) { next(error); }
  }

  static async addMilestone(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const milestone = await ProjectService.addMilestone(
        req.params.id, req.user!.organizationId, req.user!.userId, req.body, req
      );
      sendSuccess(res, milestone, 'Milestone created successfully', 201);
    } catch (error) { next(error); }
  }

  static async updateMilestone(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const milestone = await ProjectService.updateMilestone(
        req.params.id, req.params.milestoneId, req.user!.organizationId, req.user!.userId, req.body, req
      );
      sendSuccess(res, milestone, 'Milestone updated successfully');
    } catch (error) { next(error); }
  }

  static async deleteMilestone(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await ProjectService.deleteMilestone(
        req.params.id, req.params.milestoneId, req.user!.organizationId, req.user!.userId, req
      );
      sendSuccess(res, result, 'Milestone deleted successfully');
    } catch (error) { next(error); }
  }

  static async deleteProject(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await ProjectService.deleteProject(
        req.params.id, req.user!.organizationId, req.user!.userId, req
      );
      sendSuccess(res, result, 'Project deleted successfully');
    } catch (error) { next(error); }
  }
}
