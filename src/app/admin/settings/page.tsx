"use client"

export const dynamic = 'force-dynamic'

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
      console.log('[AdminSettings] Image uploaded and saved successfully:', result.imageUrl)
      // Show success notification
      alert(`✅ Thành công!\n\nẢnh đã được tải lên và lưu vào hệ thống.\n\nThay đổi sẽ có hiệu lực ngay lập tức trên trang chủ.`)
    } else {
      console.error('[AdminSettings] Failed to upload image:', result.error)
      alert(`❌ Lỗi!\n\n${result.error}\n\nVui lòng thử lại hoặc liên hệ quản trị viên.`)
    }
  }

  const handleFileSelect = (region: string) => {
    fileInputRefs.current[region]?.click()
  }

  const handleFileChange = (region: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
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

  const handleSettingChange = async (section: string, key: string, value: any) => {
    const result = await updateSetting(section, key, value)
    if (result?.success) {
      // Auto-save individual settings
      console.log('Setting updated:', result.message)
    } else {
      console.error('Failed to update setting:', result?.error)
      alert(`Lỗi: ${result?.error}`)
    }
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
    <Button 
      onClick={handleSave} 
      disabled={saving}
      className={cn(
        "transition-all duration-200",
        saved ? "bg-green-600 hover:bg-green-700" : ""
      )}
    >
      {saving ? (
        <>
          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
          Đang lưu...
        </>
      ) : saved ? (
        <>
          <CheckCircle className="w-4 h-4 mr-2" />
          Đã lưu
        </>
      ) : (
        <>
          <Save className="w-4 h-4 mr-2" />
          Lưu cài đặt
        </>
      )}
    </Button>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* Clean Header - giống Analytics */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Cài đặt Hệ thống</h1>
              <div className="mt-1 text-sm text-gray-600">
                Cấu hình và quản lý các tùy chỉnh hệ thống
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {actions}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - giống Analytics */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {settingsLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3">
              <RefreshCw className="h-5 w-5 animate-spin text-blue-600" />
              <span className="text-gray-600">Đang tải cài đặt...</span>
            </div>
          </div>
        ) : (
        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-white border border-gray-200 p-1">
            <TabsTrigger 
              value="general" 
              className="text-gray-700 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
            >
              <SettingsIcon className="h-4 w-4 mr-2" />
              Tổng quan
            </TabsTrigger>
            <TabsTrigger 
              value="moderation" 
              className="text-gray-700 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
            >
              <Shield className="h-4 w-4 mr-2" />
              Kiểm duyệt
            </TabsTrigger>
            <TabsTrigger 
              value="notifications" 
              className="text-gray-700 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
            >
              <Bell className="h-4 w-4 mr-2" />
              Thông báo
            </TabsTrigger>
            <TabsTrigger 
              value="security" 
              className="text-gray-700 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
            >
              <Database className="h-4 w-4 mr-2" />
              Bảo mật
            </TabsTrigger>
            <TabsTrigger 
              value="homepage" 
              className="text-gray-700 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
            >
              <Layout className="h-4 w-4 mr-2" />
              Giao diện
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Cấu hình Trang web</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="siteName" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      Tên trang web
                      <Badge variant="outline" className="text-xs">Bắt buộc</Badge>
                    </Label>
                    <Input
                      id="siteName"
                      value={settings?.general?.siteName || 'Du Lịch Việt AI'}
                      onChange={(e) => handleSettingChange('general', 'siteName', e.target.value)}
                      placeholder="Nhập tên trang web của bạn"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="siteDescription" className="text-sm font-medium text-gray-700">Mô tả trang web</Label>
                    <Textarea
                      id="siteDescription"
                      value={settings?.general?.siteDescription || 'Discover beautiful địa điểm across Vietnam with AI-powered recommendations'}
                      onChange={(e) => handleSettingChange('general', 'siteDescription', e.target.value)}
                      rows={3}
                      className="resize-none"
                      placeholder="Mô tả ngắn gọn về trang web và mục đích sử dụng"
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                      <div>
                        <div className="flex items-center gap-2">
                          <Label className="text-sm font-medium text-gray-900">Chế độ Bảo trì</Label>
                          <Badge variant="outline" className="text-xs text-green-700 border-green-300 bg-green-50">Hoạt động</Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          Tạm thời vô hiệu hóa truy cập công khai để thực hiện bảo trì hệ thống
                        </p>
                        <p className="text-xs text-green-700 font-medium mt-1">
                          ✅ Kết nối với middleware và database thực
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={settings?.general?.maintenanceMode || false}
                        onCheckedChange={(checked) => handleSettingChange('general', 'maintenanceMode', checked)}
                        className="data-[state=checked]:bg-red-600"
                      />
                      {settings?.general?.maintenanceMode && (
                        <Badge variant="destructive" className="animate-pulse">
                          <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
                          Đang bảo trì
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Users className="h-5 w-5 text-green-600" />
                      <div>
                        <div className="flex items-center gap-2">
                          <Label className="text-sm font-medium text-gray-900">Đăng ký Người dùng</Label>
                          <Badge variant="outline" className="text-xs text-green-700 border-green-300 bg-green-50">Hoạt động</Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          Cho phép người dùng mới tạo tài khoản và tham gia nền tảng
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={settings?.general?.registrationEnabled ?? true}
                        onCheckedChange={(checked) => handleSettingChange('general', 'registrationEnabled', checked)}
                        className="data-[state=checked]:bg-green-600"
                      />
                      {!settings?.general?.registrationEnabled && (
                        <Badge variant="outline" className="text-amber-700 border-amber-300 bg-amber-50">
                          Đã tắt
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="moderation" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Cài đặt kiểm duyệt nội dung</CardTitle>
                  <Badge variant="outline" className="text-xs text-green-700 border-green-300 bg-green-50">Hoạt động</Badge>
                </div>
                <p className="text-sm text-gray-600 mt-2">Kết nối với API và database thực</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="queueSize">Giới hạn kích thước hàng đợi</Label>
                    <Input
                      id="queueSize"
                      type="number"
                      value={settings?.moderation?.moderationQueueSize || 50}
                      onChange={(e) => handleSettingChange('moderation', 'moderationQueueSize', parseInt(e.target.value))}
                    />
                    <p className="text-xs text-gray-500">Maximum items in moderation queue</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="escalationThreshold">Ngưỡng leo thang (giờ)</Label>
                    <Input
                      id="escalationThreshold"
                      type="number"
                      value={settings?.moderation?.escalationThreshold || 72}
                      onChange={(e) => handleSettingChange('moderation', 'escalationThreshold', parseInt(e.target.value))}
                    />
                    <p className="text-xs text-gray-500">Auto-escalate after this many hours</p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="space-y-1">
                      <Label>Tự động phê duyệt cho đối tác</Label>
                      <p className="text-sm text-gray-600">
                        Automatically approve content from verified partners
                      </p>
                    </div>
                    <Switch
                      checked={settings?.moderation?.partnerAutoApproval ?? true}
                      onCheckedChange={(checked) => handleSettingChange('moderation', 'partnerAutoApproval', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="space-y-1">
                      <Label>Tự động phê duyệt chung</Label>
                      <p className="text-sm text-gray-600">
                        Automatically approve content from all contributors
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={settings?.moderation?.autoApprovalEnabled || false}
                        onCheckedChange={(checked) => handleSettingChange('moderation', 'autoApprovalEnabled', checked)}
                      />
                      {!settings?.moderation?.autoApprovalEnabled && (
                        <Badge variant="outline">Recommended</Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
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
                <div className="flex items-center justify-between">
                  <CardTitle>Cài đặt Thông báo</CardTitle>
                  <Badge variant="outline" className="text-xs text-green-700 border-green-300 bg-green-50">Hoạt động</Badge>
                </div>
                <p className="text-sm text-gray-600 mt-2">Quản lý các loại thông báo hệ thống với API thực</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-blue-600" />
                    <div>
                      <Label className="text-sm font-medium text-gray-900">Thông báo Email</Label>
                      <p className="text-sm text-gray-600">
                        Gửi thông báo email cho các sự kiện quan trọng và cập nhật
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={settings?.notifications?.emailNotifications ?? true}
                    onCheckedChange={(checked) => handleSettingChange('notifications', 'emailNotifications', checked)}
                    className="data-[state=checked]:bg-blue-600"
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="space-y-1">
                    <Label>Thông báo đẩy</Label>
                    <p className="text-sm text-gray-600">
                      Browser push notifications for real-time alerts
                    </p>
                  </div>
                  <Switch
                    checked={settings?.notifications?.pushNotifications ?? true}
                    onCheckedChange={(checked) => handleSettingChange('notifications', 'pushNotifications', checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="space-y-1">
                    <Label>Tóm tắt hàng ngày</Label>
                    <p className="text-sm text-gray-600">
                      Daily summary of platform activity
                    </p>
                  </div>
                  <Switch
                    checked={settings?.notifications?.dailyDigest ?? true}
                    onCheckedChange={(checked) => handleSettingChange('notifications', 'dailyDigest', checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="space-y-1">
                    <Label>Cảnh báo kiểm duyệt</Label>
                    <p className="text-sm text-gray-600">
                      Immediate alerts for items requiring attention
                    </p>
                  </div>
                  <Switch
                    checked={settings?.notifications?.moderationAlerts ?? true}
                    onCheckedChange={(checked) => handleSettingChange('notifications', 'moderationAlerts', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Cài đặt bảo mật</CardTitle>
                  <Badge variant="outline" className="text-xs text-green-700 border-green-300 bg-green-50">Hoạt động</Badge>
                </div>
                <p className="text-sm text-gray-600 mt-2">Cấu hình bảo mật và xác thực với API thực</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="sessionTimeout">Hết thời gian phiên (phút)</Label>
                    <Input
                      id="sessionTimeout"
                      type="number"
                      value={settings?.security?.sessionTimeout || 60}
                      onChange={(e) => handleSettingChange('security', 'sessionTimeout', parseInt(e.target.value))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxLoginAttempts">Số lần đăng nhập tối đa</Label>
                    <Input
                      id="maxLoginAttempts"
                      type="number"
                      value={settings?.security?.maxLoginAttempts || 5}
                      onChange={(e) => handleSettingChange('security', 'maxLoginAttempts', parseInt(e.target.value))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="passwordMinLength">Độ dài mật khẩu tối thiểu</Label>
                    <Input
                      id="passwordMinLength"
                      type="number"
                      value={settings?.security?.passwordMinLength || 8}
                      onChange={(e) => handleSettingChange('security', 'passwordMinLength', parseInt(e.target.value))}
                    />
                  </div>
                </div>

                <Separator />

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="space-y-1">
                    <Label>Xác thực hai yếu tố</Label>
                    <p className="text-sm text-gray-600">
                      Require 2FA for admin accounts
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={settings?.security?.twoFactorEnabled || false}
                      onCheckedChange={(checked) => handleSettingChange('security', 'twoFactorEnabled', checked)}
                    />
                    {!settings?.security?.twoFactorEnabled && (
                      <Badge variant="destructive">Bị vô hiệu</Badge>
                    )}
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
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
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="homepage" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Cài đặt Giao diện Homepage</CardTitle>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-xs text-green-700 border-green-300 bg-green-50">Hoạt động</Badge>
                    <Button 
                      onClick={handleHomepageSave} 
                      disabled={homepageSaving}
                      className={cn(
                        "transition-all duration-200",
                        homepageSaved ? "bg-green-600 hover:bg-green-700" : ""
                      )}
                    >
                      {homepageSaving ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Đang lưu...
                        </>
                      ) : homepageSaved ? (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Đã lưu
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Lưu giao diện
                        </>
                      )}
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Tùy chỉnh ảnh và nội dung phần "Ba miền Việt Nam".
                  <span className="font-semibold text-green-600"> Ảnh sẽ được lưu tự động ngay sau khi tải lên.</span>
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6">
                  {Object.entries(homepageSettings.regions).map(([regionKey, region]) => (
                    <div key={regionKey} className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                      <div className="grid md:grid-cols-2 gap-6">
                        {/* Image Upload Section */}
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h5 className="font-semibold text-gray-900 capitalize">
                              {region.name}
                            </h5>
                            <Badge variant="outline" className="text-xs">
                              {regionKey}
                            </Badge>
                          </div>
                          
                          <div className="relative group/image">
                            <div className="aspect-[4/3] relative overflow-hidden rounded-lg border-2 border-dashed border-gray-300 group-hover/image:border-blue-400 transition-colors">
                              {region.imageUrl ? (
                                <img
                                  src={region.imageUrl}
                                  alt={region.name}
                                  className="w-full h-full object-cover rounded-lg"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
                                  <ImageIcon className="w-12 h-12 text-gray-400" />
                                </div>
                              )}
                              
                              {/* Upload overlay */}
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/image:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
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

                          <div className="text-xs text-gray-500 space-y-1">
                            <p>• Kích thước khuyến nghị: 800x500px</p>
                            <p>• Định dạng: JPG, PNG, WebP (tối đa 5MB)</p>
                            <p>• Ảnh sẽ được tự động tối ưu hóa</p>
                          </div>
                        </div>

                        {/* Content Settings */}
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor={`${regionKey}-name`} className="text-sm font-medium text-gray-700">
                              Tên miền
                            </Label>
                            <Input
                              id={`${regionKey}-name`}
                              value={region.name}
                              onChange={(e) => updateRegionSettings(regionKey, { name: e.target.value })}
                              placeholder="Nhập tên miền"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor={`${regionKey}-description`} className="text-sm font-medium text-gray-700">
                              Mô tả
                            </Label>
                            <Textarea
                              id={`${regionKey}-description`}
                              value={region.description}
                              onChange={(e) => updateRegionSettings(regionKey, { description: e.target.value })}
                              rows={3}
                              className="resize-none"
                              placeholder="Nhập mô tả cho miền này"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700">
                              URL ảnh hiện tại
                            </Label>
                            <div className="p-3 bg-gray-100 rounded-lg border border-gray-200">
                              <p className="text-xs text-gray-600 break-all font-mono">
                                {region.imageUrl || 'Chưa có ảnh'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                  <Info className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
                  <div className="text-sm">
                    <p className="font-semibold text-blue-900">Hướng dẫn sử dụng</p>
                    <ul className="text-blue-800 mt-2 space-y-2 list-disc list-inside leading-relaxed">
                      <li><strong>Thay đổi ảnh:</strong> Chọn ảnh mới → Hệ thống tự động tải lên và lưu ngay lập tức</li>
                      <li><strong>Thay đổi tên/mô tả:</strong> Chỉnh sửa text → Nhấn nút "Lưu giao diện" ở góc trên</li>
                      <li><strong>Hiệu lực:</strong> Tất cả thay đổi sẽ xuất hiện ngay trên trang chủ sau vài giây</li>
                      <li><strong>Khuyến nghị ảnh:</strong> Kích thước 800x500px, định dạng JPG/PNG/WebP, dung lượng dưới 5MB</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        )}
      </div>
    </div>
  )
}