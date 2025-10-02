"use client"

import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { useRealtimeNotifications, useUserPresence } from "@/hooks/use-realtime-notifications"
import { useAuth } from "@/components/auth/auth-provider"
import { Badge } from "@/components/ui/badge"

export const dynamic = 'force-dynamic'

export default function TestNotificationsPage() {
  const { toast, success, error, warning, info } = useToast()
  const { user, isAuthenticated } = useAuth()
  const { notifications, unreadCount, isConnected } = useRealtimeNotifications()
  const { isOnline } = useUserPresence()

  const showDefaultToast = () => {
    toast({
      title: "Thông báo mặc định",
      description: "Đây là thông báo mặc định với nội dung chi tiết."
    })
  }

  const showSuccessToast = () => {
    success({
      title: "Thành công!",
      description: "Địa điểm đã được thêm thành công vào danh sách."
    })
  }

  const showErrorToast = () => {
    error({
      title: "Có lỗi xảy ra",
      description: "Không thể tải dữ liệu. Vui lòng thử lại sau."
    })
  }

  const showWarningToast = () => {
    warning({
      title: "Cảnh báo",
      description: "Bạn chưa hoàn thành tất cả thông tin bắt buộc."
    })
  }

  const showInfoToast = () => {
    info({
      title: "Thông tin",
      description: "Cập nhật mới nhất đã được áp dụng cho hệ thống."
    })
  }

  const showMultipleToasts = () => {
    success({ title: "Toast 1", description: "Thông báo đầu tiên" })
    setTimeout(() => info({ title: "Toast 2", description: "Thông báo thứ hai" }), 500)
    setTimeout(() => warning({ title: "Toast 3", description: "Thông báo thứ ba" }), 1000)
  }

  // Admin notification testing functions
  const testAdminNotification = async (testType: string) => {
    try {
      const response = await fetch('/api/admin/system/health', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'test_notification',
          testType
        })
      })

      const result = await response.json()

      if (result.success) {
        success({
          title: "Admin notification sent",
          description: `Test notification '${testType}' sent successfully`
        })
      } else {
        error({
          title: "Failed to send notification",
          description: result.error || "Unknown error occurred"
        })
      }
    } catch (error) {
      console.error('Error testing admin notification:', error)
      error({
        title: "Network error",
        description: "Failed to send admin notification test"
      })
    }
  }

  const triggerHealthCheck = async () => {
    try {
      const response = await fetch('/api/admin/system/health', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'health_check'
        })
      })

      const result = await response.json()

      if (result.success) {
        success({
          title: "Health check completed",
          description: "System health check triggered successfully"
        })
      } else {
        error({
          title: "Health check failed",
          description: result.error || "Unknown error occurred"
        })
      }
    } catch (error) {
      console.error('Error triggering health check:', error)
      error({
        title: "Network error",
        description: "Failed to trigger health check"
      })
    }
  }

  // Debug functions
  const debugNotifications = async () => {
    try {
      const response = await fetch('/api/debug/notifications')
      const result = await response.json()
      
      if (result.success) {
        console.log('🔍 Debug Info:', result.debug)
        success({
          title: "Debug info logged",
          description: "Check browser console for detailed debug information"
        })
      } else {
        error({
          title: "Debug failed",
          description: result.error || "Unknown error occurred"
        })
      }
    } catch (error) {
      console.error('Error debugging notifications:', error)
      error({
        title: "Debug error",
        description: "Failed to get debug information"
      })
    }
  }

  const clearNotifications = async () => {
    try {
      const response = await fetch('/api/debug/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'clear_notifications'
        })
      })

      const result = await response.json()

      if (result.success) {
        success({
          title: "Notifications cleared",
          description: "All notifications have been cleared"
        })
      } else {
        error({
          title: "Clear failed",
          description: result.error || "Unknown error occurred"
        })
      }
    } catch (error) {
      console.error('Error clearing notifications:', error)
      error({
        title: "Clear error",
        description: "Failed to clear notifications"
      })
    }
  }

  const createTestNotifications = async () => {
    try {
      const response = await fetch('/api/debug/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'create_test_notifications',
          count: 3
        })
      })

      const result = await response.json()

      if (result.success) {
        success({
          title: "Test notifications created",
          description: `Created ${result.notifications.length} test notifications`
        })
      } else {
        error({
          title: "Creation failed",
          description: result.error || "Unknown error occurred"
        })
      }
    } catch (error) {
      console.error('Error creating test notifications:', error)
      error({
        title: "Creation error",
        description: "Failed to create test notifications"
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Test Notification System
          </h1>
          <p className="text-gray-600 text-center mb-8">
            Kiểm tra hệ thống thông báo với các loại thông báo khác nhau.
            Thông báo sẽ hiển thị ở góc dưới bên phải màn hình.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Button 
              onClick={showDefaultToast}
              variant="outline"
              className="h-16 flex flex-col items-center justify-center gap-1"
            >
              <span className="font-medium">Default Toast</span>
              <span className="text-xs text-gray-500">Thông báo mặc định</span>
            </Button>

            <Button 
              onClick={showSuccessToast}
              variant="outline"
              className="h-16 flex flex-col items-center justify-center gap-1 border-green-200 hover:bg-green-50"
            >
              <span className="font-medium text-green-700">Success Toast</span>
              <span className="text-xs text-green-600">Thông báo thành công</span>
            </Button>

            <Button 
              onClick={showErrorToast}
              variant="outline"
              className="h-16 flex flex-col items-center justify-center gap-1 border-red-200 hover:bg-red-50"
            >
              <span className="font-medium text-red-700">Error Toast</span>
              <span className="text-xs text-red-600">Thông báo lỗi</span>
            </Button>

            <Button 
              onClick={showWarningToast}
              variant="outline"
              className="h-16 flex flex-col items-center justify-center gap-1 border-yellow-200 hover:bg-yellow-50"
            >
              <span className="font-medium text-yellow-700">Warning Toast</span>
              <span className="text-xs text-yellow-600">Thông báo cảnh báo</span>
            </Button>

            <Button 
              onClick={showInfoToast}
              variant="outline"
              className="h-16 flex flex-col items-center justify-center gap-1 border-blue-200 hover:bg-blue-50"
            >
              <span className="font-medium text-blue-700">Info Toast</span>
              <span className="text-xs text-blue-600">Thông báo thông tin</span>
            </Button>

            <Button 
              onClick={showMultipleToasts}
              variant="default"
              className="h-16 flex flex-col items-center justify-center gap-1"
            >
              <span className="font-medium">Multiple Toasts</span>
              <span className="text-xs opacity-80">Nhiều thông báo</span>
            </Button>
          </div>

          {/* Real-time Notifications Status */}
          <div className="mt-8 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
            <h3 className="font-medium text-gray-900 mb-4">🔔 Real-time Notifications Status</h3>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="flex items-center gap-2">
                <Badge variant={isAuthenticated ? "default" : "secondary"}>
                  {isAuthenticated ? "✅ Authenticated" : "❌ Not Authenticated"}
                </Badge>
              </div>
              
              <div className="flex items-center gap-2">
                <Badge variant={isConnected ? "default" : "destructive"}>
                  {isConnected ? "🟢 Connected" : "🔴 Disconnected"}
                </Badge>
              </div>
              
              <div className="flex items-center gap-2">
                <Badge variant={isOnline ? "default" : "secondary"}>
                  {isOnline ? "📶 Online" : "📡 Offline"}
                </Badge>
              </div>
              
              <div className="flex items-center gap-2">
                <Badge variant="outline">
                  🔔 Unread: {unreadCount}
                </Badge>
              </div>
            </div>
            
            {isAuthenticated && user && (
              <div className="text-sm text-gray-600 mb-2">
                <strong>User:</strong> {user.fullName || user.email} ({user.role})
              </div>
            )}
            
            {notifications.length > 0 ? (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Recent Notifications:</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {notifications.slice(0, 5).map((notification) => (
                    <div key={notification.id} className="p-2 bg-white rounded border text-xs">
                      <div className="font-medium">{notification.title}</div>
                      <div className="text-gray-600">{notification.message}</div>
                      <div className="flex justify-between items-center mt-1">
                        <Badge size="sm" variant={notification.priority === 'high' ? 'destructive' : 'outline'}>
                          {notification.priority}
                        </Badge>
                        <span className="text-gray-400">
                          {notification.read ? '✅' : '🔔'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-500 text-center py-4">
                {isAuthenticated ? "No notifications yet" : "Login to see real-time notifications"}
              </div>
            )}
          </div>

          {/* Enhanced Testing Section */}
          <div className="mt-6 p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
            <h3 className="font-medium text-gray-900 mb-4">📊 Notification System Analytics</h3>
            
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                <div className="text-2xl font-bold text-green-600">{notifications.length}</div>
                <div className="text-xs text-gray-500">Total Notifications</div>
              </div>
              <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                <div className="text-2xl font-bold text-blue-600">{unreadCount}</div>
                <div className="text-xs text-gray-500">Unread Count</div>
              </div>
              <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                <div className="text-2xl font-bold text-purple-600">
                  {notifications.filter(n => n.priority === 'high').length}
                </div>
                <div className="text-xs text-gray-500">High Priority</div>
              </div>
            </div>

            <div className="text-sm text-gray-600">
              <p className="mb-2">
                <strong>Connection Status:</strong> {isConnected ? '🟢 Real-time active' : '🔴 Disconnected'}
              </p>
              <p className="mb-2">
                <strong>User Status:</strong> {isOnline ? '📶 Online' : '📡 Offline'}
              </p>
              <p>
                <strong>Last Update:</strong> {new Date().toLocaleTimeString()}
              </p>
            </div>
          </div>

          {/* Admin Notification Testing - Only for admin users */}
          {user?.role === 'admin' && (
            <div className="mt-8 p-4 bg-gradient-to-br from-red-50 to-pink-50 rounded-lg border border-red-200">
              <h3 className="font-medium text-gray-900 mb-4">🔐 Admin Notification Testing (Phase 2)</h3>
              
              <div className="grid grid-cols-2 gap-3 mb-4">
                <Button 
                  onClick={() => testAdminNotification('system_performance')}
                  className="w-full justify-start bg-red-500 hover:bg-red-600 text-sm"
                >
                  🚨 System Performance
                </Button>
                
                <Button 
                  onClick={() => testAdminNotification('database_connection')}
                  className="w-full justify-start bg-red-600 hover:bg-red-700 text-sm"
                >
                  🔴 Database Issues
                </Button>
                
                <Button 
                  onClick={() => testAdminNotification('moderation_queue')}
                  className="w-full justify-start bg-orange-500 hover:bg-orange-600 text-sm"
                >
                  📊 Queue Overload
                </Button>
                
                <Button 
                  onClick={() => testAdminNotification('security_alert')}
                  className="w-full justify-start bg-yellow-500 hover:bg-yellow-600 text-sm"
                >
                  ⚠️ Security Alert
                </Button>
                
                <Button 
                  onClick={() => testAdminNotification('storage_warning')}
                  className="w-full justify-start bg-blue-500 hover:bg-blue-600 text-sm"
                >
                  📦 Storage Warning
                </Button>
                
                <Button 
                  onClick={() => testAdminNotification('ssl_certificate')}
                  className="w-full justify-start bg-green-500 hover:bg-green-600 text-sm"
                >
                  🔒 SSL Expiring
                </Button>
                
                <Button 
                  onClick={() => testAdminNotification('gdpr_request')}
                  className="w-full justify-start bg-purple-500 hover:bg-purple-600 text-sm"
                >
                  📋 GDPR Request
                </Button>
                
                <Button 
                  onClick={() => testAdminNotification('spam_detection')}
                  className="w-full justify-start bg-gray-500 hover:bg-gray-600 text-sm"
                >
                  🛡️ Spam Detection
                </Button>
              </div>
              
              <div className="p-3 bg-white rounded border">
                <h4 className="text-sm font-medium text-gray-700 mb-3">System Health Monitoring</h4>
                <div className="space-y-2">
                  <Button 
                    onClick={triggerHealthCheck}
                    className="w-full bg-indigo-500 hover:bg-indigo-600"
                  >
                    🔍 Trigger System Health Check
                  </Button>
                </div>
              </div>
              
              {/* Debug Section */}
              <div className="mt-4 p-3 bg-yellow-50 rounded border border-yellow-200">
                <h4 className="text-sm font-medium text-gray-700 mb-3">🐛 Debug & Testing Tools</h4>
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    onClick={debugNotifications}
                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-sm"
                  >
                    🔍 Debug Info
                  </Button>
                  
                  <Button 
                    onClick={clearNotifications}
                    className="w-full bg-red-500 hover:bg-red-600 text-sm"
                  >
                    🗑️ Clear All
                  </Button>
                  
                  <Button 
                    onClick={createTestNotifications}
                    className="w-full bg-green-500 hover:bg-green-600 text-sm col-span-2"
                  >
                    ➕ Create 3 Test Notifications
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">🎯 Notification System Features:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• <strong>Mobile:</strong> Full width, bottom positioning</li>
              <li>• <strong>Tablet/Desktop:</strong> Fixed width, bottom-right corner</li>
              <li>• <strong>Stack limit:</strong> Maximum 3 notifications</li>
              <li>• <strong>Auto dismiss:</strong> 5 seconds timeout</li>
              <li>• <strong>Modern UI:</strong> Glass morphism effect with backdrop blur</li>
              <li>• <strong>Real-time Sync:</strong> Firebase integration for instant updates</li>
              <li>• <strong>Smart Batching:</strong> Groups similar notifications automatically</li>
              <li>• <strong>Milestone Tracking:</strong> Achievement notifications for user engagement</li>
              {user?.role === 'admin' && (
                <>
                  <li>• <strong>Admin Notifications:</strong> System health and security monitoring</li>
                  <li>• <strong>Smart Escalation:</strong> Role-based notification routing with SLA tracking</li>
                  <li>• <strong>Health Monitoring:</strong> Proactive system performance alerts</li>
                </>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}