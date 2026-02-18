import { Link } from 'react-router-dom';
import { Heart, MessageCircle, UserPlus, Repeat2, AtSign, Bell, CheckCheck } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useNotifications, useMarkAllRead, useMarkRead } from './useNotifications';
import { formatDate } from '@/lib/utils';
import type { Notification } from '@/types/post';

const ICONS: Record<Notification['type'], typeof Heart> = {
  like: Heart,
  reply: MessageCircle,
  follow: UserPlus,
  repost: Repeat2,
  mention: AtSign,
  system: Bell,
};

const COLORS: Record<Notification['type'], string> = {
  like: 'text-red-500',
  reply: 'text-primary',
  follow: 'text-blue-500',
  repost: 'text-green-500',
  mention: 'text-purple-500',
  system: 'text-muted-foreground',
};

function getMessage(n: Notification): string {
  switch (n.type) {
    case 'like':
      return 'liked your post';
    case 'reply':
      return 'replied to your post';
    case 'follow':
      return 'started following you';
    case 'repost':
      return 'reposted your post';
    case 'mention':
      return 'mentioned you';
    case 'system':
      return 'sent you a notification';
    default:
      return '';
  }
}

function getLink(n: Notification): string {
  if (n.type === 'follow') return `/user/${n.sender.username}`;
  if (n.post) return `/post/${n.post._id}`;
  return '#';
}

export function NotificationsPage() {
  const { data, isLoading } = useNotifications();
  const markAllRead = useMarkAllRead();
  const markRead = useMarkRead();

  const notifications = data?.notifications ?? [];
  const hasUnread = notifications.some((n) => !n.read);

  return (
    <div className="max-w-[600px] mx-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-bold text-foreground">Notifications</h1>
        {hasUnread && (
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-primary gap-1.5"
            onClick={() => markAllRead.mutate()}
            disabled={markAllRead.isPending}
          >
            <CheckCheck className="w-4 h-4" />
            Mark all read
          </Button>
        )}
      </div>

      {/* List */}
      {isLoading ? (
        <NotifSkeleton />
      ) : notifications.length === 0 ? (
        <div className="py-16 text-center">
          <Bell className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-1">No notifications</h3>
          <p className="text-sm text-muted-foreground">
            When someone interacts with your posts, you'll see it here.
          </p>
        </div>
      ) : (
        <div>
          {notifications.map((n) => {
            const Icon = ICONS[n.type];
            const color = COLORS[n.type];
            return (
              <Link
                key={n._id}
                to={getLink(n)}
                onClick={() => {
                  if (!n.read) markRead.mutate(n._id);
                }}
                className={`flex items-start gap-3 px-4 py-3 border-b border-border hover:bg-muted/30 transition-colors ${
                  !n.read ? 'bg-primary/5' : ''
                }`}
              >
                <div className={`mt-0.5 ${color}`}>
                  <Icon className="w-5 h-5" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <Avatar src={n.sender.avatar} fallback={n.sender.name?.[0] || '?'} size="sm" />
                    <span className="text-sm font-semibold text-foreground truncate">
                      {n.sender.name}
                    </span>
                    <span className="text-xs text-muted-foreground">{formatDate(n.createdAt)}</span>
                    {!n.read && (
                      <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">@{n.sender.username}</span>{' '}
                    {getMessage(n)}
                  </p>
                  {n.post && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                      "{n.post.content}"
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

function NotifSkeleton() {
  return (
    <div>
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-start gap-3 px-4 py-3 border-b border-border">
          <Skeleton className="w-5 h-5 rounded" />
          <div className="flex-1 space-y-1.5">
            <div className="flex gap-2">
              <Skeleton className="w-6 h-6 rounded-full" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-3 w-48" />
          </div>
        </div>
      ))}
    </div>
  );
}
