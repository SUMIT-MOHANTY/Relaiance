/**
 * Notification Service
 * Handles notification persistence and retrieval
 */

import prisma from '../lib/prisma';
import { NotificationType, NotificationStatus, Prisma } from '@prisma/client';

export interface CreateNotificationInput {
  userId: number;
  type: NotificationType;
  title: string;
  message: string;
  entityType?: string;
  entityId?: number;
  metadata?: Prisma.JsonValue;
}

export interface ListNotificationsFilters {
  userId: number;
  status?: NotificationStatus;
  type?: NotificationType;
  page?: number;
  limit?: number;
}

export class NotificationService {
  /**
   * Create a new notification
   */
  async createNotification(input: CreateNotificationInput) {
    return prisma.notification.create({
      data: {
        userId: input.userId,
        type: input.type,
        title: input.title,
        message: input.message,
        entityType: input.entityType,
        entityId: input.entityId,
        metadata: input.metadata,
        status: NotificationStatus.UNREAD,
      },
    });
  }

  /**
   * List notifications for a user with filters
   */
  async listNotifications(filters: ListNotificationsFilters) {
    const { userId, status, type, page = 1, limit = 20 } = filters;

    const where: Prisma.NotificationWhereInput = { userId };
    if (status) where.status = status;
    if (type) where.type = type;

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.notification.count({ where }),
    ]);

    return {
      data: notifications,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get unread notifications count for a user
   */
  async getUnreadCount(userId: number) {
    return prisma.notification.count({
      where: {
        userId,
        status: NotificationStatus.UNREAD,
      },
    });
  }

  /**
   * Mark notification as read
   */
  async markAsRead(id: number, userId: number) {
    const notification = await prisma.notification.findFirst({
      where: { id, userId },
    });

    if (!notification) {
      throw new Error('Notification not found');
    }

    return prisma.notification.update({
      where: { id },
      data: { status: NotificationStatus.READ },
    });
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: number) {
    return prisma.notification.updateMany({
      where: {
        userId,
        status: NotificationStatus.UNREAD,
      },
      data: { status: NotificationStatus.READ },
    });
  }

  /**
   * Delete old notifications (cleanup)
   */
  async deleteOldNotifications(days: number = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return prisma.notification.deleteMany({
      where: {
        createdAt: { lt: cutoffDate },
        status: NotificationStatus.READ,
      },
    });
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
