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
    <div className="min-h-screen bg-gradient-to-br from-admin-neutral-50 via-white to-admin-primary-50/20">
      
      {/* Modern Header Section */}
      <div className="relative px-4 md:px-6 lg:px-8 pt-6 pb-8">
        <div className="absolute inset-0 bg-gradient-to-r from-admin-primary-500/5 via-admin-info-500/3 to-admin-warning-500/5 rounded-b-3xl"></div>
        
        <div className="relative max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 bg-gradient-to-br from-admin-primary-600 to-admin-warning-700 rounded-2xl flex items-center justify-center shadow-lg">
                  <SettingsIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold text-admin-neutral-900 tracking-tight">
                    Cài đặt Hệ thống
                  </h1>
                  <p className="text-admin-neutral-600 mt-1">
                    Cấu hình và tùy chỉnh nền tảng theo yêu cầu
                  </p>
                </div>
              </div>
            </div>
            
            {/* Quick Actions Card */}
            <div className="bg-white/80 backdrop-blur-sm border border-admin-neutral-200/50 rounded-xl px-6 py-4 shadow-lg">
              <div className="flex items-center gap-4">
                {actions}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 space-y-8">
      <Tabs defaultValue="general" className="space-y-8">
        <div className="bg-white/60 backdrop-blur-sm border border-admin-neutral-200/50 rounded-2xl p-2 shadow-lg">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 bg-transparent gap-2">
            <TabsTrigger 
              value="general" 
              className="group flex items-center gap-2 px-4 py-3 rounded-xl transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-admin-primary-600 data-[state=active]:to-admin-primary-700 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-admin-neutral-100/50"
            >
              <SettingsIcon className="w-4 h-4 group-data-[state=active]:text-white text-admin-neutral-600" />
              <span className="hidden sm:inline font-medium">Tổng quan</span>
            </TabsTrigger>
            <TabsTrigger 
              value="moderation" 
              className="group flex items-center gap-2 px-4 py-3 rounded-xl transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-admin-success-600 data-[state=active]:to-admin-success-700 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-admin-neutral-100/50"
            >
              <Shield className="w-4 h-4 group-data-[state=active]:text-white text-admin-neutral-600" />
              <span className="hidden sm:inline font-medium">Kiểm duyệt</span>
            </TabsTrigger>
            <TabsTrigger 
              value="notifications" 
              className="group flex items-center gap-2 px-4 py-3 rounded-xl transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-admin-info-600 data-[state=active]:to-admin-info-700 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-admin-neutral-100/50"
            >
              <Bell className="w-4 h-4 group-data-[state=active]:text-white text-admin-neutral-600" />
              <span className="hidden sm:inline font-medium">Thông báo</span>
            </TabsTrigger>
            <TabsTrigger 
              value="security" 
              className="group flex items-center gap-2 px-4 py-3 rounded-xl transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-admin-error-600 data-[state=active]:to-red-600 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-admin-neutral-100/50"
            >
              <Database className="w-4 h-4 group-data-[state=active]:text-white text-admin-neutral-600" />
              <span className="hidden sm:inline font-medium">Bảo mật</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="general" className="space-y-6">
          <Card className="relative overflow-hidden bg-white/80 backdrop-blur-sm border border-admin-neutral-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-admin-primary-500/5 via-transparent to-admin-primary-600/5"></div>
            <CardHeader className="relative pb-6">
              <CardTitle className="flex items-center gap-3">
                <div className="h-10 w-10 bg-gradient-to-br from-admin-primary-600 to-admin-primary-700 rounded-xl flex items-center justify-center shadow-md">
                  <SettingsIcon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-admin-neutral-900">Cấu hình Trang web</h3>
                  <p className="text-sm text-admin-neutral-600">Thông tin cơ bản về nền tảng</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="relative space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="siteName" className="text-sm font-semibold text-admin-neutral-700 flex items-center gap-2">
                    Tên trang web
                    <Badge variant="outline" className="text-xs">Bắt buộc</Badge>
                  </Label>
                  <Input
                    id="siteName"
                    value={settings.general.siteName}
                    onChange={(e) => handleSettingChange('general', 'siteName', e.target.value)}
                    className="focus:ring-2 focus:ring-admin-primary-500 focus:border-admin-primary-500 border-admin-neutral-300 bg-white/80 backdrop-blur-sm"
                    placeholder="Nhập tên trang web của bạn"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="siteDescription" className="text-sm font-semibold text-admin-neutral-700">Mô tả trang web</Label>
                  <Textarea
                    id="siteDescription"
                    value={settings.general.siteDescription}
                    onChange={(e) => handleSettingChange('general', 'siteDescription', e.target.value)}
                    rows={3}
                    className="focus:ring-2 focus:ring-admin-primary-500 focus:border-admin-primary-500 border-admin-neutral-300 bg-white/80 backdrop-blur-sm resize-none"
                    placeholder="Mô tả ngắn gọn về trang web và mục đích sử dụng"
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="relative group p-6 bg-gradient-to-r from-admin-error-50/50 to-red-50/50 border border-admin-error-200/50 rounded-2xl hover:shadow-md transition-all duration-300">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-admin-error-600 to-red-600 rounded-lg flex items-center justify-center shadow-sm">
                          <AlertTriangle className="h-4 w-4 text-white" />
                        </div>
                        <Label className="text-sm font-semibold text-admin-neutral-900">Chế độ Bảo trì</Label>
                      </div>
                      <p className="text-sm text-admin-neutral-600 ml-11">
                        Tạm thời vô hiệu hóa truy cập công khai để thực hiện bảo trì hệ thống
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={settings.general.maintenanceMode}
                        onCheckedChange={(checked) => handleSettingChange('general', 'maintenanceMode', checked)}
                        className="data-[state=checked]:bg-admin-error-600"
                      />
                      {settings.general.maintenanceMode && (
                        <Badge variant="destructive" className="animate-pulse shadow-sm">
                          <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
                          Đang bảo trì
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className="relative group p-6 bg-gradient-to-r from-admin-success-50/50 to-green-50/50 border border-admin-success-200/50 rounded-2xl hover:shadow-md transition-all duration-300">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-admin-success-600 to-green-600 rounded-lg flex items-center justify-center shadow-sm">
                          <Users className="h-4 w-4 text-white" />
                        </div>
                        <Label className="text-sm font-semibold text-admin-neutral-900">Đăng ký Người dùng</Label>
                      </div>
                      <p className="text-sm text-admin-neutral-600 ml-11">
                        Cho phép người dùng mới tạo tài khoản và tham gia nền tảng
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={settings.general.registrationEnabled}
                        onCheckedChange={(checked) => handleSettingChange('general', 'registrationEnabled', checked)}
                        className="data-[state=checked]:bg-admin-success-600"
                      />
                      {!settings.general.registrationEnabled && (
                        <Badge variant="outline" className="text-admin-warning-700 border-admin-warning-300 bg-admin-warning-50">
                          Đã tắt
                        </Badge>
                      )}
                    </div>
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
          <Card className="relative overflow-hidden bg-white/80 backdrop-blur-sm border border-admin-neutral-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-admin-info-500/5 via-transparent to-admin-info-600/5"></div>
            <CardHeader className="relative pb-6">
              <CardTitle className="flex items-center gap-3">
                <div className="h-10 w-10 bg-gradient-to-br from-admin-info-600 to-admin-info-700 rounded-xl flex items-center justify-center shadow-md">
                  <Bell className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-admin-neutral-900">Cài đặt Thông báo</h3>
                  <p className="text-sm text-admin-neutral-600">Quản lý các loại thông báo hệ thống</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="relative space-y-6">
              <div className="space-y-4">
                <div className="relative group p-6 bg-gradient-to-r from-admin-info-50/50 to-blue-50/50 border border-admin-info-200/50 rounded-2xl hover:shadow-md transition-all duration-300">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-admin-info-600 to-blue-600 rounded-lg flex items-center justify-center shadow-sm">
                          <Mail className="h-4 w-4 text-white" />
                        </div>
                        <Label className="text-sm font-semibold text-admin-neutral-900">Thông báo Email</Label>
                      </div>
                      <p className="text-sm text-admin-neutral-600 ml-11">
                        Gửi thông báo email cho các sự kiện quan trọng và cập nhật
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={settings.notifications.emailNotifications}
                        onCheckedChange={(checked) => handleSettingChange('notifications', 'emailNotifications', checked)}
                        className="data-[state=checked]:bg-admin-info-600"
                      />
                    </div>
                  </div>
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
      
      {/* Bottom padding */}
      <div className="pb-8"></div>
      </div>
    </div>
  )
}