/**
 * Notification Adapter
 * Handles notification persistence and delivery
 */

import prisma from '../lib/prisma';
import { NotificationType } from '@prisma/client';

export interface NotificationPayload {
  recipientId: number;
  title: string;
  message: string;
  type: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS';
  entityType?: string;
  entityId?: number;
}

/**
 * Send a notification to a user
 * Logs to console and persists to database
 */
export async function sendNotification(payload: NotificationPayload): Promise<void> {
  const { recipientId, title, message, type, entityType, entityId } = payload;

  // Log to console
  console.log(`[NOTIFICATION] ${type}: ${title}`);
  console.log(`  Recipient: ${recipientId}`);
  console.log(`  Message: ${message}`);
  if (entityType && entityId) {
    console.log(`  Entity: ${entityType}:${entityId}`);
  }

  // Persist to database
  try {
    await prisma.notification.create({
      data: {
        recipientId,
        title,
        message,
        type: type as NotificationType,
        entityType,
        entityId,
      },
    });
    console.log('  Status: Saved to database');
  } catch (error) {
    console.error('  Status: Failed to save to database', error);
    throw error;
  }
}

/**
 * Send bulk notifications to multiple recipients
 */
export async function sendBulkNotifications(
  recipientIds: number[],
  payload: Omit<NotificationPayload, 'recipientId'>
): Promise<void> {
  const notifications = recipientIds.map(recipientId => ({
    recipientId,
    ...payload,
  }));

  console.log(`[BULK NOTIFICATION] Sending to ${recipientIds.length} recipients`);
  console.log(`  Title: ${payload.title}`);
  console.log(`  Type: ${payload.type}`);

  try {
    await prisma.notification.createMany({
      data: notifications.map(n => ({
        recipientId: n.recipientId,
        title: n.title,
        message: n.message,
        type: n.type as NotificationType,
        entityType: n.entityType,
        entityId: n.entityId,
      })),
    });
    console.log('  Status: All notifications saved to database');
  } catch (error) {
    console.error('  Status: Failed to save bulk notifications', error);
    throw error;
  }
}

/**
 * Mark a notification as read
 */
export async function markNotificationAsRead(notificationId: number): Promise<void> {
  await prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: true },
  });
}

/**
 * Get unread notifications for a user
 */
export async function getUnreadNotifications(userId: number) {
  return prisma.notification.findMany({
    where: {
      recipientId: userId,
      isRead: false,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}
