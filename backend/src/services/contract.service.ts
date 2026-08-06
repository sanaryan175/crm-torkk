import prisma from '../config/db';
import { NotFoundError } from '../utils/errors';
import { ContractStatus } from '@prisma/client';
import { AuditService } from './audit.service';

export class ContractService {
  static async getContracts(
    organizationId: string,
    filters?: { status?: string; contactId?: string }
  ) {
    const where: any = { organizationId };
    if (filters?.status) where.status = filters.status;
    if (filters?.contactId) where.contactId = filters.contactId;
    return prisma.contract.findMany({ where, orderBy: { createdAt: 'desc' } });
  }

  static async getContractById(id: string, organizationId: string) {
    const contract = await prisma.contract.findFirst({
      where: { id, organizationId },
    });
    if (!contract) throw new NotFoundError('Contract not found');
    return contract;
  }

  static async createContract(
    organizationId: string,
    createdById: string,
    data: any,
    req?: any
  ) {
    const contract = await prisma.$transaction(async (tx) => {
      const count = await tx.contract.count({ where: { organizationId } });
      const contractNumber = data.contractNumber ?? `CT-${String(count + 1).padStart(4, '0')}`;
      return tx.contract.create({
        data: {
          title: data.title,
          contractNumber,
          type: data.type,
          status: data.status,
          contactId: data.contactId,
          companyId: data.companyId,
          dealId: data.dealId,
          startDate: data.startDate,
          endDate: data.endDate,
          renewalDate: data.renewalDate,
          value: data.value ?? 0,
          terms: data.terms,
          fileId: data.fileId,
          organizationId,
          createdById,
        },
      });
    });

    await AuditService.created(organizationId, createdById, 'contract', contract.id, undefined, req);
    return contract;
  }

  static async updateContract(
    id: string,
    organizationId: string,
    actorId: string,
    data: any,
    req?: any
  ) {
    await this.getContractById(id, organizationId);

    const updateData: any = {};
    const scalarFields = ['title', 'contractNumber', 'type', 'status', 'terms'] as const;
    for (const field of scalarFields) {
      if (data[field] !== undefined) updateData[field] = data[field];
    }
    const nullableFields = ['contactId', 'companyId', 'dealId', 'fileId'] as const;
    for (const field of nullableFields) {
      if (data[field] !== undefined) updateData[field] = data[field] === '' ? null : data[field];
    }
    const dateFields = ['startDate', 'endDate', 'renewalDate'] as const;
    for (const field of dateFields) {
      if (data[field] !== undefined) {
        updateData[field] = data[field] === '' ? null : data[field];
      }
    }
    if (data.value !== undefined) updateData.value = data.value;

    const updated = await prisma.contract.update({ where: { id }, data: updateData });
    await AuditService.updated(organizationId, actorId, 'contract', id, data, req);
    return updated;
  }

  static async signContract(
    id: string,
    organizationId: string,
    actorId: string,
    data: any,
    req?: any
  ) {
    await this.getContractById(id, organizationId);
    const updated = await prisma.contract.update({
      where: { id },
      data: {
        status: ContractStatus.active,
        signedAt: new Date(),
        signedByName: data.signedByName ?? null,
      },
    });
    await AuditService.updated(
      organizationId, actorId, 'contract', id,
      { status: ContractStatus.active, signedByName: updated.signedByName }, req
    );
    return updated;
  }

  static async deleteContract(id: string, organizationId: string, actorId: string, req?: any) {
    await this.getContractById(id, organizationId);
    await prisma.contract.delete({ where: { id } });
    await AuditService.deleted(organizationId, actorId, 'contract', id, undefined, req);
    return { success: true };
  }
}
