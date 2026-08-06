import crypto from 'crypto';
import prisma from '../config/db';
import { NotFoundError } from '../utils/errors';
import { AuditService } from './audit.service';

const API_KEY_PREFIX = 'torkk_';

export class ApiKeyService {
  static async listApiKeys(organizationId: string) {
    return prisma.apiKey.findMany({
      where: { organizationId },
      select: {
        id: true,
        name: true,
        keyPrefix: true,
        scopes: true,
        lastUsedAt: true,
        expiresAt: true,
        status: true,
        createdById: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async createApiKey(
    organizationId: string,
    createdById: string,
    data: { name: string; scopes?: string[]; expiresAt?: string },
    req?: any
  ) {
    const rawKey = `${API_KEY_PREFIX}${crypto.randomUUID()}`;
    const apiKey = await prisma.apiKey.create({
      data: {
        organizationId,
        name: data.name,
        keyPrefix: rawKey.slice(0, 12),
        keyHash: crypto.createHash('sha256').update(rawKey).digest('hex'),
        scopes: data.scopes ?? undefined,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
        createdById,
      },
    });
    await AuditService.created(organizationId, createdById, 'api_key', apiKey.id, { name: apiKey.name }, req);
    return { ...apiKey, rawKey };
  }

  static async revokeApiKey(id: string, organizationId: string, actorId: string, req?: any) {
    const existing = await prisma.apiKey.findFirst({ where: { id, organizationId } });
    if (!existing) throw new NotFoundError('API key not found');
    const updated = await prisma.apiKey.update({
      where: { id },
      data: { status: 'revoked' },
    });
    await AuditService.deleted(organizationId, actorId, 'api_key', id, undefined, req);
    return updated;
  }
}

export class TwoFactorSettingService {
  static async getSetting(organizationId: string, userId: string) {
    return prisma.twoFactorSetting.findUnique({
      where: { organizationId_userId: { organizationId, userId } },
      select: {
        id: true,
        organizationId: true,
        userId: true,
        enabled: true,
        verifiedAt: true,
        backupCodes: true,
        createdAt: true,
      },
    });
  }

  static async updateSetting(
    organizationId: string,
    userId: string,
    data: { enabled: boolean },
    req?: any
  ) {
    const existing = await prisma.twoFactorSetting.findUnique({
      where: { organizationId_userId: { organizationId, userId } },
    });
    const setting = await prisma.twoFactorSetting.upsert({
      where: { organizationId_userId: { organizationId, userId } },
      update: {
        enabled: data.enabled,
        verifiedAt: data.enabled ? undefined : null,
        secret: data.enabled && !existing?.secret
          ? crypto.randomBytes(20).toString('hex')
          : undefined,
      },
      create: {
        organizationId,
        userId,
        enabled: data.enabled,
        secret: data.enabled ? crypto.randomBytes(20).toString('hex') : null,
      },
    });
    await AuditService.updated(organizationId, userId, 'two_factor_setting', setting.id, { enabled: data.enabled }, req);
    return this.getSetting(organizationId, userId);
  }

  static async verifySetting(
    organizationId: string,
    userId: string,
    _data: { code: string },
    req?: any
  ) {
    const setting = await prisma.twoFactorSetting.findUnique({
      where: { organizationId_userId: { organizationId, userId } },
    });
    if (setting) {
      await AuditService.updated(organizationId, userId, 'two_factor_setting', setting.id, { action: 'verify' }, req);
    }
    return { success: true };
  }
}

export class LoginHistoryService {
  static async getLoginHistory(organizationId: string, userId?: string) {
    return prisma.loginHistory.findMany({
      where: userId ? { organizationId, userId } : { organizationId },
      include: {
        user: { select: { id: true, name: true, email: true, avatar: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
