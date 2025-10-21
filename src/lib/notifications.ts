import { prisma } from '@/lib/db';

export type NotificationType = 'forum_reply' | 'support_update' | 'promo_expiring' | 'bot_update';

interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  metadata?: any;
}

/**
 * Create a new notification for a user
 */
export async function createNotification({
  userId,
  type,
  title,
  message,
  link,
  metadata,
}: CreateNotificationParams) {
  try {
    return await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        link,
        metadata,
      },
    });
  } catch (error) {
    console.error('[NOTIFICATION_CREATE_ERROR]', error);
    throw error;
  }
}

/**
 * Notify a user when someone replies to their forum post
 */
export async function notifyForumReply({
  postAuthorId,
  replyAuthorId,
  postTitle,
  postId,
  categorySlug,
  replyId,
}: {
  postAuthorId: string;
  replyAuthorId: string;
  postTitle: string;
  postId: string;
  categorySlug: string;
  replyId: string;
}) {
  // Don't notify if replying to own post
  if (postAuthorId === replyAuthorId) {
    return null;
  }

  return await createNotification({
    userId: postAuthorId,
    type: 'forum_reply',
    title: 'New Reply on Your Post',
    message: `Someone replied to "${postTitle}"`,
    link: `/community/${categorySlug}/${postId}`,
    metadata: { postId, replyId, categorySlug },
  });
}

/**
 * Notify a user about a support ticket update
 */
export async function notifySupportUpdate({
  userId,
  ticketId,
  ticketTitle,
}: {
  userId: string;
  ticketId: string;
  ticketTitle: string;
}) {
  return await createNotification({
    userId,
    type: 'support_update',
    title: 'Support Ticket Update',
    message: `Your ticket "${ticketTitle}" has been updated`,
    link: `/support/${ticketId}`,
    metadata: { ticketId },
  });
}

/**
 * Notify a user about an expiring promo code
 */
export async function notifyPromoExpiring({
  userId,
  promoCode,
  daysRemaining,
}: {
  userId: string;
  promoCode: string;
  daysRemaining: number;
}) {
  return await createNotification({
    userId,
    type: 'promo_expiring',
    title: 'Promo Code Expiring Soon',
    message: `Your ${promoCode} benefits expire in ${daysRemaining} days`,
    link: '/subscription',
    metadata: { promoCode, daysRemaining },
  });
}

/**
 * Notify users about a bot update
 */
export async function notifyBotUpdate({
  userIds,
  botName,
  updateMessage,
  botSlug,
}: {
  userIds: string[];
  botName: string;
  updateMessage: string;
  botSlug: string;
}) {
  const notifications = userIds.map(userId =>
    prisma.notification.create({
      data: {
        userId,
        type: 'bot_update',
        title: `${botName} Updated`,
        message: updateMessage,
        link: `/bots/${botSlug}`,
        metadata: { botSlug },
      },
    })
  );

  return await Promise.all(notifications);
}

