import prisma from '../config/db';
import { AuditAction } from '@prisma/client';

/**
 * Central audit logging helper. All module mutation flows write audit rows
 * through here so the audit log is complete and consistent.
 */
export class AuditService {
  static async log(params: {
    organizationId: string;
    userId: string;
    action: AuditAction | 'create' | 'update' | 'delete' | 'login' | 'logout' | 'invite_sent' | 'invite_accepted' | 'invite_revoked' | 'permission_changed' | 'role_changed';
    resource: string;
    resourceId?: string | null;
    metadata?: Record<string, any> | null;
    ipAddress?: string | null;
    userAgent?: string | null;
  }) {
    try {
      await prisma.auditLog.create({
        data: {
          organizationId: params.organizationId,
          userId: params.userId,
          action: params.action as AuditAction,
          resource: params.resource,
          resourceId: params.resourceId,
          metadata: params.metadata ? JSON.parse(JSON.stringify(params.metadata)) : undefined,
          ipAddress: params.ipAddress,
          userAgent: params.userAgent,
        },
      });
    } catch {
      // audit failures must never break the primary operation
    }
  }

  /** Convenience for create operations */
  static async created(
    organizationId: string,
    userId: string,
    resource: string,
    resourceId?: string,
    metadata?: Record<string, any>,
    req?: { ip?: string; headers?: Record<string, any> }
  ) {
    await this.log({
      organizationId,
      userId,
      action: 'create',
      resource,
      resourceId,
      metadata,
      ipAddress: req?.ip,
      userAgent: req?.headers?.['user-agent'] as string,
    });
  }

  static async updated(
    organizationId: string,
    userId: string,
    resource: string,
    resourceId: string,
    metadata?: Record<string, any>,
    req?: { ip?: string; headers?: Record<string, any> }
  ) {
    await this.log({
      organizationId,
      userId,
      action: 'update',
      resource,
      resourceId,
      metadata,
      ipAddress: req?.ip,
      userAgent: req?.headers?.['user-agent'] as string,
    });
  }

  static async deleted(
    organizationId: string,
    userId: string,
    resource: string,
    resourceId: string,
    metadata?: Record<string, any>,
    req?: { ip?: string; headers?: Record<string, any> }
  ) {
    await this.log({
      organizationId,
      userId,
      action: 'delete',
      resource,
      resourceId,
      metadata,
      ipAddress: req?.ip,
      userAgent: req?.headers?.['user-agent'] as string,
    });
  }
}
