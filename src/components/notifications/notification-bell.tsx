"use client";

import * as React from "react";
import { Bell, Check, CheckCheck, Clock, AlertCircle } from "lucide-react";
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

const notificationIcons = {
  // Place moderation
  place_approved: "✅",
  place_rejected: "❌", 
  place_needs_edit: "✏️",
  edit_request_approved: "✅",
  edit_request_rejected: "❌",
  new_moderation_item: "📋",
  moderation_claimed: "👤",
  moderation_escalated: "⚠️",
  reports_threshold_reached: "🚨",
  // User interactions
  place_liked: "❤️",
  place_saved: "💾",
  place_review_posted: "⭐",
  place_comment_reply: "💬",
  place_published: "🎉",
  place_featured: "⭐",
  place_milestone: "🏆",
  // System notifications
  system_maintenance: "🔧",
  security_alert: "🔐",
  feature_update: "🚀",
  weekly_summary: "📊",
  // Admin/Moderator notifications (Phase 2)
  // System Health & Performance
  system_performance_degraded: "🚨",
  database_connection_issues: "🔴",
  api_rate_limit_exceeded: "⚡",
  storage_quota_warning: "📦",
  cdn_failure_detected: "🌐",
  // Security & Compliance
  suspicious_login_patterns: "⚠️",
  multiple_failed_login_attempts: "🔐",
  data_export_request: "📋",
  gdpr_deletion_request: "🗂️",
  admin_privilege_escalation: "🔑",
  // Business Operations
  moderation_queue_overload: "📊",
  content_volume_spike: "📈",
  user_registration_anomaly: "👥",
  spam_detection_threshold: "🛡️",
  // Infrastructure Monitoring
  server_memory_critical: "🖥️",
  disk_space_warning: "💾",
  backup_failure: "💿",
  ssl_certificate_expiring: "🔒",
  third_party_service_down: "🔗",
  // Moderation Workflow
  moderation_handoff_received: "👥",
  moderation_sla_warning: "⏰",
  moderation_queue_stuck: "🔄",
  content_pattern_detected: "🔍"
};

const notificationColors = {
  high: "text-red-600 bg-red-50",
  medium: "text-yellow-600 bg-yellow-50", 
  low: "text-gray-600 bg-gray-50"
};

interface NotificationItemProps {
  notification: RealtimeNotification;
  onMarkAsRead: (id: string) => void;
}

function NotificationItem({ notification, onMarkAsRead }: NotificationItemProps) {
  const handleClick = () => {
    if (!notification.read) {
      onMarkAsRead(notification.id);
    }

    // Navigate to relevant page if actionUrl exists
    if (notification.data?.actionUrl) {
      window.location.href = notification.data.actionUrl;
    }
  };

  return (
    <div
      className={cn(
        "flex items-start space-x-3 p-3 cursor-pointer transition-colors hover:bg-gray-50 rounded-md",
        !notification.read && "bg-blue-50/30"
      )}
      onClick={handleClick}
    >
      <div className="flex-shrink-0 mt-1">
        <span className="text-lg">
          {notificationIcons[notification.type] || "📧"}
        </span>
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p className={cn(
            "text-sm font-medium text-gray-900 truncate",
            !notification.read && "font-semibold"
          )}>
            {notification.title}
          </p>
          <div className="flex items-center space-x-1">
            {notification.priority === 'high' && (
              <AlertCircle className="w-3 h-3 text-red-500" />
            )}
            {notification.read ? (
              <CheckCheck className="w-3 h-3 text-gray-400" />
            ) : (
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
            )}
          </div>
        </div>
        
        <p className="text-sm text-gray-600 line-clamp-2 mt-1">
          {notification.message}
        </p>
        
        <div className="flex items-center justify-between mt-2">
          <Badge 
            variant="outline" 
            className={cn("text-xs", notificationColors[notification.priority])}
          >
            {notification.priority}
          </Badge>
          
          <span className="text-xs text-gray-400">
            {formatDistanceToNow(new Date(notification.createdAt), { 
              addSuffix: true, 
              locale: vi 
            })}
          </span>
        </div>
      </div>
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

  const handleMarkAllAsRead = async () => {
    if (unreadCount > 0) {
      await markAllAsRead();
    }
  };

  const recentNotifications = notifications.slice(0, 10);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="relative p-2 hover:bg-gray-100"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-red-500 text-white"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
          {!isConnected && (
            <div className="absolute -bottom-1 -right-1 h-2 w-2 bg-yellow-500 rounded-full animate-pulse" />
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent 
        className="w-96 p-0" 
        align="end"
        sideOffset={8}
      >
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Thông báo</CardTitle>
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    isConnected ? "bg-green-500" : "bg-yellow-500 animate-pulse"
                  )} />
                  <span className="text-xs text-gray-500">
                    {isConnected ? "Đang kết nối" : "Đang kết nối lại..."}
                  </span>
                </div>
                
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleMarkAllAsRead}
                    className="text-xs h-7 px-2"
                  >
                    <Check className="w-3 h-3 mr-1" />
                    Đánh dấu tất cả
                  </Button>
                )}
              </div>
            </div>
            
            {unreadCount > 0 && (
              <CardDescription>
                Bạn có {unreadCount} thông báo chưa đọc
              </CardDescription>
            )}
          </CardHeader>

          <Separator />
          
          <CardContent className="p-0">
            <ScrollArea className="h-96">
              {recentNotifications.length > 0 ? (
                <div className="space-y-1">
                  {recentNotifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onMarkAsRead={markAsRead}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-32 text-gray-500">
                  <Bell className="w-8 h-8 mb-2 opacity-50" />
                  <p className="text-sm">Không có thông báo nào</p>
                </div>
              )}
            </ScrollArea>
            
            {notifications.length > 10 && (
              <>
                <Separator />
                <div className="p-3">
                  <Button 
                    variant="ghost" 
                    className="w-full text-sm"
                    onClick={() => {
                      window.location.href = "/notifications";
                      setIsOpen(false);
                    }}
                  >
                    Xem tất cả thông báo
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

// Connection status indicator component
export function NotificationConnectionStatus() {
  const { isConnected } = useRealtimeNotifications();
  const { user } = useAuth();
  
  // Only show reconnection message for authenticated users
  if (isConnected || !user?.id) return null;
  
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="bg-yellow-50 border-yellow-200">
        <CardContent className="flex items-center space-x-2 p-3">
          <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
          <p className="text-sm text-yellow-800">
            Đang kết nối lại thông báo realtime...
          </p>
        </CardContent>
      </Card>
    </div>
  );
}