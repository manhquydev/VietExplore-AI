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
  Globe,
  Monitor,
  Moon,
  Sun,
  Check,
  Mail,
  Clock,
  CheckCircle,
  RefreshCw,
  ChevronRight,
  MapPin,
  Camera,
  Award,
  TrendingUp,
  Heart,
  Calendar
} from "lucide-react"
import { EmailVerificationService } from "@/lib/auth/email-verification"
import { auth } from "@/lib/firebase"
import { User as FirebaseUser, sendEmailVerification } from "firebase/auth"
import { toastService } from "@/lib/ui/toast-service"
import { cn } from "@/lib/utils"

interface EmailVerificationResult {
  success: boolean
  message?: string
  error?: string
}

type SettingsSection = 'profile' | 'security' | 'notifications' | 'appearance' | 'privacy' | 'danger'

export default function SettingsPage() {
  const { user, isAuthenticated } = useAuth()
  const [isSaving, setIsSaving] = React.useState(false)
  const [activeSection, setActiveSection] = React.useState<SettingsSection>('profile')
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

  // Email verification state
  const [firebaseUser, setFirebaseUser] = React.useState<FirebaseUser | null>(null)
  const [isResendingEmail, setIsResendingEmail] = React.useState(false)
  const [emailVerificationMessage, setEmailVerificationMessage] = React.useState('')
  const [canResendEmail, setCanResendEmail] = React.useState(true)
  const [timeUntilCanResend, setTimeUntilCanResend] = React.useState(0)
  const [lastSentTime, setLastSentTime] = React.useState(0)
  const [rateLimitExpiry, setRateLimitExpiry] = React.useState(0)

  // Listen to Firebase Auth state for email verification status
  React.useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((authUser) => {
      setFirebaseUser(authUser)
    })
    return () => unsubscribe()
  }, [])

  // Update resend countdown timer with rate limiting
  React.useEffect(() => {
    const updateTimer = () => {
      const now = Date.now();

      if (rateLimitExpiry > now) {
        const remaining = Math.ceil((rateLimitExpiry - now) / 1000);
        setTimeUntilCanResend(remaining);
        setCanResendEmail(false);
      } else {
        const serviceRemaining = EmailVerificationService.getTimeUntilCanResend();
        const serviceCanSend = EmailVerificationService.canSendVerificationEmail();

        setTimeUntilCanResend(serviceRemaining);
        setCanResendEmail(serviceCanSend && !isResendingEmail);
      }
    }

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [rateLimitExpiry, isResendingEmail])

  const handleSaveSettings = async () => {
    setIsSaving(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      toastService.success("Thành công", "Đã lưu cài đặt của bạn!")
    } catch (error) {
      console.error('Save failed:', error)
      toastService.error("Lỗi", "Không thể lưu cài đặt")
    } finally {
      setIsSaving(false)
    }
  }

  const handleResendEmailVerification = async (): Promise<EmailVerificationResult> => {
    let result: EmailVerificationResult = { success: false, error: "Function not completed" };

    try {
      const user = auth.currentUser;

      if (!user) {
        result = { success: false, error: "Vui lòng đăng nhập để gửi email xác minh" };
        return result;
      }

      if (isResendingEmail) {
        result = { success: false, error: "Đang xử lý yêu cầu trước đó..." };
        return result;
      }

      const now = Date.now();
      if (rateLimitExpiry > now) {
        const remainingSeconds = Math.ceil((rateLimitExpiry - now) / 1000);
        result = {
          success: false,
          error: `Vui lòng đợi ${remainingSeconds} giây trước khi gửi lại email xác minh`
        };
        return result;
      }

      setIsResendingEmail(true);
      setEmailVerificationMessage('');

      await sendEmailVerification(user);

      const sentTime = Date.now();
      setLastSentTime(sentTime);
      setRateLimitExpiry(sentTime + 60000);

      const successMessage = `Email xác minh đã được gửi đến ${user.email}. Vui lòng kiểm tra hộp thư (bao gồm thư mục spam).`;
      setEmailVerificationMessage(successMessage);

      result = { success: true, message: successMessage };
      return result;

    } catch (error: any) {
      let errorMessage = 'Đã có lỗi xảy ra khi gửi email xác minh.';
      let rateLimitDuration = 0;

      if (error?.code === 'auth/too-many-requests') {
        errorMessage = 'Bạn đã gửi quá nhiều yêu cầu xác minh. Vui lòng thử lại sau 5 phút.';
        rateLimitDuration = 5 * 60 * 1000;
        setRateLimitExpiry(Date.now() + rateLimitDuration);
      } else if (error?.code === 'auth/network-request-failed') {
        errorMessage = 'Lỗi kết nối mạng. Vui lòng kiểm tra internet và thử lại.';
      } else if (error?.code === 'auth/user-disabled') {
        errorMessage = 'Tài khoản đã bị vô hiệu hóa. Vui lòng liên hệ hỗ trợ.';
      }

      setEmailVerificationMessage(errorMessage);
      result = { success: false, error: errorMessage };
      return result;

    } finally {
      setIsResendingEmail(false);
    }
  }

  if (!isAuthenticated) {
    redirect('/auth/login')
  }

  // Navigation items
  const navigationItems = [
    { id: 'profile' as SettingsSection, label: 'Thông tin cá nhân', icon: User, color: 'text-primary' },
    { id: 'security' as SettingsSection, label: 'Bảo mật', icon: Shield, color: 'text-indigo-600' },
    { id: 'notifications' as SettingsSection, label: 'Thông báo', icon: Bell, color: 'text-amber-600' },
    { id: 'appearance' as SettingsSection, label: 'Giao diện', icon: Monitor, color: 'text-purple-600' },
    { id: 'privacy' as SettingsSection, label: 'Quyền riêng tư', icon: Eye, color: 'text-emerald-600' },
    { id: 'danger' as SettingsSection, label: 'Vùng nguy hiểm', icon: AlertTriangle, color: 'text-red-600' },
  ]

  // Profile completion calculation
  const calculateProfileCompletion = () => {
    let completed = 0
    const total = 7
    if (user?.fullName) completed++
    if (user?.username) completed++
    if (user?.email) completed++
    if (user?.profile?.bio) completed++
    if (user?.profile?.location) completed++
    if (user?.avatar) completed++
    if (firebaseUser?.emailVerified) completed++
    return Math.round((completed / total) * 100)
  }

  const profileCompletion = calculateProfileCompletion()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-primary/5 to-secondary/5">
      <Header />

      <main className="container py-8">
        {/* Page Header with Stats */}
        <div className="glass-card p-6 md:p-8 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-brand-green to-brand-gold rounded-2xl flex items-center justify-center shadow-lg">
                <Settings className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Cài đặt tài khoản</h1>
                <p className="text-slate-600 mt-1">
                  Quản lý thông tin và tùy chỉnh trải nghiệm của bạn
                </p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="flex items-center gap-4">
              <div className="glass-subtle rounded-xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-700" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-900">{profileCompletion}%</div>
                  <div className="text-xs text-slate-600">Hoàn thiện</div>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Completion Progress Bar */}
          {profileCompletion < 100 && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-700">Hoàn thiện hồ sơ</span>
                <span className="text-sm text-slate-600">{profileCompletion}%</span>
              </div>
              <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-brand-green to-brand-gold transition-all duration-500 ease-out"
                  style={{ width: `${profileCompletion}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation - Desktop */}
          <aside className="hidden lg:block w-72 flex-shrink-0">
            <nav className="glass-card p-4 sticky top-24 space-y-2">
              {navigationItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                    activeSection === item.id
                      ? "bg-gradient-to-r from-green-50 to-amber-50 text-brand-green shadow-sm"
                      : "hover:bg-slate-100/50 text-slate-700"
                  )}
                >
                  <item.icon className={cn("w-5 h-5", activeSection === item.id ? item.color : "text-slate-500")} />
                  <span className="font-medium">{item.label}</span>
                  {activeSection === item.id && (
                    <ChevronRight className="w-4 h-4 ml-auto" />
                  )}
                </button>
              ))}
            </nav>
          </aside>

          {/* Mobile Tab Navigation */}
          <div className="lg:hidden glass-card p-2 mb-4 overflow-x-auto">
            <div className="flex gap-2 min-w-max">
              {navigationItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all duration-200",
                    activeSection === item.id
                      ? "bg-gradient-to-r from-brand-green to-brand-gold text-white shadow-md"
                      : "hover:bg-slate-100 text-slate-700"
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 space-y-6">
            {/* Profile Section */}
            {activeSection === 'profile' && (
              <div className="space-y-6 animate-in fade-in slide-in-up duration-300">
                <div className="glass-card p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <User className="w-5 h-5 text-green-700" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900">Thông tin cá nhân</h2>
                  </div>

                  {/* Avatar Upload Section */}
                  <div className="mb-8 p-6 bg-gradient-to-br from-green-50 to-amber-50 rounded-xl">
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                      <div className="relative group">
                        <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-brand-green to-brand-gold flex items-center justify-center text-3xl text-white font-bold shadow-lg">
                          {user?.fullName?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <button className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <Camera className="w-6 h-6 text-white" />
                        </button>
                      </div>
                      <div className="flex-1 text-center sm:text-left">
                        <h3 className="text-lg font-semibold text-slate-900 mb-1">Ảnh đại diện</h3>
                        <p className="text-sm text-slate-600 mb-3">
                          JPG, PNG hoặc GIF. Tối đa 5MB.
                        </p>
                        <Button size="sm" className="bg-gradient-to-r from-brand-green to-brand-gold hover:from-green-700 hover:to-amber-600 text-white shadow-md">
                          <Camera className="w-4 h-4 mr-2" />
                          Tải ảnh lên
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="fullName" className="text-slate-700 font-medium">Họ và tên *</Label>
                        <Input
                          id="fullName"
                          defaultValue={user?.fullName}
                          placeholder="Nhập họ và tên"
                          className="glass-subtle border-white/20 h-12"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="username" className="text-slate-700 font-medium">Tên người dùng *</Label>
                        <Input
                          id="username"
                          defaultValue={user?.username}
                          placeholder="Nhập tên người dùng"
                          className="glass-subtle border-white/20 h-12"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-slate-700 font-medium">Email *</Label>
                      <div className="relative">
                        <Input
                          id="email"
                          type="email"
                          defaultValue={user?.email}
                          placeholder="Nhập địa chỉ email"
                          className="glass-subtle border-white/20 h-12 pr-24"
                          disabled
                        />
                        {firebaseUser?.emailVerified && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded-full">
                              Đã xác minh
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio" className="text-slate-700 font-medium">Giới thiệu bản thân</Label>
                      <Textarea
                        id="bio"
                        defaultValue={user?.profile?.bio}
                        placeholder="Viết vài dòng về bản thân..."
                        rows={4}
                        className="glass-subtle border-white/20 resize-none"
                      />
                      <p className="text-xs text-slate-500">
                        {user?.profile?.bio?.length || 0}/500 ký tự
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location" className="text-slate-700 font-medium">
                        <MapPin className="w-4 h-4 inline mr-1" />
                        Địa điểm
                      </Label>
                      <Input
                        id="location"
                        defaultValue={user?.profile?.location}
                        placeholder="Thành phố, quốc gia"
                        className="glass-subtle border-white/20 h-12"
                      />
                    </div>
                  </div>
                </div>

                {/* User Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="glass-card p-6 hover:scale-105 transition-transform duration-200">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-rose-100 rounded-lg flex items-center justify-center">
                        <Heart className="w-5 h-5 text-rose-600" />
                      </div>
                      <div className="text-2xl font-bold text-slate-900">0</div>
                    </div>
                    <div className="text-sm text-slate-600">Địa điểm yêu thích</div>
                  </div>

                  <div className="glass-card p-6 hover:scale-105 transition-transform duration-200">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-purple-600" />
                      </div>
                      <div className="text-2xl font-bold text-slate-900">0</div>
                    </div>
                    <div className="text-sm text-slate-600">Lịch trình đã tạo</div>
                  </div>

                  <div className="glass-card p-6 hover:scale-105 transition-transform duration-200">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                        <Award className="w-5 h-5 text-brand-gold" />
                      </div>
                      <div className="text-2xl font-bold text-slate-900">0</div>
                    </div>
                    <div className="text-sm text-slate-600">Đóng góp</div>
                  </div>
                </div>
              </div>
            )}

            {/* Security Section */}
            {activeSection === 'security' && (
              <div className="space-y-6 animate-in fade-in slide-in-up duration-300">
                {/* Email Verification */}
                <div className="glass-card p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center",
                      firebaseUser?.emailVerified ? "bg-green-100" : "bg-amber-100"
                    )}>
                      {firebaseUser?.emailVerified ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <Mail className="w-5 h-5 text-amber-600" />
                      )}
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900">Xác minh Email</h2>
                  </div>

                  <div className={cn(
                    "p-6 rounded-xl border-2",
                    firebaseUser?.emailVerified
                      ? "bg-green-50 border-green-200"
                      : "bg-amber-50 border-amber-200"
                  )}>
                    <div className="flex items-start gap-4">
                      <div className={cn(
                        "p-3 rounded-lg",
                        firebaseUser?.emailVerified ? "bg-green-100" : "bg-amber-100"
                      )}>
                        {firebaseUser?.emailVerified ? (
                          <CheckCircle className="w-6 h-6 text-green-600" />
                        ) : (
                          <Mail className="w-6 h-6 text-amber-600" />
                        )}
                      </div>

                      <div className="flex-1">
                        <h3 className={cn(
                          "text-lg font-semibold mb-2",
                          firebaseUser?.emailVerified ? "text-green-900" : "text-amber-900"
                        )}>
                          {firebaseUser?.emailVerified
                            ? 'Email đã được xác minh'
                            : 'Email chưa được xác minh'
                          }
                        </h3>

                        <p className={cn(
                          "text-sm mb-4",
                          firebaseUser?.emailVerified ? "text-green-700" : "text-amber-700"
                        )}>
                          {firebaseUser?.emailVerified
                            ? `Địa chỉ email ${user?.email} đã được xác minh thành công.`
                            : `Để đảm bảo bảo mật tài khoản, vui lòng xác minh địa chỉ email ${user?.email}.`
                          }
                        </p>

                        {!firebaseUser?.emailVerified && (
                          <div className="space-y-4">
                            {emailVerificationMessage && (
                              <div className={cn(
                                "text-sm p-3 rounded-lg",
                                emailVerificationMessage.includes('thành công') || emailVerificationMessage.includes('gửi')
                                  ? 'text-green-700 bg-green-100 border border-green-200'
                                  : 'text-red-700 bg-red-100 border border-red-200'
                              )}>
                                {emailVerificationMessage}
                              </div>
                            )}

                            <Button
                              onClick={async () => {
                                try {
                                  const result = await handleResendEmailVerification();
                                  if (result.success) {
                                    toastService.success("Thành công", result.message || "Email xác minh đã được gửi!", { duration: 8000 });
                                  } else {
                                    toastService.error("Lỗi", result.error || "Có lỗi xảy ra", { duration: 6000 });
                                  }
                                } catch (error) {
                                  toastService.error("Lỗi", "Đã xảy ra lỗi không mong muốn", { duration: 5000 });
                                }
                              }}
                              disabled={isResendingEmail || !canResendEmail}
                              className={cn(
                                "transition-all shadow-md",
                                isResendingEmail || !canResendEmail
                                  ? 'bg-gray-400 hover:bg-gray-400'
                                  : 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white'
                              )}
                            >
                              {isResendingEmail ? (
                                <>
                                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                  Đang gửi...
                                </>
                              ) : canResendEmail ? (
                                <>
                                  <Mail className="w-4 h-4 mr-2" />
                                  Gửi email xác minh
                                </>
                              ) : (
                                <>
                                  <Clock className="w-4 h-4 mr-2 animate-pulse" />
                                  Đợi {timeUntilCanResend > 60 ? `${Math.ceil(timeUntilCanResend / 60)} phút` : `${timeUntilCanResend} giây`}
                                </>
                              )}
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Change Password */}
                <div className="glass-card p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <Key className="w-5 h-5 text-indigo-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900">Thay đổi mật khẩu</h2>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword" className="text-slate-700 font-medium">Mật khẩu hiện tại</Label>
                      <Input
                        id="currentPassword"
                        type="password"
                        placeholder="Nhập mật khẩu hiện tại"
                        className="glass-subtle border-white/20 h-12"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newPassword" className="text-slate-700 font-medium">Mật khẩu mới</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        placeholder="Nhập mật khẩu mới"
                        className="glass-subtle border-white/20 h-12"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-slate-700 font-medium">Xác nhận mật khẩu mới</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="Nhập lại mật khẩu mới"
                        className="glass-subtle border-white/20 h-12"
                      />
                    </div>
                    <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md">
                      <Key className="w-4 h-4 mr-2" />
                      Cập nhật mật khẩu
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Section */}
            {activeSection === 'notifications' && (
              <div className="glass-card p-8 animate-in fade-in slide-in-up duration-300">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                    <Bell className="w-5 h-5 text-amber-700" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">Thông báo</h2>
                </div>

                <div className="space-y-4">
                  {[
                    { key: 'email' as const, label: 'Thông báo qua email', desc: 'Nhận email về hoạt động quan trọng', gradient: 'from-purple-500 to-pink-500' },
                    { key: 'push' as const, label: 'Thông báo đẩy', desc: 'Nhận thông báo trên trình duyệt', gradient: 'from-blue-500 to-cyan-500' },
                    { key: 'marketing' as const, label: 'Email marketing', desc: 'Nhận thông tin về tính năng mới', gradient: 'from-green-500 to-emerald-500' },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between p-5 glass-subtle rounded-xl hover:shadow-md transition-all duration-200">
                      <div className="space-y-1">
                        <Label className="text-slate-900 font-medium">{item.label}</Label>
                        <p className="text-sm text-slate-600">{item.desc}</p>
                      </div>
                      <Switch
                        checked={notifications[item.key]}
                        onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, [item.key]: checked }))}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Appearance Section */}
            {activeSection === 'appearance' && (
              <div className="space-y-6 animate-in fade-in slide-in-up duration-300">
                <div className="glass-card p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Monitor className="w-5 h-5 text-purple-700" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900">Giao diện & Ngôn ngữ</h2>
                  </div>

                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="language" className="text-slate-700 font-medium">
                          <Globe className="w-4 h-4 inline mr-1" />
                          Ngôn ngữ
                        </Label>
                        <Select defaultValue="vi">
                          <SelectTrigger className="glass-subtle border-white/20 h-12">
                            <SelectValue placeholder="Chọn ngôn ngữ" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="vi">🇻🇳 Tiếng Việt</SelectItem>
                            <SelectItem value="en">🇺🇸 English</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="timezone" className="text-slate-700 font-medium">Múi giờ</Label>
                        <Select defaultValue="asia/ho_chi_minh">
                          <SelectTrigger className="glass-subtle border-white/20 h-12">
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

                    <div className="space-y-3">
                      <Label className="text-slate-700 font-medium">Chủ đề giao diện</Label>
                      <div className="grid grid-cols-3 gap-4">
                        {[
                          { value: 'light', label: 'Sáng', icon: Sun },
                          { value: 'dark', label: 'Tối', icon: Moon },
                          { value: 'system', label: 'Tự động', icon: Monitor }
                        ].map(({ value, label, icon: Icon }) => (
                          <button
                            key={value}
                            onClick={() => setTheme(value)}
                            className={cn(
                              "p-6 rounded-xl border-2 transition-all duration-200 hover:scale-105",
                              theme === value
                                ? 'border-green-600 bg-green-50 shadow-lg'
                                : 'border-white/20 glass-subtle hover:border-green-300'
                            )}
                          >
                            <Icon className={cn(
                              "w-8 h-8 mx-auto mb-3",
                              theme === value ? 'text-green-700' : 'text-slate-600'
                            )} />
                            <div className={cn(
                              "text-sm font-medium",
                              theme === value ? 'text-green-900' : 'text-slate-700'
                            )}>
                              {label}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Privacy Section */}
            {activeSection === 'privacy' && (
              <div className="glass-card p-8 animate-in fade-in slide-in-up duration-300">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <Shield className="w-5 h-5 text-emerald-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">Quyền riêng tư</h2>
                </div>

                <div className="space-y-4">
                  {[
                    { key: 'profileVisible' as const, label: 'Hiển thị hồ sơ công khai', desc: 'Cho phép người khác xem hồ sơ của bạn' },
                    { key: 'showStats' as const, label: 'Hiển thị thống kê đóng góp', desc: 'Hiển thị số lượng địa điểm và lịch trình đã tạo' },
                    { key: 'allowMessages' as const, label: 'Cho phép tin nhắn', desc: 'Người dùng khác có thể gửi tin nhắn cho bạn' },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between p-5 glass-subtle rounded-xl hover:shadow-md transition-all duration-200">
                      <div className="space-y-1">
                        <Label className="text-slate-900 font-medium">{item.label}</Label>
                        <p className="text-sm text-slate-600">{item.desc}</p>
                      </div>
                      <Switch
                        checked={privacy[item.key]}
                        onCheckedChange={(checked) => setPrivacy(prev => ({ ...prev, [item.key]: checked }))}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Danger Zone */}
            {activeSection === 'danger' && (
              <div className="glass-card p-8 border-2 border-red-200/50 animate-in fade-in slide-in-up duration-300">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-red-700">Vùng nguy hiểm</h2>
                </div>

                <div className="p-6 bg-red-50/50 rounded-xl border border-red-200/50">
                  <h3 className="font-medium text-red-900 mb-2">Xóa tài khoản</h3>
                  <p className="text-sm text-red-700 mb-4">
                    Hành động này không thể hoàn tác. Tất cả dữ liệu của bạn sẽ bị xóa vĩnh viễn.
                  </p>
                  <Button
                    variant="destructive"
                    className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white shadow-md"
                  >
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Xóa tài khoản vĩnh viễn
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Floating Save Button */}
        <div className="fixed bottom-8 right-8 z-40">
          <div className="glass-card p-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <Button
                variant="secondary"
                className="glass-subtle"
                onClick={() => window.location.reload()}
              >
                Hủy bỏ
              </Button>
              <Button
                onClick={handleSaveSettings}
                disabled={isSaving}
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg"
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Lưu thay đổi
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

// Missing Eye import - add to imports
function Eye(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}
