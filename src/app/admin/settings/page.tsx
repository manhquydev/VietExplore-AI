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
  CheckCircle,
  Layout,
  Upload,
  Image as ImageIcon,
  X
} from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import { cn } from "@/lib/utils"
import { useSystemSettings, useHomepageSettings } from "@/hooks/use-admin"

export default function AdminSettingsPage() {
  const { user } = useAuth()
  const { 
    settings, 
    loading: settingsLoading, 
    saving, 
    updateSettings, 
    updateSetting 
  } = useSystemSettings()
  
  const {
    homepageSettings,
    loading: homepageLoading,
    saving: homepageSaving,
    uploading,
    saveHomepageSettings,
    uploadRegionImage,
    updateRegionSettings
  } = useHomepageSettings()
  
  const [saved, setSaved] = React.useState(false)
  const [homepageSaved, setHomepageSaved] = React.useState(false)
  const fileInputRefs = React.useRef<{[key: string]: HTMLInputElement | null}>({})
  
  const handleHomepageSave = async () => {
    const result = await saveHomepageSettings(homepageSettings)
    if (result.success) {
      setHomepageSaved(true)
      setTimeout(() => setHomepageSaved(false), 3000)
    } else {
      console.error('Failed to save homepage settings:', result.error)
    }
  }

  const handleImageUpload = async (region: string, file: File) => {
    const result = await uploadRegionImage(region, file)
    if (result.success) {
      // Image URL is automatically updated by the hook
      console.log('Image uploaded successfully:', result.imageUrl)
    } else {
      console.error('Failed to upload image:', result.error)
      alert(`Lỗi khi tải ảnh lên: ${result.error}`)
    }
  }

  const handleFileSelect = (region: string) => {
    fileInputRefs.current[region]?.click()
  }

  const handleFileChange = (region: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        alert('Chỉ hỗ trợ file JPG, PNG, WebP')
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        alert('File quá lớn (tối đa 5MB)')
        return
      }
      handleImageUpload(region, file)
    }
  }

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
            <span>Lưu cài đặt</span>
          </>
        )}
      </Button>
    </div>
  )

  return (
    <div className="min-h-screen bg-neutral-50">
      
      {/* Modern Header Section */}
      <div className="relative px-4 md:px-6 lg:px-8 pt-6 pb-8">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 via-info-500/3 to-warning-500/5 rounded-b-3xl"></div>
        
        <div className="relative max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 bg-gradient-to-br from-primary-600 to-warning-700 rounded-2xl flex items-center justify-center shadow-lg">
                  <SettingsIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold text-neutral-900 tracking-tight">
                    Cài đặt Hệ thống
                  </h1>
                  <p className="text-neutral-600 mt-1">
                    Cấu hình và tùy chỉnh nền tảng theo yêu cầu
                  </p>
                </div>
              </div>
            </div>
            
            {/* Quick Actions Card */}
            <div className="bg-white/80 backdrop-blur-sm border border-neutral-200/50 rounded-xl px-6 py-4 shadow-lg">
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
        <div className="bg-white/60 backdrop-blur-sm border border-neutral-200/50 rounded-2xl p-2 shadow-lg">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 bg-transparent gap-2">
            <TabsTrigger 
              value="general" 
              className="group flex items-center gap-2 px-4 py-3 rounded-xl transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary-600 data-[state=active]:to-primary-700 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-neutral-100"
            >
              <SettingsIcon className="w-4 h-4 group-data-[state=active]:text-white text-neutral-600" />
              <span className="hidden sm:inline font-medium">Tổng quan</span>
            </TabsTrigger>
            <TabsTrigger 
              value="moderation" 
              className="group flex items-center gap-2 px-4 py-3 rounded-xl transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-success-600 data-[state=active]:to-success-700 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-neutral-100"
            >
              <Shield className="w-4 h-4 group-data-[state=active]:text-white text-neutral-600" />
              <span className="hidden sm:inline font-medium">Kiểm duyệt</span>
            </TabsTrigger>
            <TabsTrigger 
              value="notifications" 
              className="group flex items-center gap-2 px-4 py-3 rounded-xl transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-info-600 data-[state=active]:to-info-700 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-neutral-100"
            >
              <Bell className="w-4 h-4 group-data-[state=active]:text-white text-neutral-600" />
              <span className="hidden sm:inline font-medium">Thông báo</span>
            </TabsTrigger>
            <TabsTrigger 
              value="security" 
              className="group flex items-center gap-2 px-4 py-3 rounded-xl transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-danger-600 data-[state=active]:to-red-600 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-neutral-100"
            >
              <Database className="w-4 h-4 group-data-[state=active]:text-white text-neutral-600" />
              <span className="hidden sm:inline font-medium">Bảo mật</span>
            </TabsTrigger>
            <TabsTrigger 
              value="homepage" 
              className="group flex items-center gap-2 px-4 py-3 rounded-xl transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-neutral-100"
            >
              <Layout className="w-4 h-4 group-data-[state=active]:text-white text-neutral-600" />
              <span className="hidden sm:inline font-medium">Giao diện</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="general" className="space-y-6">
          <Card className="relative overflow-hidden bg-white/80 backdrop-blur-sm border border-neutral-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 via-transparent to-primary-600/5"></div>
            <CardHeader className="relative pb-6">
              <CardTitle className="flex items-center gap-3">
                <div className="h-10 w-10 bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl flex items-center justify-center shadow-md">
                  <SettingsIcon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900">Cấu hình Trang web</h3>
                  <p className="text-sm text-neutral-600">Thông tin cơ bản về nền tảng</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="relative space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="siteName" className="text-sm font-semibold text-neutral-700 flex items-center gap-2">
                    Tên trang web
                    <Badge variant="outline" className="text-xs">Bắt buộc</Badge>
                  </Label>
                  <Input
                    id="siteName"
                    value={settings.general.siteName}
                    onChange={(e) => handleSettingChange('general', 'siteName', e.target.value)}
                    className="focus:ring-2 focus:ring-primary-500 focus:border-primary-500 border-neutral-300 bg-white/80 backdrop-blur-sm"
                    placeholder="Nhập tên trang web của bạn"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="siteDescription" className="text-sm font-semibold text-neutral-700">Mô tả trang web</Label>
                  <Textarea
                    id="siteDescription"
                    value={settings.general.siteDescription}
                    onChange={(e) => handleSettingChange('general', 'siteDescription', e.target.value)}
                    rows={3}
                    className="focus:ring-2 focus:ring-primary-500 focus:border-primary-500 border-neutral-300 bg-white/80 backdrop-blur-sm resize-none"
                    placeholder="Mô tả ngắn gọn về trang web và mục đích sử dụng"
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="relative group p-6 bg-gradient-to-r from-danger-50/50 to-red-50/50 border border-danger-200/50 rounded-2xl hover:shadow-md transition-all duration-300">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-danger-600 to-red-600 rounded-lg flex items-center justify-center shadow-sm">
                          <AlertTriangle className="h-4 w-4 text-white" />
                        </div>
                        <Label className="text-sm font-semibold text-neutral-900">Chế độ Bảo trì</Label>
                      </div>
                      <p className="text-sm text-neutral-600 ml-11">
                        Tạm thời vô hiệu hóa truy cập công khai để thực hiện bảo trì hệ thống
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={settings.general.maintenanceMode}
                        onCheckedChange={(checked) => handleSettingChange('general', 'maintenanceMode', checked)}
                        className="data-[state=checked]:bg-red-600"
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

                <div className="relative group p-6 bg-gradient-to-r from-success-50/50 to-green-50/50 border border-success-200/50 rounded-2xl hover:shadow-md transition-all duration-300">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-success-600 to-green-600 rounded-lg flex items-center justify-center shadow-sm">
                          <Users className="h-4 w-4 text-white" />
                        </div>
                        <Label className="text-sm font-semibold text-neutral-900">Đăng ký Người dùng</Label>
                      </div>
                      <p className="text-sm text-neutral-600 ml-11">
                        Cho phép người dùng mới tạo tài khoản và tham gia nền tảng
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={settings.general.registrationEnabled}
                        onCheckedChange={(checked) => handleSettingChange('general', 'registrationEnabled', checked)}
                        className="data-[state=checked]:bg-green-600"
                      />
                      {!settings.general.registrationEnabled && (
                        <Badge variant="outline" className="text-warning-700 border-warning-300 bg-warning-50">
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
          <Card className="relative overflow-hidden bg-white/80 backdrop-blur-sm border border-neutral-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-info-500/5 via-transparent to-info-600/5"></div>
            <CardHeader className="relative pb-6">
              <CardTitle className="flex items-center gap-3">
                <div className="h-10 w-10 bg-gradient-to-br from-info-600 to-info-700 rounded-xl flex items-center justify-center shadow-md">
                  <Bell className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900">Cài đặt Thông báo</h3>
                  <p className="text-sm text-neutral-600">Quản lý các loại thông báo hệ thống</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="relative space-y-6">
              <div className="space-y-4">
                <div className="relative group p-6 bg-gradient-to-r from-info-50/50 to-blue-50/50 border border-info-200/50 rounded-2xl hover:shadow-md transition-all duration-300">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-info-600 to-blue-600 rounded-lg flex items-center justify-center shadow-sm">
                          <Mail className="h-4 w-4 text-white" />
                        </div>
                        <Label className="text-sm font-semibold text-neutral-900">Thông báo Email</Label>
                      </div>
                      <p className="text-sm text-neutral-600 ml-11">
                        Gửi thông báo email cho các sự kiện quan trọng và cập nhật
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={settings.notifications.emailNotifications}
                        onCheckedChange={(checked) => handleSettingChange('notifications', 'emailNotifications', checked)}
                        className="data-[state=checked]:bg-blue-600"
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

        <TabsContent value="homepage" className="space-y-6">
          <Card className="relative overflow-hidden bg-white/80 backdrop-blur-sm border border-neutral-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-indigo-600/5"></div>
            <CardHeader className="relative pb-6">
              <CardTitle className="flex items-center gap-3">
                <div className="h-10 w-10 bg-gradient-to-br from-purple-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-md">
                  <Layout className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900">Cài đặt Giao diện Homepage</h3>
                  <p className="text-sm text-neutral-600">Tùy chỉnh ảnh và nội dung phần "Ba miền Việt Nam"</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="relative space-y-8">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <h4 className="text-lg font-semibold text-neutral-900">Ảnh ba miền</h4>
                  <p className="text-sm text-neutral-600">
                    Tùy chỉnh ảnh đại diện cho từng vùng miền trên trang chủ
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Button 
                    onClick={handleHomepageSave} 
                    disabled={homepageSaving}
                    className={cn(
                      "transition-all duration-200 min-w-[140px]",
                      homepageSaved ? "bg-green-600 hover:bg-green-700 shadow-lg" : "hover:shadow-md"
                    )}
                  >
                    {homepageSaving ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        <span>Đang lưu...</span>
                      </>
                    ) : homepageSaved ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2 animate-pulse" />
                        <span>Đã lưu</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        <span>Lưu giao diện</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <div className="grid gap-8">
                {Object.entries(homepageSettings.regions).map(([regionKey, region]) => (
                  <div key={regionKey} className="group relative p-6 bg-gradient-to-r from-gray-50/50 to-white/50 border border-neutral-200/50 rounded-2xl hover:shadow-md transition-all duration-300">
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Image Upload Section */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h5 className="font-semibold text-neutral-900 capitalize">
                            {region.name}
                          </h5>
                          <Badge variant="outline" className="text-xs">
                            {regionKey}
                          </Badge>
                        </div>
                        
                        <div className="relative group/image">
                          <div className="aspect-[4/3] relative overflow-hidden rounded-xl border-2 border-dashed border-neutral-300 group-hover/image:border-purple-400 transition-colors">
                            {region.imageUrl ? (
                              <img
                                src={region.imageUrl}
                                alt={region.name}
                                className="w-full h-full object-cover rounded-xl"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-neutral-100 rounded-xl">
                                <ImageIcon className="w-12 h-12 text-neutral-400" />
                              </div>
                            )}
                            
                            {/* Upload overlay */}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/image:opacity-100 transition-opacity flex items-center justify-center rounded-xl">
                              <Button
                                onClick={() => handleFileSelect(regionKey)}
                                disabled={uploading === regionKey}
                                variant="secondary"
                                className="bg-white/90 hover:bg-white text-gray-900"
                              >
                                {uploading === regionKey ? (
                                  <>
                                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                    Đang tải...
                                  </>
                                ) : (
                                  <>
                                    <Upload className="w-4 h-4 mr-2" />
                                    Thay đổi ảnh
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>

                          {/* Hidden file input */}
                          <input
                            ref={(el) => fileInputRefs.current[regionKey] = el}
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileChange(regionKey, e)}
                            className="hidden"
                          />
                        </div>

                        <div className="text-xs text-neutral-500 space-y-1">
                          <p>• Kích thước khuyến nghị: 800x500px</p>
                          <p>• Định dạng: JPG, PNG, WebP (tối đa 5MB)</p>
                          <p>• Ảnh sẽ được tự động tối ưu hóa</p>
                        </div>
                      </div>

                      {/* Content Settings */}
                      <div className="space-y-4">
                        <div className="space-y-3">
                          <Label htmlFor={`${regionKey}-name`} className="text-sm font-semibold text-neutral-700">
                            Tên miền
                          </Label>
                          <Input
                            id={`${regionKey}-name`}
                            value={region.name}
                            onChange={(e) => updateRegionSettings(regionKey, { name: e.target.value })}
                            className="focus:ring-2 focus:ring-purple-500 focus:border-purple-500 border-neutral-300 bg-white/80 backdrop-blur-sm"
                            placeholder="Nhập tên miền"
                          />
                        </div>

                        <div className="space-y-3">
                          <Label htmlFor={`${regionKey}-description`} className="text-sm font-semibold text-neutral-700">
                            Mô tả
                          </Label>
                          <Textarea
                            id={`${regionKey}-description`}
                            value={region.description}
                            onChange={(e) => updateRegionSettings(regionKey, { description: e.target.value })}
                            rows={3}
                            className="focus:ring-2 focus:ring-purple-500 focus:border-purple-500 border-neutral-300 bg-white/80 backdrop-blur-sm resize-none"
                            placeholder="Nhập mô tả cho miền này"
                          />
                        </div>

                        <div className="space-y-3">
                          <Label className="text-sm font-semibold text-neutral-700">
                            URL ảnh hiện tại
                          </Label>
                          <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200">
                            <p className="text-xs text-neutral-600 break-all font-mono">
                              {region.imageUrl || 'Chưa có ảnh'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-400 rounded-r-lg p-4 flex items-start gap-3 shadow-sm">
                <Info className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
                <div className="text-sm">
                  <p className="font-semibold text-blue-900">Lưu ý quan trọng</p>
                  <p className="text-blue-800 mt-1 leading-relaxed">
                    Thay đổi ảnh sẽ có hiệu lực ngay lập tức trên trang chủ. Hãy đảm bảo ảnh có chất lượng tốt và phù hợp với nội dung của từng vùng miền.
                  </p>
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