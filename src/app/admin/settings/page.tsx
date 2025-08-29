"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { 
  Settings as SettingsIcon,
  Shield,
  Database,
  Mail,
  Bell,
  Users,
  Save,
  RefreshCw,
  AlertTriangle,
  Info,
  CheckCircle
} from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import { cn } from "@/lib/utils"
import { useSystemSettings } from "@/hooks/use-admin"

export default function AdminSettingsPage() {
  const { user } = useAuth()
  const { 
    settings, 
    loading: settingsLoading, 
    saving, 
    updateSettings, 
    updateSetting 
  } = useSystemSettings()
  
  const [saved, setSaved] = React.useState(false)

  const handleSettingChange = (section: string, key: string, value: any) => {
    updateSetting(section, key, value)
    setSaved(false)
  }

  const handleSave = async () => {
    const result = await updateSettings(settings)
    if (result.success) {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } else {
      console.error('Failed to save settings:', result.error)
    }
  }

  const actions = (
    <div className="flex items-center gap-3">
      <Button 
        onClick={handleSave} 
        disabled={saving}
        className={cn(
          "transition-all duration-200 min-w-[140px]",
          saved ? "bg-green-600 hover:bg-green-700 shadow-lg" : "hover:shadow-md"
        )}
      >
        {saving ? (
          <>
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            <span>Đang lưu...</span>
          </>
        ) : saved ? (
          <>
            <CheckCircle className="w-4 h-4 mr-2 animate-pulse" />
            <span>Đã lưu</span>
          </>
        ) : (
          <>
            <Save className="w-4 h-4 mr-2" />
            <span>Lưu thay đổi</span>
          </>
        )}
      </Button>
    </div>
  )

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 md:mb-8">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Cài đặt hệ thống</h1>
          <p className="text-sm md:text-base text-gray-600">Cấu hình cài đặt và tùy chọn nền tảng</p>
        </div>
        <div className="flex-shrink-0">
          {actions}
        </div>
      </div>
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 bg-gray-100 p-1 rounded-lg">
          <TabsTrigger value="general" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <SettingsIcon className="w-4 h-4" />
            <span className="hidden sm:inline">General</span>
          </TabsTrigger>
          <TabsTrigger value="moderation" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Shield className="w-4 h-4" />
            <span className="hidden sm:inline">Moderation</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Bell className="w-4 h-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Database className="w-4 h-4" />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4 md:space-y-6">
          <Card className="hover:shadow-md transition-all duration-200">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                <SettingsIcon className="h-5 w-5 text-blue-600" />
                Cấu hình trang web
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="siteName" className="text-sm font-semibold text-gray-700">Tên trang web</Label>
                  <Input
                    id="siteName"
                    value={settings.general.siteName}
                    onChange={(e) => handleSettingChange('general', 'siteName', e.target.value)}
                    className="focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Nhập tên trang web"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="siteDescription" className="text-sm font-semibold text-gray-700">Mô tả trang web</Label>
                  <Textarea
                    id="siteDescription"
                    value={settings.general.siteDescription}
                    onChange={(e) => handleSettingChange('general', 'siteDescription', e.target.value)}
                    rows={3}
                    className="focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Mô tả ngắn về trang web"
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-gray-50 rounded-lg border">
                  <div className="space-y-1 flex-1">
                    <Label className="text-sm font-semibold text-gray-700">Chế độ bảo trì</Label>
                    <p className="text-sm text-gray-600">
                      Tạm thời vô hiệu hóa truy cập trang web để bảo trì
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={settings.general.maintenanceMode}
                      onCheckedChange={(checked) => handleSettingChange('general', 'maintenanceMode', checked)}
                      className="data-[state=checked]:bg-red-600"
                    />
                    {settings.general.maintenanceMode && (
                      <Badge variant="destructive" className="animate-pulse">
                        Đang hoạt động
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-gray-50 rounded-lg border">
                  <div className="space-y-1 flex-1">
                    <Label className="text-sm font-semibold text-gray-700">Đăng ký người dùng</Label>
                    <p className="text-sm text-gray-600">
                      Cho phép người dùng mới đăng ký tài khoản
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={settings.general.registrationEnabled}
                      onCheckedChange={(checked) => handleSettingChange('general', 'registrationEnabled', checked)}
                    />
                    {!settings.general.registrationEnabled && (
                      <Badge variant="outline" className="text-amber-700 border-amber-300">
                        Tắt
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="moderation" className="space-y-4 md:space-y-6">
          <Card className="hover:shadow-md transition-all duration-200">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                <Shield className="h-5 w-5 text-blue-600" />
                Cài đặt kiểm duyệt nội dung
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="queueSize">Giới hạn kích thước hàng đợi</Label>
                  <Input
                    id="queueSize"
                    type="number"
                    value={settings.moderation.moderationQueueSize}
                    onChange={(e) => handleSettingChange('moderation', 'moderationQueueSize', parseInt(e.target.value))}
                  />
                  <p className="text-xs text-gray-500">Maximum items in moderation queue</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="escalationThreshold">Ngưỡng leo thang (giờ)</Label>
                  <Input
                    id="escalationThreshold"
                    type="number"
                    value={settings.moderation.escalationThreshold}
                    onChange={(e) => handleSettingChange('moderation', 'escalationThreshold', parseInt(e.target.value))}
                  />
                  <p className="text-xs text-gray-500">Auto-escalate after this many hours</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Tự động phê duyệt cho đối tác</Label>
                    <p className="text-sm text-gray-600">
                      Automatically approve content from verified partners
                    </p>
                  </div>
                  <Switch
                    checked={settings.moderation.partnerAutoApproval}
                    onCheckedChange={(checked) => handleSettingChange('moderation', 'partnerAutoApproval', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Tự động phê duyệt chung</Label>
                    <p className="text-sm text-gray-600">
                      Automatically approve content from all contributors
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={settings.moderation.autoApprovalEnabled}
                      onCheckedChange={(checked) => handleSettingChange('moderation', 'autoApprovalEnabled', checked)}
                    />
                    {!settings.moderation.autoApprovalEnabled && (
                      <Badge variant="outline">Recommended</Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-400 rounded-r-lg p-4 flex items-start gap-3 shadow-sm">
                <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
                <div className="text-sm">
                  <p className="font-semibold text-amber-900">Thực hành tốt nhất về kiểm duyệt</p>
                  <p className="text-amber-800 mt-1 leading-relaxed">
                    Kiểm duyệt thủ công đảm bảo chất lượng nội dung. Chỉ bật tự động phê duyệt cho các nguồn đáng tin cậy.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tùy chọn thông báo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Thông báo email</Label>
                    <p className="text-sm text-gray-600">
                      Send email notifications for important events
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications.emailNotifications}
                    onCheckedChange={(checked) => handleSettingChange('notifications', 'emailNotifications', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Thông báo đẩy</Label>
                    <p className="text-sm text-gray-600">
                      Browser push notifications for real-time alerts
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications.pushNotifications}
                    onCheckedChange={(checked) => handleSettingChange('notifications', 'pushNotifications', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Tóm tắt hàng ngày</Label>
                    <p className="text-sm text-gray-600">
                      Daily summary of platform activity
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications.dailyDigest}
                    onCheckedChange={(checked) => handleSettingChange('notifications', 'dailyDigest', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Cảnh báo kiểm duyệt</Label>
                    <p className="text-sm text-gray-600">
                      Immediate alerts for items requiring attention
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications.moderationAlerts}
                    onCheckedChange={(checked) => handleSettingChange('notifications', 'moderationAlerts', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4 md:space-y-6">
          <Card className="hover:shadow-md transition-all duration-200">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                <Database className="h-5 w-5 text-blue-600" />
                Cài đặt bảo mật
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">Hết thời gian phiên (phút)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={settings.security.sessionTimeout}
                    onChange={(e) => handleSettingChange('security', 'sessionTimeout', parseInt(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxLoginAttempts">Số lần đăng nhập tối đa</Label>
                  <Input
                    id="maxLoginAttempts"
                    type="number"
                    value={settings.security.maxLoginAttempts}
                    onChange={(e) => handleSettingChange('security', 'maxLoginAttempts', parseInt(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="passwordMinLength">Độ dài mật khẩu tối thiểu</Label>
                  <Input
                    id="passwordMinLength"
                    type="number"
                    value={settings.security.passwordMinLength}
                    onChange={(e) => handleSettingChange('security', 'passwordMinLength', parseInt(e.target.value))}
                  />
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Xác thực hai yếu tố</Label>
                  <p className="text-sm text-gray-600">
                    Require 2FA for admin accounts
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={settings.security.twoFactorEnabled}
                    onCheckedChange={(checked) => handleSettingChange('security', 'twoFactorEnabled', checked)}
                  />
                  {!settings.security.twoFactorEnabled && (
                    <Badge variant="destructive">Bị vô hiệu</Badge>
                  )}
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-400 rounded-r-lg p-4 flex items-start gap-3 shadow-sm">
                <Info className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
                <div className="text-sm">
                  <p className="font-semibold text-blue-900">Khuyến nghị bảo mật</p>
                  <ul className="text-blue-800 mt-2 space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-green-600" />
                      Bật xác thực hai yếu tố cho tất cả tài khoản admin
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-green-600" />
                      Đặt thời gian chờ phiên là 60 phút hoặc ít hơn
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-green-600" />
                      Yêu cầu mật khẩu mạnh (tối thiểu 8 ký tự)
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-green-600" />
                      Giám sát các lần đăng nhập thất bại thường xuyên
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}