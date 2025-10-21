'use client';

import { MessageSquare, AlertCircle, Tag, Bot, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

interface NotificationItemProps {
  notification: {
    id: string;
    type: string;
    title: string;
    message: string;
    link?: string | null;
    isRead: boolean;
    createdAt: Date;
  };
  onMarkRead: (id: string) => void;
  onDelete: (id: string) => void;
}

const iconMap = {
  forum_reply: MessageSquare,
  support_update: AlertCircle,
  promo_expiring: Tag,
  bot_update: Bot,
};

const colorMap = {
  forum_reply: 'text-cyan-400',
  support_update: 'text-yellow-400',
  promo_expiring: 'text-purple-400',
  bot_update: 'text-green-400',
};

export function NotificationItem({ notification, onMarkRead, onDelete }: NotificationItemProps) {
  const Icon = iconMap[notification.type as keyof typeof iconMap] || AlertCircle;
  const iconColor = colorMap[notification.type as keyof typeof colorMap] || 'text-gray-400';

  const handleClick = () => {
    if (!notification.isRead) {
      onMarkRead(notification.id);
    }
  };

  const content = (
    <div
      className={`relative group p-4 border-b border-gray-800/50 hover:bg-gray-800/30 transition-all cursor-pointer ${
        !notification.isRead ? 'bg-cyan-900/10' : ''
      }`}
      onClick={handleClick}
    >
      {/* Unread indicator dot */}
      {!notification.isRead && (
        <div className="absolute left-2 top-1/2 -translate-y-1/2 w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
      )}

      <div className="flex gap-3 pl-3">
        {/* Icon */}
        <div className={`flex-shrink-0 ${iconColor}`}>
          <Icon className="w-5 h-5" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <p className={`text-sm font-medium ${!notification.isRead ? 'text-white' : 'text-gray-300'}`}>
                {notification.title}
              </p>
              <p className="text-sm text-gray-400 mt-0.5 line-clamp-2">
                {notification.message}
              </p>
            </div>

            {/* Delete button */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onDelete(notification.id);
              }}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-500/20 rounded text-red-400 hover:text-red-300"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Time */}
          <p className="text-xs text-gray-500 mt-1">
            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
          </p>
        </div>
      </div>
    </div>
  );

  // Wrap in Link if there's a link
  if (notification.link) {
    return <Link href={notification.link}>{content}</Link>;
  }

  return content;
}

