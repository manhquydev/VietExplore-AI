"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card-custom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useAuth } from "@/components/auth/auth-provider"
import { Icon } from "@/components/ui/icon"
import { redirect } from "next/navigation"

export default function SettingsPage() {
  const { user, isAuthenticated } = useAuth()
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

  if (!isAuthenticated) {
    redirect('/auth/login')
  }

  return (
    <div className="min-h-screen bg-bg text-text">
      <Header />
      
      <div className="container mx-auto py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text">Cài đặt tài khoản</h1>
          <p className="text-muted mt-2">
            Quản lý thông tin cá nhân và tùy chỉnh trải nghiệm của bạn
          </p>
        </div>

        <div className="space-y-8">
          {/* Profile Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="user" />
                Thông tin cá nhân
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="fullName">Họ và tên</Label>
                  <Input
                    id="fullName"
                    defaultValue={user?.fullName}
                    placeholder="Nhập họ và tên"
                  />
                </div>
                <div>
                  <Label htmlFor="username">Tên người dùng</Label>
                  <Input
                    id="username"
                    defaultValue={user?.username}
                    placeholder="Nhập tên người dùng"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  defaultValue={user?.email}
                  placeholder="Nhập địa chỉ email"
                />
              </div>
              
              <div>
                <Label htmlFor="bio">Giới thiệu bản thân</Label>
                <textarea
                  id="bio"
                  className="w-full min-h-[100px] px-3 py-2 border border-border rounded-md bg-bg text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  defaultValue={user?.profile?.bio}
                  placeholder="Viết vài dòng về bản thân..."
                />
              </div>
              
              <div>
                <Label htmlFor="location">Địa điểm</Label>
                <Input
                  id="location"
                  defaultValue={user?.profile?.location}
                  placeholder="Thành phố, quốc gia"
                />
              </div>
            </CardContent>
          </Card>

          {/* Privacy Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="shield" />
                Quyền riêng tư
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Hiển thị hồ sơ công khai</Label>
                  <p className="text-sm text-muted">Cho phép người khác xem hồ sơ của bạn</p>
                </div>
                <Switch
                  checked={privacy.profileVisible}
                  onCheckedChange={(checked) => setPrivacy(prev => ({ ...prev, profileVisible: checked }))}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Hiển thị thống kê đóng góp</Label>
                  <p className="text-sm text-muted">Hiển thị số lượng địa điểm và lịch trình đã tạo</p>
                </div>
                <Switch
                  checked={privacy.showStats}
                  onCheckedChange={(checked) => setPrivacy(prev => ({ ...prev, showStats: checked }))}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Cho phép tin nhắn</Label>
                  <p className="text-sm text-muted">Người dùng khác có thể gửi tin nhắn cho bạn</p>
                </div>
                <Switch
                  checked={privacy.allowMessages}
                  onCheckedChange={(checked) => setPrivacy(prev => ({ ...prev, allowMessages: checked }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="alert" />
                Thông báo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Thông báo qua email</Label>
                  <p className="text-sm text-muted">Nhận email về hoạt động quan trọng</p>
                </div>
                <Switch
                  checked={notifications.email}
                  onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, email: checked }))}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Thông báo đẩy</Label>
                  <p className="text-sm text-muted">Nhận thông báo trên trình duyệt</p>
                </div>
                <Switch
                  checked={notifications.push}
                  onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, push: checked }))}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email marketing</Label>
                  <p className="text-sm text-muted">Nhận thông tin về tính năng mới và cập nhật</p>
                </div>
                <Switch
                  checked={notifications.marketing}
                  onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, marketing: checked }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Account Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="settings" />
                Tài khoản
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="language">Ngôn ngữ</Label>
                <Select defaultValue="vi">
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn ngôn ngữ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vi">Tiếng Việt</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="timezone">Múi giờ</Label>
                <Select defaultValue="asia/ho_chi_minh">
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn múi giờ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asia/ho_chi_minh">Việt Nam (UTC+7)</SelectItem>
                    <SelectItem value="asia/bangkok">Bangkok (UTC+7)</SelectItem>
                    <SelectItem value="asia/singapore">Singapore (UTC+8)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-4 border-t border-border">
                <h4 className="font-medium text-text mb-4">Thay đổi mật khẩu</h4>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="currentPassword">Mật khẩu hiện tại</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      placeholder="Nhập mật khẩu hiện tại"
                    />
                  </div>
                  <div>
                    <Label htmlFor="newPassword">Mật khẩu mới</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      placeholder="Nhập mật khẩu mới"
                    />
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Nhập lại mật khẩu mới"
                    />
                  </div>
                  <Button className="w-full">Cập nhật mật khẩu</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-700">
                <Icon name="alert-triangle" />
                Vùng nguy hiểm
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium text-text mb-2">Xóa tài khoản</h4>
                <p className="text-sm text-muted mb-4">
                  Hành động này không thể hoàn tác. Tất cả dữ liệu của bạn sẽ bị xóa vĩnh viễn.
                </p>
                <Button variant="destructive">
                  Xóa tài khoản vĩnh viễn
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Save Actions */}
          <div className="flex justify-end gap-4">
            <Button variant="outline">Hủy bỏ</Button>
            <Button>Lưu thay đổi</Button>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  )
}

