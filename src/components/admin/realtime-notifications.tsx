"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { 
  Bell,
  Check,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Settings,
  Trash2,
  Eye
} from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import { cn } from "@/lib/utils"
import RealtimeService from "@/lib/firebase/realtime"

export interface AdminNotification {
  id: string
  type: 'place_approved' | 'place_rejected' | 'place_needs_review' | 'place_escalated' | 'system_alert'
  title: string
  message: string
  actionUrl?: string
  metadata?: {
    placeId?: string
    placeName?: string
    moderatorName?: string
    reason?: string
  }
  timestamp: number
  read: boolean
  priority: 'low' | 'medium' | 'high' | 'urgent'
}

const getNotificationIcon = (type: AdminNotification['type']) => {
  switch (type) {
    case 'place_approved':
      return <CheckCircle className="h-4 w-4 text-green-600" />
    case 'place_rejected':
      return <XCircle className="h-4 w-4 text-red-600" />
    case 'place_needs_review':
      return <Clock className="h-4 w-4 text-amber-600" />
    case 'place_escalated':
      return <AlertCircle className="h-4 w-4 text-orange-600" />
    case 'system_alert':
      return <Settings className="h-4 w-4 text-blue-600" />
    default:
      return <Bell className="h-4 w-4 text-gray-600" />
  }
}

const getPriorityBadgeColor = (priority: AdminNotification['priority']) => {
  switch (priority) {
    case 'urgent':
      return 'bg-red-600 text-white'
    case 'high':
      return 'bg-orange-600 text-white'
    case 'medium':
      return 'bg-yellow-600 text-white'
    default:
      return 'bg-blue-600 text-white'
  }
}

interface RealtimeNotificationsProps {
  className?: string
}

export const RealtimeNotifications: React.FC<RealtimeNotificationsProps> = ({ 
  className 
}) => {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<AdminNotification[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)

  // Subscribe to real-time notifications
  useEffect(() => {
    if (!user?.uid) return

    const unsubscribe = RealtimeService.subscribeToNotifications(
      user.uid,
      (newNotifications) => {
        // Transform notifications to AdminNotification format
        const adminNotifications: AdminNotification[] = newNotifications.map(n => ({
          id: n.id,
          type: n.type || 'system_alert',
          title: n.title,
          message: n.message,
          actionUrl: n.actionUrl,
          metadata: n.metadata,
          timestamp: n.timestamp || Date.now(),
          read: n.read || false,
          priority: 'medium' // Default priority
        }))
        
        setNotifications(adminNotifications)
        setLoading(false)
      }
    )

    return unsubscribe
  }, [user?.uid])

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    if (!user?.uid) return

    try {
      await RealtimeService.markNotificationAsRead(user.uid, notificationId)
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  // Mark all as read
  const markAllAsRead = async () => {
    if (!user?.uid) return

    try {
      const unreadNotifications = notifications.filter(n => !n.read)
      await Promise.all(
        unreadNotifications.map(n => 
          RealtimeService.markNotificationAsRead(user.uid!, n.id)
        )
      )
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }

  const unreadCount = notifications.filter(n => !n.read).length
  const recentNotifications = notifications.slice(0, 8) // Show last 8

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn("relative", className)}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 bg-red-600 text-white text-xs animate-pulse"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-80 p-0" align="end">
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-3 border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Thông báo
                {unreadCount > 0 && (
                  <Badge className="bg-red-600 text-white text-xs">
                    {unreadCount}
                  </Badge>
                )}
              </CardTitle>
              
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  className="text-xs h-7"
                >
                  <Check className="h-3 w-3 mr-1" />
                  Đọc tất cả
                </Button>
              )}
            </div>
          </CardHeader>
          
          <CardContent className="p-0">
            {loading ? (
              <div className="p-6 text-center text-gray-500">
                <div className="animate-spin w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-2"></div>
                Đang tải...
              </div>
            ) : recentNotifications.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Không có thông báo mới</p>
              </div>
            ) : (
              <div className="max-h-96 overflow-y-auto">
                <div className="space-y-1 p-2">
                  {recentNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={cn(
                        "p-3 rounded-lg border cursor-pointer hover:bg-gray-50 transition-all duration-200",
                        !notification.read && "bg-blue-50 border-blue-200 shadow-sm",
                        notification.read && "bg-white border-gray-100",
                        notification.priority === 'urgent' && "border-l-4 border-l-red-500",
                        notification.priority === 'high' && "border-l-4 border-l-orange-500"
                      )}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          {getNotificationIcon(notification.type)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <h4 className={cn(
                              "text-sm font-medium leading-tight",
                              !notification.read && "text-gray-900",
                              notification.read && "text-gray-600"
                            )}>
                              {notification.title}
                            </h4>
                            
                            {notification.priority !== 'low' && (
                              <Badge 
                                className={cn(
                                  "text-xs ml-2 flex-shrink-0",
                                  getPriorityBadgeColor(notification.priority)
                                )}
                              >
                                {notification.priority.toUpperCase()}
                              </Badge>
                            )}
                          </div>
                          
                          <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                            {notification.message}
                          </p>
                          
                          {notification.metadata?.placeName && (
                            <p className="text-xs text-blue-600 mt-2 flex items-center gap-1">
                              📍 {notification.metadata.placeName}
                            </p>
                          )}
                          
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-gray-500">
                              {new Date(notification.timestamp).toLocaleString('vi-VN', {
                                day: '2-digit',
                                month: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                            
                            {notification.actionUrl && (
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-xs h-6 px-2 text-blue-600 hover:text-blue-700"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  window.open(notification.actionUrl, '_blank')
                                }}
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                Xem
                              </Button>
                            )}
                          </div>
                        </div>
                        
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-2 animate-pulse"></div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {notifications.length > 8 && (
              <div className="p-3 border-t bg-gray-50 text-center">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-sm w-full"
                  onClick={() => {
                    setOpen(false)
                    // TODO: Navigate to full notifications page
                  }}
                >
                  Xem tất cả ({notifications.length} thông báo)
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  )
}

// Helper function to send admin notifications
export const sendAdminNotification = async (
  userId: string, 
  notification: {
    type: AdminNotification['type']
    title: string
    message: string
    actionUrl?: string
    metadata?: AdminNotification['metadata']
    priority?: AdminNotification['priority']
  }
) => {
  try {
    await RealtimeService.sendNotification(userId, {
      type: notification.type,
      title: notification.title,
      message: notification.message,
      actionUrl: notification.actionUrl,
      metadata: notification.metadata
    })
  } catch (error) {
    console.error('Error sending admin notification:', error)
    throw error
  }
}

export default RealtimeNotifications