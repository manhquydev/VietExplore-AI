'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { RefreshCw, AlertTriangle, CheckCircle, Play } from 'lucide-react'
import { useAuth } from '@/components/auth/auth-provider'

export default function TestMaintenancePage() {
  const [testConfig, setTestConfig] = useState({
    enabled: false,
    message: 'Hệ thống đang bảo trì để test tính năng mới. Vui lòng thử lại sau 5 phút.',
    allowedIPs: ''
  })
  const [testing, setTesting] = useState(false)
  const [result, setResult] = useState<any>(null)
  const { user } = useAuth()

  const handleTest = async () => {
    if (!user) {
      alert('Vui lòng đăng nhập với quyền admin')
      return
    }

    setTesting(true)
    setResult(null)

    try {
      const token = await user.getIdToken()
      const allowedIPsArray = testConfig.allowedIPs
        .split(',')
        .map(ip => ip.trim())
        .filter(ip => ip.length > 0)

      const response = await fetch('/api/admin/test-maintenance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          enabled: testConfig.enabled,
          message: testConfig.message,
          allowedIPs: allowedIPsArray
        })
      })

      const data = await response.json()
      setResult(data)

      if (data.success) {
        alert(`✅ Test thành công!\n\n${data.message}\n\nBây giờ bạn có thể:\n- Mở tab ẩn danh để test\n- Hoặc truy cập từ IP khác để thấy maintenance page`)
      } else {
        alert(`❌ Test thất bại: ${data.error}`)
      }
    } catch (error) {
      console.error('Test error:', error)
      setResult({ success: false, error: 'Không thể kết nối đến server' })
      alert('❌ Lỗi kết nối server')
    } finally {
      setTesting(false)
    }
  }

  const handleQuickTest = async (enabled: boolean) => {
    setTestConfig(prev => ({ ...prev, enabled }))
    
    // Auto run test after updating config
    setTimeout(() => {
      handleTest()
    }, 100)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🛠️ Maintenance Mode Test
          </h1>
          <p className="text-gray-600">
            Test tính năng maintenance mode với API thực
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-4 justify-center mb-6">
          <Button 
            onClick={() => handleQuickTest(true)}
            disabled={testing}
            className="bg-red-600 hover:bg-red-700"
          >
            <AlertTriangle className="w-4 h-4 mr-2" />
            Bật Maintenance
          </Button>
          
          <Button 
            onClick={() => handleQuickTest(false)}
            disabled={testing}
            className="bg-green-600 hover:bg-green-700"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Tắt Maintenance
          </Button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          
          {/* Test Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="h-5 w-5" />
                Cấu hình Test
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <Label>Bật Maintenance Mode</Label>
                <Switch
                  checked={testConfig.enabled}
                  onCheckedChange={(checked) => 
                    setTestConfig(prev => ({ ...prev, enabled: checked }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Thông điệp hiển thị</Label>
                <Textarea
                  value={testConfig.message}
                  onChange={(e) => 
                    setTestConfig(prev => ({ ...prev, message: e.target.value }))
                  }
                  rows={3}
                  className="resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label>IP được phép truy cập (cách nhau bằng dấu phẩy)</Label>
                <Input
                  value={testConfig.allowedIPs}
                  onChange={(e) => 
                    setTestConfig(prev => ({ ...prev, allowedIPs: e.target.value }))
                  }
                  placeholder="127.0.0.1, 192.168.1.100"
                />
                <p className="text-xs text-gray-500">
                  Để trống nếu muốn block tất cả users
                </p>
              </div>

              <Button 
                onClick={handleTest}
                disabled={testing || !user}
                className="w-full"
              >
                {testing ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Đang test...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Chạy Test
                  </>
                )}
              </Button>

            </CardContent>
          </Card>

          {/* Test Results */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                📊 Kết quả Test
              </CardTitle>
            </CardHeader>
            <CardContent>
              
              {!user ? (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-yellow-800">
                    ⚠️ Vui lòng đăng nhập với tài khoản admin để test
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>User:</strong> {user.email}
                    </p>
                    <p className="text-sm text-blue-800">
                      <strong>Role:</strong> {(user as any).role || 'Unknown'}
                    </p>
                  </div>

                  {result && (
                    <div className={`p-4 rounded-lg border ${
                      result.success 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-red-50 border-red-200'
                    }`}>
                      <div className="flex items-center gap-2 mb-2">
                        {result.success ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <AlertTriangle className="h-5 w-5 text-red-600" />
                        )}
                        <Badge variant={result.success ? 'default' : 'destructive'}>
                          {result.success ? 'Thành công' : 'Thất bại'}
                        </Badge>
                      </div>
                      
                      <p className="text-sm font-medium mb-2">
                        {result.message || result.error}
                      </p>
                      
                      {result.data && (
                        <div className="text-xs bg-white p-2 rounded border mt-2">
                          <pre>{JSON.stringify(result.data, null, 2)}</pre>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="text-xs text-gray-500 space-y-1">
                    <p><strong>Cách test:</strong></p>
                    <p>1. Bật maintenance mode</p>
                    <p>2. Mở tab ẩn danh</p>
                    <p>3. Truy cập trang chủ sẽ thấy maintenance page</p>
                    <p>4. Admin vẫn truy cập bình thường</p>
                  </div>
                </div>
              )}

            </CardContent>
          </Card>
        </div>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>📋 Hướng dẫn sử dụng</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              
              <div>
                <h4 className="font-semibold mb-2">🔧 API Endpoints hoạt động:</h4>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>✅ <code>/api/admin/settings</code> - System settings</li>
                  <li>✅ <code>/api/admin/notifications/settings</code> - Notifications</li>
                  <li>✅ <code>/api/admin/security/settings</code> - Security</li>
                  <li>✅ <code>/api/admin/moderation/settings</code> - Moderation</li>
                  <li>✅ <code>/api/internal/maintenance-status</code> - Middleware check</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">⚡ Tính năng hoạt động:</h4>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>✅ Middleware check maintenance real-time</li>
                  <li>✅ Cache 30s để giảm database calls</li>
                  <li>✅ IP whitelist support</li>
                  <li>✅ Custom maintenance messages</li>
                  <li>✅ Audit logging cho tất cả changes</li>
                  <li>✅ Role-based permissions</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}