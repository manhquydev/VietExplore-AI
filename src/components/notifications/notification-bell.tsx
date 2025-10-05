"use client";

import * as React from "react";
import { Bell, CheckCheck, X, Trash2, Eye, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useRealtimeNotifications, RealtimeNotification } from "@/hooks/use-realtime-notifications";
import { useAuth } from "@/components/auth/auth-provider";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { getNotificationIcon, priorityConfig } from "@/lib/notification-config";

interface NotificationItemProps {
  notification: RealtimeNotification;
  onMarkAsRead: (id: string) => void;
  onDelete?: (id: string) => void;
}

function NotificationItem({ notification, onMarkAsRead, onDelete }: NotificationItemProps) {
  const [isHovered, setIsHovered] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on action buttons
    if ((e.target as HTMLElement).closest('.notification-action')) {
      return;
    }

    if (!notification.read) {
      onMarkAsRead(notification.id);
    }

    // Navigate to relevant page if actionUrl exists
    // Check both root level and data.actionUrl for backward compatibility
    const actionUrl = notification.data?.actionUrl || (notification as any).actionUrl;
    if (actionUrl) {
      window.location.href = actionUrl;
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeleting(true);
    await new Promise(resolve => setTimeout(resolve, 300)); // Animation delay
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
        "group relative flex items-start gap-3 p-4 cursor-pointer rounded-xl transition-all duration-200",
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
        "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200",
        "group-hover:scale-110",
        iconConfig.bgClass
      )}>
        <IconComponent className={cn("w-5 h-5", iconConfig.colorClass)} />
      </div>

      <div className="flex-1 min-w-0 space-y-1.5">
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
                "w-1.5 h-1.5 rounded-full flex-shrink-0",
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
            "flex items-center gap-0.5 sm:gap-1 notification-action transition-all duration-200",
            "sm:opacity-0 sm:translate-x-2 sm:pointer-events-none",
            "sm:group-hover:opacity-100 sm:group-hover:translate-x-0 sm:group-hover:pointer-events-auto"
          )}>
            {!notification.read && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 sm:h-7 sm:w-7 p-0 hover:bg-brand-green/10 hover:text-brand-green active:scale-90 touch-target-44"
                onClick={handleMarkAsRead}
                title="Đánh dấu đã đọc"
                aria-label="Đánh dấu đã đọc"
              >
                <Eye className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 sm:h-7 sm:w-7 p-0 hover:bg-red-50 hover:text-red-600 active:scale-90 touch-target-44"
              onClick={handleDelete}
              title="Xóa"
              aria-label="Xóa thông báo"
            >
              <Trash2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Read status indicator */}
      {notification.read && (
        <div className="absolute top-3 right-3">
          <CheckCheck className="w-4 h-4 text-slate-300" />
        </div>
      )}
    </div>
  );
}

