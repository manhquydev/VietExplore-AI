"use client";

import * as React from "react";
import { Bell, CheckCheck, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useRealtimeNotifications, RealtimeNotification } from "@/hooks/use-realtime-notifications";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { useRouter } from "next/navigation";
import { Header } from "@/components/header";
import { getNotificationIcon, priorityConfig } from "@/lib/notification-config";

interface NotificationItemProps {
  notification: RealtimeNotification;
  onMarkAsRead: (id: string) => void;
  onDelete?: (id: string) => void;
}

function NotificationItem({ notification, onMarkAsRead, onDelete }: NotificationItemProps) {
  const [isDeleting, setIsDeleting] = React.useState(false);
  const router = useRouter();

  const handleClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on action buttons
    if ((e.target as HTMLElement).closest('.notification-action')) {
      return;
    }

    if (!notification.read) {
      onMarkAsRead(notification.id);
    }

    // Navigate to relevant page if actionUrl exists
    const actionUrl = notification.data?.actionUrl || (notification as any).actionUrl;
    if (actionUrl) {
      router.push(actionUrl);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeleting(true);
    await new Promise(resolve => setTimeout(resolve, 300));
    onDelete?.(notification.id);
  };

  const handleMarkAsRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    onMarkAsRead(notification.id);
  };

  // Get professional icon config
  const iconConfig = getNotificationIcon(notification.type);
  const IconComponent = iconConfig.icon;
  const priority = priorityConfig[notification.priority];

  return (
    <div
      className={cn(
        "group relative flex items-start gap-4 p-5 cursor-pointer rounded-xl transition-all duration-200",
        "hover:shadow-md hover:scale-[1.01] motion-soft",
        !notification.read && "bg-white border border-l-4 border-brand-green shadow-sm",
        notification.read && "bg-slate-50/50 border border-transparent hover:bg-slate-50",
        isDeleting && "opacity-0 scale-95 translate-x-full"
      )}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-label={notification.title}
    >
      {/* Professional Icon */}
      <div className={cn(
        "flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200",
        "group-hover:scale-110",
        iconConfig.bgClass
      )}>
        <IconComponent className={cn("w-6 h-6", iconConfig.colorClass)} />
      </div>

      <div className="flex-1 min-w-0 space-y-2">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <p className={cn(
              "text-sm leading-tight flex-1 min-w-0",
              !notification.read ? "font-semibold text-slate-900" : "font-medium text-slate-600"
            )}>
              {notification.title}
            </p>
            {/* Priority dot - subtle indicator */}
            {notification.priority === 'high' && !notification.read && (
              <div className={cn(
                "w-2 h-2 rounded-full flex-shrink-0",
                priority.dotClass,
                "animate-pulse"
              )} />
            )}
          </div>
        </div>

        {/* Message */}
        <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
          {notification.message}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-slate-400 font-medium">
            {formatDistanceToNow(
              new Date(notification.createdAt || notification.timestamp || Date.now()),
              {
                addSuffix: true,
                locale: vi
              }
            )}
          </span>

          {/* Quick Actions - Always visible on mobile, hover on desktop */}
          <div className={cn(
            "flex items-center gap-1 notification-action transition-all duration-200",
            "sm:opacity-0 sm:translate-x-2 sm:pointer-events-none",
            "sm:group-hover:opacity-100 sm:group-hover:translate-x-0 sm:group-hover:pointer-events-auto"
          )}>
            {!notification.read && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-brand-green/10 hover:text-brand-green active:scale-90"
                onClick={handleMarkAsRead}
                title="Đánh dấu đã đọc"
                aria-label="Đánh dấu đã đọc"
              >
                <Eye className="w-4 h-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600 active:scale-90"
              onClick={handleDelete}
              title="Xóa"
              aria-label="Xóa thông báo"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Read status indicator */}
      {notification.read && (
        <div className="absolute top-4 right-4">
          <CheckCheck className="w-4 h-4 text-slate-300" />
        </div>
      )}
    </div>
  );
}

