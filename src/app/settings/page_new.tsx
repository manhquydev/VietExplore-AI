"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useAuth } from "@/components/auth/auth-provider"
import { redirect } from "next/navigation"
import {
  User,
  Shield,
  Bell,
  Settings,
  AlertTriangle,
  Save,
  Key,
  Monitor,
  Moon,
  Sun
} from "lucide-react"

export default function SettingsPage() {
  const { user, isAuthenticated } = useAuth()
  const [isSaving, setIsSaving] = React.useState(false)
  const [notifications, setNotifications] = React.useState({
    email: true,
    push: false,
    marketing: false
  })
  const [privacy, setPrivacy] = React.useState({
    profileVisible: true,
    showStats: true,
    allowMessages: true
  })
  const [theme, setTheme] = React.useState('system')

  const handleSaveSettings = async () => {
    setIsSaving(true)
    try {
      // TODO: Save to API
      await new Promise(resolve => setTimeout(resolve, 1500))
    } catch (error) {
      console.error('Save failed:', error)
    } finally {
      setIsSaving(false)
    }
  }

  if (!isAuthenticated) {
    redirect('/auth/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50/50 to-teal-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Header />
      
      <main className="container py-8 max-w-4xl">
        {/* Header */}
        <div className="glass-card p-8 mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-sky-100 dark:bg-sky-900/30 rounded-2xl flex items-center justify-center">
              <Settings className="w-6 h-6 text-sky-600 dark:text-sky-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Cài đặt tài khoản</h1>
              <p className="text-slate-600 dark:text-slate-300 mt-1">
                Quản lý thông tin cá nhân và tùy chỉnh trải nghiệm của bạn
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Profile Settings */}
          <div className="glass-card p-8">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
              <User className="w-6 h-6 text-sky-600 dark:text-sky-400" />
              Thông tin cá nhân
            </h2>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="fullName" className="text-slate-700 dark:text-slate-300">Họ và tên</Label>
                  <Input
                    id="fullName"
                    defaultValue={user?.fullName}
                    placeholder="Nhập họ và tên"
                    className="glass-subtle border-white/20 dark:border-slate-700/50"
                  />
                </div>
                <div>
                  <Label htmlFor="username" className="text-slate-700 dark:text-slate-300">Tên người dùng</Label>
                  <Input
                    id="username"
                    defaultValue={user?.username}
                    placeholder="Nhập tên người dùng"
                    className="glass-subtle border-white/20 dark:border-slate-700/50"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="email" className="text-slate-700 dark:text-slate-300">Email</Label>
                <Input
                  id="email"
                  type="email"
                  defaultValue={user?.email}
                  placeholder="Nhập địa chỉ email"
                  className="glass-subtle border-white/20 dark:border-slate-700/50"
                />
              </div>
              
              <div>
                <Label htmlFor="bio" className="text-slate-700 dark:text-slate-300">Giới thiệu bản thân</Label>
                <Textarea
                  id="bio"
                  defaultValue={user?.profile?.bio}
                  placeholder="Viết vài dòng về bản thân..."
                  rows={3}
                  className="glass-subtle border-white/20 dark:border-slate-700/50"
                />
              </div>
              
              <div>
                <Label htmlFor="location" className="text-slate-700 dark:text-slate-300">Địa điểm</Label>
                <Input
                  id="location"
                  defaultValue={user?.profile?.location}
                  placeholder="Thành phố, quốc gia"
                  className="glass-subtle border-white/20 dark:border-slate-700/50"
                />
              </div>
            </div>
          </div>

          {/* Privacy Settings */}
          <div className="glass-card p-8">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
              <Shield className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              Quyền riêng tư
            </h2>
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 glass-subtle rounded-xl">
                <div className="space-y-1">
                  <Label className="text-slate-900 dark:text-white">Hiển thị hồ sơ công khai</Label>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Cho phép người khác xem hồ sơ của bạn</p>
                </div>
                <Switch
                  checked={privacy.profileVisible}
                  onCheckedChange={(checked) => setPrivacy(prev => ({ ...prev, profileVisible: checked }))}
                  className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-sky-500 data-[state=checked]:to-teal-500"
                />
              </div>
              
              <div className="flex items-center justify-between p-4 glass-subtle rounded-xl">
                <div className="space-y-1">
                  <Label className="text-slate-900 dark:text-white">Hiển thị thống kê đóng góp</Label>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Hiển thị số lượng địa điểm và lịch trình đã tạo</p>
                </div>
                <Switch
                  checked={privacy.showStats}
                  onCheckedChange={(checked) => setPrivacy(prev => ({ ...prev, showStats: checked }))}
                  className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-sky-500 data-[state=checked]:to-teal-500"
                />
              </div>
              
              <div className="flex items-center justify-between p-4 glass-subtle rounded-xl">
                <div className="space-y-1">
                  <Label className="text-slate-900 dark:text-white">Cho phép tin nhắn</Label>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Người dùng khác có thể gửi tin nhắn cho bạn</p>
                </div>
                <Switch
                  checked={privacy.allowMessages}
                  onCheckedChange={(checked) => setPrivacy(prev => ({ ...prev, allowMessages: checked }))}
                  className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-sky-500 data-[state=checked]:to-teal-500"
                />
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="glass-card p-8">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
              <Bell className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              Thông báo
            </h2>
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 glass-subtle rounded-xl">
                <div className="space-y-1">
                  <Label className="text-slate-900 dark:text-white">Thông báo qua email</Label>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Nhận email về hoạt động quan trọng</p>
                </div>
                <Switch
                  checked={notifications.email}
                  onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, email: checked }))}
                  className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-purple-500 data-[state=checked]:to-pink-500"
                />
              </div>
              
              <div className="flex items-center justify-between p-4 glass-subtle rounded-xl">
                <div className="space-y-1">
                  <Label className="text-slate-900 dark:text-white">Thông báo đẩy</Label>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Nhận thông báo trên trình duyệt</p>
                </div>
                <Switch
                  checked={notifications.push}
                  onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, push: checked }))}
                  className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-purple-500 data-[state=checked]:to-pink-500"
                />
              </div>
              
              <div className="flex items-center justify-between p-4 glass-subtle rounded-xl">
                <div className="space-y-1">
                  <Label className="text-slate-900 dark:text-white">Email marketing</Label>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Nhận thông tin về tính năng mới và cập nhật</p>
                </div>
                <Switch
                  checked={notifications.marketing}
                  onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, marketing: checked }))}
                  className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-purple-500 data-[state=checked]:to-pink-500"
                />
              </div>
            </div>
          </div>

          {/* Appearance & Language Settings */}
          <div className="glass-card p-8">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
              <Monitor className="w-6 h-6 text-violet-600 dark:text-violet-400" />
              Giao diện & Ngôn ngữ
            </h2>
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="language" className="text-slate-700 dark:text-slate-300">Ngôn ngữ</Label>
                  <Select defaultValue="vi">
                    <SelectTrigger className="glass-subtle border-white/20 dark:border-slate-700/50">
                      <SelectValue placeholder="Chọn ngôn ngữ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vi">🇻🇳 Tiếng Việt</SelectItem>
                      <SelectItem value="en">🇺🇸 English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="timezone" className="text-slate-700 dark:text-slate-300">Múi giờ</Label>
                  <Select defaultValue="asia/ho_chi_minh">
                    <SelectTrigger className="glass-subtle border-white/20 dark:border-slate-700/50">
                      <SelectValue placeholder="Chọn múi giờ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="asia/ho_chi_minh">Việt Nam (UTC+7)</SelectItem>
                      <SelectItem value="asia/bangkok">Bangkok (UTC+7)</SelectItem>
                      <SelectItem value="asia/singapore">Singapore (UTC+8)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label className="text-slate-700 dark:text-slate-300 mb-3 block">Chủ đề giao diện</Label>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { value: 'light', label: 'Sáng', icon: Sun },
                    { value: 'dark', label: 'Tối', icon: Moon },
                    { value: 'system', label: 'Tự động', icon: Monitor }
                  ].map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      onClick={() => setTheme(value)}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        theme === value
                          ? 'border-sky-500 bg-sky-50 dark:bg-sky-900/20'
                          : 'border-white/20 dark:border-slate-700/50 glass-subtle hover:border-sky-300'
                      }`}
                    >
                      <Icon className={`w-6 h-6 mx-auto mb-2 ${
                        theme === value ? 'text-sky-600' : 'text-slate-600 dark:text-slate-400'
                      }`} />
                      <div className={`text-sm font-medium ${
                        theme === value ? 'text-sky-900 dark:text-sky-100' : 'text-slate-700 dark:text-slate-300'
                      }`}>
                        {label}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Account Security */}
          <div className="glass-card p-8">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                <Key className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              </div>
              Bảo mật tài khoản
            </h2>
            <div className="space-y-6">
              <h3 className="font-medium text-slate-900 dark:text-white">Thay đổi mật khẩu</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="currentPassword" className="text-slate-700 dark:text-slate-300">Mật khẩu hiện tại</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    placeholder="Nhập mật khẩu hiện tại"
                    className="glass-subtle border-white/20 dark:border-slate-700/50"
                  />
                </div>
                <div>
                  <Label htmlFor="newPassword" className="text-slate-700 dark:text-slate-300">Mật khẩu mới</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="Nhập mật khẩu mới"
                    className="glass-subtle border-white/20 dark:border-slate-700/50"
                  />
                </div>
                <div>
                  <Label htmlFor="confirmPassword" className="text-slate-700 dark:text-slate-300">Xác nhận mật khẩu mới</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Nhập lại mật khẩu mới"
                    className="glass-subtle border-white/20 dark:border-slate-700/50"
                  />
                </div>
                <Button className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white">
                  <Key className="w-4 h-4 mr-2" />
                  Cập nhật mật khẩu
                </Button>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="glass-card p-8 border-2 border-red-200/50 dark:border-red-800/50">
            <h2 className="text-xl font-bold text-red-700 dark:text-red-400 mb-6 flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
              Vùng nguy hiểm
            </h2>
            <div className="p-6 bg-red-50/50 dark:bg-red-900/20 rounded-xl border border-red-200/50 dark:border-red-800/50">
              <h3 className="font-medium text-red-900 dark:text-red-100 mb-2">Xóa tài khoản</h3>
              <p className="text-sm text-red-700 dark:text-red-300 mb-4">
                Hành động này không thể hoàn tác. Tất cả dữ liệu của bạn sẽ bị xóa vĩnh viễn.
              </p>
              <Button 
                variant="danger"
                className="bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white"
              >
                <AlertTriangle className="w-4 h-4 mr-2" />
                Xóa tài khoản vĩnh viễn
              </Button>
            </div>
          </div>

          {/* Save Actions */}
          <div className="glass-card p-6">
            <div className="flex justify-end gap-4">
              <Button variant="secondary" className="glass-subtle">
                Hủy bỏ
              </Button>
              <Button 
                onClick={handleSaveSettings}
                loading={isSaving}
                className="bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-600 hover:to-teal-600 text-white"
              >
                <Save className="w-4 h-4 mr-2" />
                Lưu thay đổi
              </Button>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}
