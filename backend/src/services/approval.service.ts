import { randomUUID } from 'crypto';
import prisma from '../config/db';
import { NotFoundError, BadRequestError, ForbiddenError } from '../utils/errors';
import { ApprovalStatus } from '@prisma/client';
import { AuditService } from './audit.service';
import { NotificationHelper } from '../utils/notification.helper';

interface ApprovalFlowData {
  name?: string;
  description?: string | null;
  module?: string;
  steps?: any;
  isActive?: boolean;
}

interface ApprovalRequestData {
  flowId?: string;
  module?: string;
  resourceId?: string;
  title?: string;
  reason?: string | null;
  description?: string | null;
  data?: any;
}

interface DecideData {
  decision: any;
  comment?: string | null;
}

export class ApprovalService {
  private static async withFlow(request: any) {
    if (!request.flowId) return { ...request, flow: null };
    const flow = await prisma.approvalFlow.findFirst({
      where: { id: request.flowId, organizationId: request.organizationId },
    });
    return { ...request, flow };
  }

  private static async isDecider(request: any, actorId: string): Promise<boolean> {
    if (request.requestedById === actorId) return true;
    if (!request.flowId) return false;
    const flow = await prisma.approvalFlow.findFirst({
      where: { id: request.flowId, organizationId: request.organizationId },
    });
    if (!flow) return false;
    const steps = Array.isArray(flow.steps) ? (flow.steps as any[]) : [];
    return steps.some((step: any) => {
      if (!step) return false;
      if (step.approverId === actorId || step.userId === actorId) return true;
      if (Array.isArray(step.approvers)) return step.approvers.includes(actorId);
      return false;
    });
  }

  // ─── Approval Flows ──────────────────────────────────────────────────────────

  static async getApprovalFlows(organizationId: string) {
    return prisma.approvalFlow.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getApprovalFlowById(id: string, organizationId: string) {
    const flow = await prisma.approvalFlow.findFirst({ where: { id, organizationId } });
    if (!flow) throw new NotFoundError('Approval flow not found');
    return flow;
  }

  static async createApprovalFlow(
    organizationId: string,
    createdById: string,
    data: ApprovalFlowData,
    req?: any
  ) {
    const flow = await prisma.approvalFlow.create({
      data: {
        name: data.name!,
        description: data.description,
        module: data.module!,
        steps: data.steps ?? [],
        isActive: data.isActive,
        organizationId,
        createdById,
      },
    });
    await AuditService.created(organizationId, createdById, 'approval_flow', flow.id, undefined, req);
    return flow;
  }

  static async updateApprovalFlow(
    id: string,
    organizationId: string,
    actorId: string,
    data: ApprovalFlowData,
    req?: any
  ) {
    await this.getApprovalFlowById(id, organizationId);
    const updated = await prisma.approvalFlow.update({ where: { id }, data });
    await AuditService.updated(organizationId, actorId, 'approval_flow', id, data, req);
    return updated;
  }

  static async deleteApprovalFlow(id: string, organizationId: string, actorId: string, req?: any) {
    await this.getApprovalFlowById(id, organizationId);
    await prisma.approvalFlow.delete({ where: { id } });
    await AuditService.deleted(organizationId, actorId, 'approval_flow', id, undefined, req);
    return { success: true };
  }

  // ─── Approval Requests ────────────────────────────────────────────────────────

  static async getApprovalRequests(
    organizationId: string,
    filters?: { status?: string; requestedById?: string }
  ) {
    const where: any = { organizationId };
    if (filters?.status) where.status = filters.status;
    if (filters?.requestedById) where.requestedById = filters.requestedById;
    const requests = await prisma.approvalRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    return Promise.all(requests.map((r) => this.withFlow(r)));
  }

  static async getApprovalRequestById(id: string, organizationId: string) {
    const request = await prisma.approvalRequest.findFirst({
      where: { id, organizationId },
    });
    if (!request) throw new NotFoundError('Approval request not found');
    return this.withFlow(request);
  }

  static async createApprovalRequest(
    organizationId: string,
    requestedById: string,
    data: ApprovalRequestData,
    req?: any
  ) {
    let module = data.module;
    if (!module && data.flowId) {
      const flow = await prisma.approvalFlow.findFirst({
        where: { id: data.flowId, organizationId },
      });
      module = flow?.module;
    }
    const request = await prisma.approvalRequest.create({
      data: {
        flowId: data.flowId,
        module: module ?? 'approval',
        resourceId: data.resourceId ?? `approval-${randomUUID()}`,
        title: data.title!,
        reason: data.reason ?? data.description ?? undefined,
        status: ApprovalStatus.pending,
        currentStep: 0,
        requestedById,
        organizationId,
      },
    });
    await AuditService.created(
      organizationId, requestedById, 'approval_request', request.id,
      data.data ?? { title: data.title }, req
    );
    
    // Notify approvers if flow has defined approvers
    if (data.flowId) {
      const flow = await prisma.approvalFlow.findFirst({
        where: { id: data.flowId, organizationId },
      });
      if (flow && Array.isArray(flow.steps) && flow.steps.length > 0) {
        const step = (flow.steps as any[])[0];
        const approverIds: string[] = [];
        if (step.approverId) approverIds.push(step.approverId);
        if (step.userId) approverIds.push(step.userId);
        if (Array.isArray(step.approvers)) approverIds.push(...step.approvers);
        
        if (approverIds.length > 0) {
          NotificationHelper.createMultiple(
            organizationId,
            [...new Set(approverIds)], // Remove duplicates
            {
              title: 'Approval Needed',
              body: data.title!,
              type: 'approval',
              relatedModel: 'ApprovalRequest',
              relatedId: request.id,
            }
          ).catch(() => {});
        }
      }
    }
    
    return this.getApprovalRequestById(request.id, organizationId);
  }

  static async decideApprovalRequest(
    id: string,
    organizationId: string,
    actorId: string,
    data: DecideData,
    req?: any
  ) {
    const request = await prisma.approvalRequest.findFirst({
      where: { id, organizationId },
    });
    if (!request) throw new NotFoundError('Approval request not found');
    if (request.status !== ApprovalStatus.pending) {
      throw new BadRequestError('Approval request is not pending');
    }
    if (!(await this.isDecider(request, actorId))) {
      throw new ForbiddenError('Only the requester or an assigned approver can decide');
    }

    const updated = await prisma.approvalRequest.update({
      where: { id },
      data: {
        status: data.decision as ApprovalStatus,
        approvedById: actorId,
        approvedAt: new Date(),
      },
    });
    await AuditService.updated(
      organizationId, actorId, 'approval_request', id,
      { decision: data.decision, comment: data.comment }, req
    );
    
    // Notify requester of decision
    const approver = await prisma.user.findFirst({
      where: { id: actorId, organizationId },
      select: { name: true },
    });
    const decisionText = data.decision === ApprovalStatus.approved ? 'Approved' : 'Rejected';
    NotificationHelper.create({
      organizationId,
      userId: request.requestedById,
      title: `Approval ${decisionText}`,
      body: `${approver?.name || 'Approver'} ${decisionText.toLowerCase()} your request`,
      type: 'approval',
      relatedModel: 'ApprovalRequest',
      relatedId: updated.id,
    }).catch(() => {});
    
    return this.withFlow(updated);
  }
}
