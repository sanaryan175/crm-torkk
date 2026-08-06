/**
 * NotificationHelper - Utility for creating app notifications
 * Centralizes notification creation logic for consistency
 * Also emits real-time WebSocket events
 */

import prisma from '../config/db';
import { notifyUser } from '../config/websocket';

export interface CreateNotificationParams {
  organizationId: string;
  userId: string;
  title: string;
  body?: string;
  type?: 'activity' | 'deal' | 'announcement' | 'approval' | 'system' | 'info';
  relatedModel?: string;
  relatedId?: string;
}

export class NotificationHelper {
  /**
   * Create an app notification for a user
   * Usage: NotificationHelper.create({...})
   * Also emits WebSocket event for real-time delivery
   */
  static async create(params: CreateNotificationParams) {
    try {
      const notification = await prisma.appNotification.create({
        data: {
          organizationId: params.organizationId,
          userId: params.userId,
          title: params.title,
          body: params.body || '',
          type: params.type || 'info',
          relatedModel: params.relatedModel,
          relatedId: params.relatedId,
        },
        include: {
          organization: { select: { id: true, name: true } },
        },
      });

      console.log(`✅ [Notification] Created for user ${params.userId}: "${params.title}"`);

      // Emit WebSocket event for real-time delivery
      try {
        notifyUser(params.userId, 'notification:new', {
          id: notification.id,
          title: notification.title,
          body: notification.body,
          type: notification.type,
          relatedModel: notification.relatedModel,
          relatedId: notification.relatedId,
          createdAt: notification.createdAt,
        });
      } catch (wsError) {
        console.warn(`⚠️ [WebSocket] Failed to emit notification:`, wsError);
        // Don't fail if WebSocket fails - notification is still in database
      }

      return notification;
    } catch (error) {
      console.error(`❌ [Notification] Failed to create:`, error);
      throw error;
    }
  }

  /**
   * Create notifications for multiple users
   * Useful for team announcements, workflow notifications, etc.
   * Batch creates and emits WebSocket events
   */
  static async createMultiple(
    organizationId: string,
    userIds: string[],
    notificationData: Omit<CreateNotificationParams, 'organizationId' | 'userId'>
  ) {
    try {
      const notifications = await Promise.all(
        userIds.map(userId =>
          this.create({
            organizationId,
            userId,
            ...notificationData,
          })
        )
      );

      console.log(`✅ [Notification] Created for ${userIds.length} users`);
      return notifications;
    } catch (error) {
      console.error(`❌ [Notification] Batch creation failed:`, error);
      throw error;
    }
  }

  /**
   * Notify activity assignee when assigned
   */
  static async notifyActivityAssigned(
    organizationId: string,
    assignedToId: string,
    activityId: string,
    activityTitle: string,
    activityType: string
  ) {
    return this.create({
      organizationId,
      userId: assignedToId,
      title: `New ${activityType} Activity Assigned`,
      body: activityTitle,
      type: 'activity',
      relatedModel: 'Activity',
      relatedId: activityId,
    });
  }

  /**
   * Notify deal assignee when assigned
   */
  static async notifyDealAssigned(
    organizationId: string,
    assignedToId: string,
    dealId: string,
    dealName: string,
    dealValue?: number
  ) {
    const body = dealValue ? `${dealName} • ${dealValue.toLocaleString()}` : dealName;
    return this.create({
      organizationId,
      userId: assignedToId,
      title: 'New Deal Assigned',
      body,
      type: 'deal',
      relatedModel: 'Deal',
      relatedId: dealId,
    });
  }

  /**
   * Notify about deal stage change
   */
  static async notifyDealStageChanged(
    organizationId: string,
    assignedToId: string,
    dealId: string,
    dealName: string,
    oldStage: string,
    newStage: string
  ) {
    return this.create({
      organizationId,
      userId: assignedToId,
      title: 'Deal Status Updated',
      body: `${dealName} moved from ${oldStage} to ${newStage}`,
      type: 'deal',
      relatedModel: 'Deal',
      relatedId: dealId,
    });
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(notificationId: string) {
    return prisma.appNotification.update({
      where: { id: notificationId },
      data: { readAt: new Date() },
    });
  }

  /**
   * Delete notification
   */
  static async delete(notificationId: string) {
    return prisma.appNotification.delete({
      where: { id: notificationId },
    });
  }

  /**
   * Get unread count for user
   */
  static async getUnreadCount(organizationId: string, userId: string) {
    return prisma.appNotification.count({
      where: {
        organizationId,
        userId,
        readAt: null,
      },
    });
  }

  /**
   * Get unread notifications for user
   */
  static async getUnread(organizationId: string, userId: string, limit = 10) {
    return prisma.appNotification.findMany({
      where: {
        organizationId,
        userId,
        readAt: null,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}
