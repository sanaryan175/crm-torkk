import prisma from '../config/db';
import { NotFoundError, BadRequestError } from '../utils/errors';
import { AuditService } from './audit.service';

const CAMPAIGN_INCLUDE = {
  _count: { select: { recipients: true } },
};

interface CampaignRecipientInput {
  contactId?: string;
  email?: string;
  phone?: string;
}

interface CampaignData {
  name?: string;
  type?: any;
  status?: any;
  subject?: string | null;
  content?: string;
  audience?: any;
  scheduledAt?: Date | null;
}

export class CampaignService {
  static async getCampaigns(organizationId: string) {
    return prisma.campaign.findMany({
      where: { organizationId },
      include: CAMPAIGN_INCLUDE,
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getCampaignById(id: string, organizationId: string) {
    const campaign = await prisma.campaign.findFirst({
      where: { id, organizationId },
      include: CAMPAIGN_INCLUDE,
    });
    if (!campaign) throw new NotFoundError('Campaign not found');
    return campaign;
  }

  static async createCampaign(
    organizationId: string,
    createdById: string,
    data: CampaignData,
    req?: any
  ) {
    const campaign = await prisma.campaign.create({
      data: {
        name: data.name!,
        type: data.type!,
        status: data.status,
        subject: data.subject,
        content: data.content!,
        audience: data.audience,
        scheduledAt: data.scheduledAt,
        organizationId,
        createdById,
      },
      include: CAMPAIGN_INCLUDE,
    });
    await AuditService.created(organizationId, createdById, 'campaign', campaign.id, undefined, req);
    return campaign;
  }

  static async updateCampaign(
    id: string,
    organizationId: string,
    actorId: string,
    data: CampaignData,
    req?: any
  ) {
    await this.getCampaignById(id, organizationId);
    const updated = await prisma.campaign.update({
      where: { id },
      data,
      include: CAMPAIGN_INCLUDE,
    });
    await AuditService.updated(organizationId, actorId, 'campaign', id, data, req);
    return updated;
  }

  static async deleteCampaign(id: string, organizationId: string, actorId: string, req?: any) {
    await this.getCampaignById(id, organizationId);
    await prisma.campaign.delete({ where: { id } });
    await AuditService.deleted(organizationId, actorId, 'campaign', id, undefined, req);
    return { success: true };
  }

  static async sendCampaign(
    id: string,
    organizationId: string,
    actorId: string,
    recipients: CampaignRecipientInput[],
    req?: any
  ) {
    const campaign = await this.getCampaignById(id, organizationId);

    const rows: any[] = [];
    for (const recipient of recipients) {
      let email = recipient.email;
      let phone = recipient.phone;
      if (recipient.contactId) {
        const contact = await prisma.contact.findFirst({
          where: { id: recipient.contactId, organizationId },
          select: { email: true, phone: true },
        });
        if (contact) {
          email = email ?? contact.email ?? undefined;
          phone = phone ?? contact.phone ?? undefined;
        }
      }
      if (!email && !phone) {
        throw new BadRequestError('Each recipient needs an email, phone, or contactId');
      }
      rows.push({
        organizationId,
        campaignId: id,
        contactId: recipient.contactId ?? null,
        email,
        phone,
        status: 'sent',
      });
    }

    await prisma.campaignRecipient.createMany({ data: rows });
    const updated = await prisma.campaign.update({
      where: { id },
      data: {
        status: 'sent',
        sentAt: new Date(),
        sentCount: campaign.sentCount + rows.length,
      },
      include: CAMPAIGN_INCLUDE,
    });

    await AuditService.updated(
      organizationId, actorId, 'campaign', id,
      { action: 'send', channel: campaign.type, recipientCount: rows.length }, req
    );

    return updated;
  }
}
