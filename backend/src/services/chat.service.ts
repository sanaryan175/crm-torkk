import prisma from '../config/db';
import { NotFoundError } from '../utils/errors';
import { AuditService } from './audit.service';
import { NotificationHelper } from '../utils/notification.helper';

const USER_SELECT = { id: true, name: true, email: true, avatar: true } as const;

const MESSAGE_INCLUDE = {
  sender: { select: USER_SELECT },
  receiver: { select: USER_SELECT },
} as const;

interface SendMessageData {
  receiverId: string;
  content?: string;
  message?: string;
}

export class ChatService {
  static async getMessages(organizationId: string, userA: string, userB: string) {
    return prisma.chatMessage.findMany({
      where: {
        organizationId,
        OR: [
          { senderId: userA, receiverId: userB },
          { senderId: userB, receiverId: userA },
        ],
      },
      include: MESSAGE_INCLUDE,
      orderBy: { createdAt: 'asc' },
    });
  }

  static async getConversations(organizationId: string, userId: string) {
    const messages = await prisma.chatMessage.findMany({
      where: {
        organizationId,
        OR: [{ senderId: userId }, { receiverId: userId }],
      },
      orderBy: { createdAt: 'desc' },
      select: { id: true, senderId: true, receiverId: true, content: true, createdAt: true },
    });

    const conversationMap = new Map<string, any>();
    for (const msg of messages) {
      const otherUserId = msg.senderId === userId ? msg.receiverId : msg.senderId;
      if (!otherUserId) continue;
      if (!conversationMap.has(otherUserId)) {
        conversationMap.set(otherUserId, { userId: otherUserId, lastMessage: msg });
      }
    }

    const otherUserIds = Array.from(conversationMap.keys());
    const users = otherUserIds.length
      ? await prisma.user.findMany({
          where: { id: { in: otherUserIds }, organizationId },
          select: USER_SELECT,
        })
      : [];
    const userMap = new Map(users.map((u) => [u.id, u]));

    return Array.from(conversationMap.values()).map((c) => ({
      user: userMap.get(c.userId) ?? null,
      lastMessage: c.lastMessage,
    }));
  }

  static async sendMessage(
    organizationId: string,
    senderId: string,
    data: SendMessageData,
    req?: any
  ) {
    const receiver = await prisma.user.findFirst({
      where: { id: data.receiverId, organizationId, isActive: true },
    });
    if (!receiver) throw new NotFoundError('Receiver not found in this organization');

    const message = await prisma.chatMessage.create({
      data: {
        organizationId,
        senderId,
        receiverId: data.receiverId,
        content: data.content ?? data.message ?? '',
      },
      include: MESSAGE_INCLUDE,
    });
    await AuditService.created(organizationId, senderId, 'chat_message', message.id, undefined, req);
    
    // Notify receiver of message
    const sender = await prisma.user.findFirst({
      where: { id: senderId, organizationId },
      select: { name: true },
    });
    NotificationHelper.create({
      organizationId,
      userId: data.receiverId,
      title: `New message from ${sender?.name || 'Someone'}`,
      body: (data.content ?? data.message ?? '').substring(0, 100),
      type: 'system',
      relatedModel: 'ChatMessage',
      relatedId: message.id,
    }).catch(() => {});
    
    return message;
  }

  static async getMessageById(id: string, organizationId: string) {
    const message = await prisma.chatMessage.findFirst({
      where: { id, organizationId },
      include: MESSAGE_INCLUDE,
    });
    if (!message) throw new NotFoundError('Message not found');
    return message;
  }

  static async deleteMessage(id: string, organizationId: string, actorId: string, req?: any) {
    await this.getMessageById(id, organizationId);
    await prisma.chatMessage.delete({ where: { id } });
    await AuditService.deleted(organizationId, actorId, 'chat_message', id, undefined, req);
    return { success: true };
  }
}
