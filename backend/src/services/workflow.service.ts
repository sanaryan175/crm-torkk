import prisma from '../config/db';
import { NotFoundError } from '../utils/errors';
import { AuditService } from './audit.service';

interface ScheduledJobData {
  name?: string;
  type?: string;
  cron?: string | null;
  payload?: any;
  isActive?: boolean;
  lastRunAt?: Date | null;
  nextRunAt?: Date | null;
}

interface BusinessRuleData {
  name?: string;
  entity?: string;
  condition?: any;
  action?: any;
  isActive?: boolean;
}

export class WorkflowService {
  // ─── Scheduled Jobs ──────────────────────────────────────────────────────────

  static async getScheduledJobs(organizationId: string) {
    return prisma.scheduledJob.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getScheduledJobById(id: string, organizationId: string) {
    const job = await prisma.scheduledJob.findFirst({ where: { id, organizationId } });
    if (!job) throw new NotFoundError('Scheduled job not found');
    return job;
  }

  static async createScheduledJob(
    organizationId: string,
    createdById: string,
    data: ScheduledJobData,
    req?: any
  ) {
    const job = await prisma.scheduledJob.create({
      data: {
        name: data.name!,
        type: data.type!,
        cron: data.cron,
        payload: data.payload,
        isActive: data.isActive,
        lastRunAt: data.lastRunAt,
        nextRunAt: data.nextRunAt,
        organizationId,
        createdById,
      },
    });
    await AuditService.created(organizationId, createdById, 'scheduled_job', job.id, undefined, req);
    return job;
  }

  static async updateScheduledJob(
    id: string,
    organizationId: string,
    actorId: string,
    data: ScheduledJobData,
    req?: any
  ) {
    await this.getScheduledJobById(id, organizationId);
    const updated = await prisma.scheduledJob.update({ where: { id }, data });
    await AuditService.updated(organizationId, actorId, 'scheduled_job', id, data, req);
    return updated;
  }

  static async deleteScheduledJob(id: string, organizationId: string, actorId: string, req?: any) {
    await this.getScheduledJobById(id, organizationId);
    await prisma.scheduledJob.delete({ where: { id } });
    await AuditService.deleted(organizationId, actorId, 'scheduled_job', id, undefined, req);
    return { success: true };
  }

  // ─── Business Rules ──────────────────────────────────────────────────────────

  static async getBusinessRules(organizationId: string) {
    return prisma.businessRule.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getBusinessRuleById(id: string, organizationId: string) {
    const rule = await prisma.businessRule.findFirst({ where: { id, organizationId } });
    if (!rule) throw new NotFoundError('Business rule not found');
    return rule;
  }

  static async createBusinessRule(
    organizationId: string,
    createdById: string,
    data: BusinessRuleData,
    req?: any
  ) {
    const rule = await prisma.businessRule.create({
      data: {
        name: data.name!,
        entity: data.entity!,
        condition: data.condition ?? {},
        action: data.action ?? {},
        isActive: data.isActive,
        organizationId,
        createdById,
      },
    });
    await AuditService.created(organizationId, createdById, 'business_rule', rule.id, undefined, req);
    return rule;
  }

  static async updateBusinessRule(
    id: string,
    organizationId: string,
    actorId: string,
    data: BusinessRuleData,
    req?: any
  ) {
    await this.getBusinessRuleById(id, organizationId);
    const updated = await prisma.businessRule.update({ where: { id }, data });
    await AuditService.updated(organizationId, actorId, 'business_rule', id, data, req);
    return updated;
  }

  static async deleteBusinessRule(id: string, organizationId: string, actorId: string, req?: any) {
    await this.getBusinessRuleById(id, organizationId);
    await prisma.businessRule.delete({ where: { id } });
    await AuditService.deleted(organizationId, actorId, 'business_rule', id, undefined, req);
    return { success: true };
  }
}