export function NotificationBell() {
  const {
    notifications,
    unreadCount,
    isConnected,
    markAsRead,
    markAllAsRead
  } = useRealtimeNotifications();

  const [isOpen, setIsOpen] = React.useState(false);
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

  const recentNotifications = localNotifications.slice(0, 10);
  const hasNotifications = recentNotifications.length > 0;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "relative p-2.5 rounded-full transition-all duration-300",
            "hover:bg-gradient-to-br hover:from-brand-primary-50 hover:to-brand-secondary-50",
            "hover:scale-110 motion-soft",
            unreadCount > 0 && "animate-pulse"
          )}
        >
          <Bell className={cn(
            "h-5 w-5 transition-colors duration-300",
            unreadCount > 0 ? "text-brand-green" : "text-slate-600"
          )} />
          {unreadCount > 0 && (
            <Badge
              className={cn(
                "absolute -top-1 -right-1 h-5 w-5 rounded-full p-0",
                "flex items-center justify-center text-xs font-semibold",
                "bg-gradient-to-br from-red-500 to-rose-600 text-white",
                "shadow-lg shadow-red-500/50 border-2 border-white",
                "animate-bounce"
              )}
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
          {!isConnected && (
            <div className="absolute -bottom-1 -right-1 h-2.5 w-2.5 bg-amber-500 rounded-full animate-pulse ring-2 ring-white" />
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-[95vw] sm:w-[420px] max-w-[420px] p-0 border-0 shadow-2xl overflow-hidden animate-scale-in"
        align="end"
        sideOffset={12}
      >
        {/* Gradient Header Background */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-brand-green/10 via-brand-gold/5 to-transparent" />

        <Card className="border-0 shadow-none bg-white/95 backdrop-blur-md relative">
          {/* Header with glassmorphism effect */}
          <CardHeader className="pb-3 sm:pb-4 pt-4 sm:pt-5 px-3 sm:px-6 relative">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-brand-green to-brand-forest flex items-center justify-center shadow-lg flex-shrink-0">
                  <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div className="min-w-0">
                  <CardTitle className="text-lg sm:text-xl font-bold bg-gradient-to-r from-brand-green to-brand-forest bg-clip-text text-transparent truncate">
                    Thông báo
                  </CardTitle>
                  {unreadCount > 0 && (
                    <CardDescription className="text-xs sm:text-sm font-medium mt-0.5 truncate">
                      {unreadCount} thông báo mới
                    </CardDescription>
                  )}
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-7 w-7 sm:h-8 sm:w-8 p-0 rounded-full hover:bg-slate-100 flex-shrink-0"
                aria-label="Đóng"
              >
                <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </Button>
            </div>

            {/* Action Bar */}
            <div className="flex items-center gap-1.5 sm:gap-2 pt-2 flex-wrap">
              <div className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 rounded-full bg-white/50 border border-slate-200/50">
                <div className={cn(
                  "w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full flex-shrink-0",
                  isConnected ? "bg-emerald-500 shadow-sm shadow-emerald-500/50" : "bg-amber-500 animate-pulse"
                )} />
                <span className="text-[10px] sm:text-xs font-medium text-slate-600 whitespace-nowrap">
                  {isConnected ? "Đang hoạt động" : "Đang kết nối..."}
                </span>
              </div>

              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMarkAllAsRead}
                  className={cn(
                    "text-[10px] sm:text-xs h-6 sm:h-7 px-2 sm:px-3 rounded-full font-medium",
                    "bg-brand-green/10 hover:bg-brand-green/20 text-brand-green",
                    "transition-all duration-200"
                  )}
                >
                  <CheckCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1 sm:mr-1.5" />
                  <span className="hidden sm:inline">Đọc tất cả</span>
                  <span className="sm:hidden">Đọc hết</span>
                </Button>
              )}
            </div>
          </CardHeader>

          <CardContent className="p-0 relative">
            <ScrollArea className="h-[70vh] sm:h-[480px] max-h-[600px]">
              {hasNotifications ? (
                <div className="space-y-2 px-2 sm:px-3 pb-3">
                  {recentNotifications.map((notification, index) => (
                    <div
                      key={notification.id}
                      className="animate-slide-in-up"
                      style={{ animationDelay: `${index * 50}ms` }}
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
                <div className="flex flex-col items-center justify-center h-[300px] sm:h-[400px] text-slate-400 px-6">
                  <div className="w-16 sm:w-20 h-16 sm:h-20 rounded-full bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center mb-4 shadow-inner">
                    <Bell className="w-8 sm:w-10 h-8 sm:h-10 text-slate-300" />
                  </div>
                  <p className="text-sm sm:text-base font-semibold text-slate-600 mb-1">Chưa có thông báo</p>
                  <p className="text-xs sm:text-sm text-center text-slate-400 max-w-[280px]">
                    Bạn sẽ nhận được thông báo về hoạt động của mình tại đây
                  </p>
                </div>
              )}
            </ScrollArea>

            {/* Footer with gradient */}
            {localNotifications.length > 10 && (
              <>
                <Separator className="bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
                <div className="p-3 bg-gradient-to-br from-slate-50/50 to-transparent">
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full text-sm font-medium rounded-xl",
                      "bg-gradient-to-r from-brand-green to-brand-forest",
                      "text-white hover:shadow-lg hover:scale-[1.02]",
                      "transition-all duration-300"
                    )}
                    onClick={() => {
                      window.location.href = "/notifications";
                      setIsOpen(false);
                    }}
                  >
                    Xem tất cả thông báo ({localNotifications.length})
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
}

// Connection status indicator component with enhanced design
export function NotificationConnectionStatus() {
  const { isConnected } = useRealtimeNotifications();
  const { user } = useAuth();

  // Only show reconnection message for authenticated users
  if (isConnected || !user?.id) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-slide-in-up">
      <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200/50 shadow-xl backdrop-blur-sm">
        <CardContent className="flex items-center gap-3 p-4">
          <div className="relative">
            <div className="w-3 h-3 bg-amber-500 rounded-full animate-pulse" />
            <div className="absolute inset-0 w-3 h-3 bg-amber-400 rounded-full animate-ping" />
          </div>
          <div>
            <p className="text-sm font-semibold text-amber-900">
              Đang kết nối lại...
            </p>
            <p className="text-xs text-amber-700">
              Hệ thống thông báo realtime
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}