export default function NotificationsPage() {
  const router = useRouter();
  const {
    notifications,
    unreadCount,
    isConnected,
    markAsRead,
    markAllAsRead
  } = useRealtimeNotifications();

  const [filter, setFilter] = React.useState<'all' | 'unread' | 'read'>('all');
  const [localNotifications, setLocalNotifications] = React.useState(notifications);

  React.useEffect(() => {
    setLocalNotifications(notifications);
  }, [notifications]);

  const handleMarkAllAsRead = async () => {
    if (unreadCount > 0) {
      await markAllAsRead();
    }
  };

  const handleDelete = (id: string) => {
    setLocalNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Filter notifications
  const filteredNotifications = React.useMemo(() => {
    switch (filter) {
      case 'unread':
        return localNotifications.filter(n => !n.read);
      case 'read':
        return localNotifications.filter(n => n.read);
      default:
        return localNotifications;
    }
  }, [localNotifications, filter]);

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/50">
        {/* Page Header */}
        <div className="bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-green to-brand-forest flex items-center justify-center shadow-md">
                  <Bell className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-brand-green to-brand-forest bg-clip-text text-transparent">
                    Thông báo
                  </h1>
                  {unreadCount > 0 && (
                    <p className="text-sm text-slate-500">
                      {unreadCount} thông báo chưa đọc
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border",
                  isConnected ? "border-emerald-200" : "border-amber-200"
                )}>
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    isConnected ? "bg-emerald-500" : "bg-amber-500 animate-pulse"
                  )} />
                  <span className="text-xs font-medium text-slate-600">
                    {isConnected ? "Đang hoạt động" : "Đang kết nối..."}
                  </span>
                </div>

                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleMarkAllAsRead}
                    className="text-xs h-8 px-3 rounded-full bg-brand-green/10 hover:bg-brand-green/20 text-brand-green"
                  >
                    <CheckCheck className="w-3.5 h-3.5 mr-1.5" />
                    Đọc tất cả
                  </Button>
                )}
              </div>
            </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-2 mt-4">
            {(['all', 'unread', 'read'] as const).map((tab) => (
              <Button
                key={tab}
                variant={filter === tab ? "default" : "ghost"}
                size="sm"
                onClick={() => setFilter(tab)}
                className={cn(
                  "h-8 px-4 rounded-full text-xs font-medium transition-all",
                  filter === tab
                    ? "bg-gradient-to-r from-brand-green to-brand-forest text-white shadow-md"
                    : "hover:bg-slate-100"
                )}
              >
                {tab === 'all' && `Tất cả (${localNotifications.length})`}
                {tab === 'unread' && `Chưa đọc (${localNotifications.filter(n => !n.read).length})`}
                {tab === 'read' && `Đã đọc (${localNotifications.filter(n => n.read).length})`}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        {filteredNotifications.length > 0 ? (
          <div className="space-y-3">
            {filteredNotifications.map((notification, index) => (
              <div
                key={notification.id}
                className="animate-slide-in-up"
                style={{ animationDelay: `${index * 30}ms` }}
              >
                <NotificationItem
                  notification={notification}
                  onMarkAsRead={markAsRead}
                  onDelete={handleDelete}
                />
              </div>
            ))}
          </div>
        ) : (
          <Card className="bg-white shadow-sm">
            <CardContent className="flex flex-col items-center justify-center py-16 text-slate-400">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center mb-4 shadow-inner">
                <Bell className="w-10 h-10 text-slate-300" />
              </div>
              <p className="text-base font-semibold text-slate-600 mb-1">
                {filter === 'unread' ? 'Không có thông báo chưa đọc' :
                 filter === 'read' ? 'Chưa có thông báo đã đọc' :
                 'Chưa có thông báo'}
              </p>
              <p className="text-sm text-center text-slate-400 max-w-sm">
                {filter === 'all'
                  ? 'Bạn sẽ nhận được thông báo về hoạt động của mình tại đây'
                  : 'Không có thông báo nào phù hợp với bộ lọc này'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
    </>
  );
}
