"use client"

export const dynamic = 'force-dynamic'

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
  Calendar,
  Loader2
} from "lucide-react"
import { EmailVerificationService } from "@/lib/auth/email-verification"
import { auth } from "@/lib/firebase"
import {
  User as FirebaseUser,
  sendEmailVerification,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  deleteUser,
  GoogleAuthProvider,
  reauthenticateWithPopup
} from "firebase/auth"
import { toastService } from "@/lib/ui/toast-service"
import { validateImageFile } from "@/lib/client/firebase-storage"
import { cn } from "@/lib/utils"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface EmailVerificationResult {
  success: boolean
  message?: string
  error?: string
}

type SettingsSection = 'profile' | 'security' | 'notifications' | 'appearance' | 'privacy' | 'danger'

export default function SettingsPage() {
  const { user, isAuthenticated, updateUser } = useAuth()
  const [isSaving, setIsSaving] = React.useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = React.useState(false)
  const [avatarPreview, setAvatarPreview] = React.useState<string | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)
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

  // Password change state
  const [passwordData, setPasswordData] = React.useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [isChangingPassword, setIsChangingPassword] = React.useState(false)

  // Delete account state
  const [deleteAccountOpen, setDeleteAccountOpen] = React.useState(false)
  const [deletePasswordConfirm, setDeletePasswordConfirm] = React.useState('')
  const [isDeletingAccount, setIsDeletingAccount] = React.useState(false)

  // Form data state
  const [formData, setFormData] = React.useState({
    fullName: user?.fullName || "",
    bio: user?.profile?.bio || "",
    location: user?.profile?.location || "",
    website: user?.profile?.website || ""
  })

  // Update form data when user changes
  React.useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || "",
        bio: user.profile?.bio || "",
        location: user.profile?.location || "",
        website: user.profile?.website || ""
      })
    }
  }, [user])

  // Email verification state
  const [firebaseUser, setFirebaseUser] = React.useState<FirebaseUser | null>(null)
  const [isResendingEmail, setIsResendingEmail] = React.useState(false)
  const [emailVerificationMessage, setEmailVerificationMessage] = React.useState('')
  const [canResendEmail, setCanResendEmail] = React.useState(true)
  const [timeUntilCanResend, setTimeUntilCanResend] = React.useState(0)
  const [lastSentTime, setLastSentTime] = React.useState(0)
  const [rateLimitExpiry, setRateLimitExpiry] = React.useState(0)

  // Check login provider (Google vs Email/Password)
  const isPasswordProvider = React.useMemo(() => {
    return firebaseUser?.providerData.some(provider => provider.providerId === 'password') ?? false
  }, [firebaseUser])

  const isGoogleProvider = React.useMemo(() => {
    return firebaseUser?.providerData.some(provider => provider.providerId === 'google.com') ?? false
  }, [firebaseUser])

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

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file
    const validation = validateImageFile(file)
    if (!validation.valid) {
      toastService.error('File không hợp lệ', validation.error || 'Vui lòng chọn file ảnh hợp lệ')
      return
    }

    // Show preview
    const previewUrl = URL.createObjectURL(file)
    setAvatarPreview(previewUrl)

    // Upload avatar
    await uploadAvatar(file)
  }

  const uploadAvatar = async (file: File) => {
    setIsUploadingAvatar(true)
    try {
      const token = await auth.currentUser?.getIdToken()
      if (!token) {
        throw new Error('Không tìm thấy token xác thực')
      }

      const formDataUpload = new FormData()
      formDataUpload.append('avatar', file)

      const response = await fetch('/api/users/avatar', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataUpload
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Không thể tải lên ảnh')
      }

      // Update user context with new avatar
      updateUser({
        avatar: result.avatarUrl
      })

      // Clear preview
      setAvatarPreview(null)

      toastService.success('Thành công', 'Cập nhật ảnh đại diện thành công')
    } catch (error: any) {
      console.error('Avatar upload error:', error)
      toastService.error('Lỗi tải ảnh', error.message || 'Không thể tải lên ảnh đại diện')
      setAvatarPreview(null)
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  const handleSaveSettings = async () => {
    setIsSaving(true)
    try {
      const token = await auth.currentUser?.getIdToken()
      if (!token) {
        throw new Error('Không tìm thấy token xác thực')
      }

      const response = await fetch('/api/users/profile', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          profile: {
            bio: formData.bio,
            location: formData.location,
            website: formData.website
          }
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Không thể cập nhật profile')
      }

      // Update user context
      updateUser({
        fullName: formData.fullName,
        profile: {
          ...user?.profile,
          bio: formData.bio,
          location: formData.location,
          website: formData.website
        }
      })

      toastService.success("Thành công", "Đã lưu cài đặt của bạn!")
    } catch (error: any) {
      console.error('Save failed:', error)
      toastService.error("Lỗi", error.message || "Không thể lưu cài đặt")
    } finally {
      setIsSaving(false)
    }
  }

  const getInitials = (name: string | undefined, email: string | undefined) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase();
    }
    if (email) {
      return email[0].toUpperCase();
    }
    return 'U';
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

  const handleChangePassword = async () => {
    // Validation
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toastService.error('Lỗi', 'Vui lòng điền đầy đủ thông tin')
      return
    }

    if (passwordData.newPassword.length < 6) {
      toastService.error('Lỗi', 'Mật khẩu mới phải có ít nhất 6 ký tự')
      return
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toastService.error('Lỗi', 'Mật khẩu xác nhận không khớp')
      return
    }

    if (passwordData.currentPassword === passwordData.newPassword) {
      toastService.error('Lỗi', 'Mật khẩu mới phải khác mật khẩu hiện tại')
      return
    }

    setIsChangingPassword(true)

    try {
      const currentUser = auth.currentUser
      if (!currentUser || !currentUser.email) {
        throw new Error('Không tìm thấy thông tin người dùng')
      }

      // Re-authenticate user with current password
      const credential = EmailAuthProvider.credential(
        currentUser.email,
        passwordData.currentPassword
      )

      await reauthenticateWithCredential(currentUser, credential)

      // Update password
      await updatePassword(currentUser, passwordData.newPassword)

      // Clear form
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })

      toastService.success('Thành công', 'Đã cập nhật mật khẩu thành công!')

    } catch (error: any) {
      console.error('Change password error:', error)

      let errorMessage = 'Không thể thay đổi mật khẩu'

      if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        errorMessage = 'Mật khẩu hiện tại không đúng'
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Mật khẩu mới quá yếu'
      } else if (error.code === 'auth/requires-recent-login') {
        errorMessage = 'Vui lòng đăng nhập lại để thay đổi mật khẩu'
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Lỗi kết nối mạng. Vui lòng thử lại'
      } else if (error.message) {
        errorMessage = error.message
      }

      toastService.error('Lỗi', errorMessage)

    } finally {
      setIsChangingPassword(false)
    }
  }

  const handleDeleteAccount = async () => {
    setIsDeletingAccount(true)

    try {
      const currentUser = auth.currentUser
      if (!currentUser || !currentUser.email) {
        throw new Error('Không tìm thấy thông tin người dùng')
      }

      // Re-authenticate based on provider type
      if (isGoogleProvider && !isPasswordProvider) {
        // Google user: Re-authenticate with popup
        const provider = new GoogleAuthProvider()
        await reauthenticateWithPopup(currentUser, provider)
      } else if (isPasswordProvider) {
        // Email/Password user: Re-authenticate with password
        if (!deletePasswordConfirm) {
          toastService.error('Lỗi', 'Vui lòng nhập mật khẩu để xác nhận')
          return
        }

        const credential = EmailAuthProvider.credential(
          currentUser.email,
          deletePasswordConfirm
        )

        await reauthenticateWithCredential(currentUser, credential)
      } else {
        throw new Error('Không xác định được phương thức đăng nhập')
      }

      // Call API to cleanup user data (places, reviews, etc.)
      try {
        const token = await currentUser.getIdToken()
        const response = await fetch('/api/users/delete-account', {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        if (!response.ok) {
          const result = await response.json()
          throw new Error(result.error || 'Không thể xóa dữ liệu tài khoản')
        }
      } catch (apiError: any) {
        console.error('Delete account API error:', apiError)
        // Continue with auth deletion even if API fails (user data cleanup can be handled later)
      }

      // Delete Firebase Auth user
      await deleteUser(currentUser)

      toastService.success('Thành công', 'Tài khoản đã được xóa vĩnh viễn')

      // Redirect to home
      setTimeout(() => {
        window.location.href = '/'
      }, 1500)

    } catch (error: any) {
      console.error('Delete account error:', error)

      let errorMessage = 'Không thể xóa tài khoản'

      // Handle popup cancelled
      if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
        // User cancelled, just close dialog silently
        setIsDeletingAccount(false)
        setDeleteAccountOpen(false)
        setDeletePasswordConfirm('')
        return
      }

      // Handle other errors
      if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        errorMessage = 'Mật khẩu không đúng'
      } else if (error.code === 'auth/requires-recent-login') {
        errorMessage = 'Vui lòng đăng nhập lại để xóa tài khoản'
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Lỗi kết nối mạng. Vui lòng thử lại'
      } else if (error.code === 'auth/popup-blocked') {
        errorMessage = 'Popup bị chặn. Vui lòng cho phép popup từ trang này'
      } else if (error.message) {
        errorMessage = error.message
      }

      toastService.error('Lỗi', errorMessage)

    } finally {
      setIsDeletingAccount(false)
      setDeleteAccountOpen(false)
      setDeletePasswordConfirm('')
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
                      <div className="relative">
                        <Avatar className="w-24 h-24 ring-4 ring-brand-green/20 shadow-lg">
                          <AvatarImage src={avatarPreview || user?.avatar} alt={user?.fullName || "User Avatar"} />
                          <AvatarFallback className="text-3xl bg-gradient-to-r from-brand-green to-brand-gold text-white">
                            {getInitials(user?.fullName, user?.email)}
                          </AvatarFallback>
                        </Avatar>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/jpeg,image/jpg,image/png,image/webp"
                          onChange={handleAvatarChange}
                          className="hidden"
                        />
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={handleAvatarClick}
                          disabled={isUploadingAvatar}
                          className="absolute -bottom-2 -right-2 h-10 w-10 p-0 rounded-full bg-white hover:bg-gray-50 border-2 border-brand-green/20 shadow-lg disabled:opacity-50"
                        >
                          {isUploadingAvatar ? (
                            <Loader2 className="w-5 h-5 text-brand-green animate-spin" />
                          ) : (
                            <Camera className="w-5 h-5 text-brand-green" />
                          )}
                        </Button>
                      </div>
                      <div className="flex-1 text-center sm:text-left">
                        <h3 className="text-lg font-semibold text-slate-900 mb-1">Ảnh đại diện</h3>
                        <p className="text-sm text-slate-600 mb-3">
                          JPG, PNG, WebP. Tối đa 5MB. Sẽ tự động resize thành 400x400px.
                        </p>
                        <Button
                          size="sm"
                          onClick={handleAvatarClick}
                          disabled={isUploadingAvatar}
                          className="bg-gradient-to-r from-brand-green to-brand-gold hover:from-green-700 hover:to-amber-600 text-white shadow-md disabled:opacity-50"
                        >
                          {isUploadingAvatar ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Đang tải lên...
                            </>
                          ) : (
                            <>
                              <Camera className="w-4 h-4 mr-2" />
                              Tải ảnh lên
                            </>
                          )}
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
                          value={formData.fullName}
                          onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                          placeholder="Nhập họ và tên"
                          className="glass-subtle border-white/20 h-12"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="username" className="text-slate-700 font-medium">Tên người dùng *</Label>
                        <Input
                          id="username"
                          value={user?.username || ""}
                          placeholder="Nhập tên người dùng"
                          className="glass-subtle border-white/20 h-12"
                          disabled
                        />
                        <p className="text-xs text-slate-500">Username không thể thay đổi</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-slate-700 font-medium">Email *</Label>
                      <div className="relative">
                        <Input
                          id="email"
                          type="email"
                          value={user?.email || ""}
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
                      <p className="text-xs text-slate-500">Email không thể thay đổi</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio" className="text-slate-700 font-medium">Giới thiệu bản thân</Label>
                      <Textarea
                        id="bio"
                        value={formData.bio}
                        onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                        placeholder="Viết vài dòng về bản thân..."
                        rows={4}
                        maxLength={500}
                        className="glass-subtle border-white/20 resize-none"
                      />
                      <p className="text-xs text-slate-500">
                        {formData.bio?.length || 0}/500 ký tự
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="location" className="text-slate-700 font-medium">
                          <MapPin className="w-4 h-4 inline mr-1" />
                          Địa điểm
                        </Label>
                        <Input
                          id="location"
                          value={formData.location}
                          onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                          placeholder="Thành phố, quốc gia"
                          className="glass-subtle border-white/20 h-12"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="website" className="text-slate-700 font-medium">
                          <Globe className="w-4 h-4 inline mr-1" />
                          Website
                        </Label>
                        <Input
                          id="website"
                          value={formData.website}
                          onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                          placeholder="https://yourwebsite.com"
                          className="glass-subtle border-white/20 h-12"
                        />
                      </div>
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
                  <div className="mb-8">
                    <div className="flex items-baseline gap-3 mb-2">
                      <h2 className="text-2xl font-bold text-slate-900">Thay đổi mật khẩu</h2>
                      <span className="text-sm text-slate-500">Bảo mật tài khoản</span>
                    </div>
                    <div className="h-1 w-20 bg-gradient-to-r from-brand-green to-brand-gold rounded-full"></div>
                  </div>

                  {/* Google Login Info */}
                  {isGoogleProvider && !isPasswordProvider && (
                    <div className="relative p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 mb-6 overflow-hidden">
                      {/* Subtle pattern overlay */}
                      <div className="absolute inset-0 opacity-[0.03]" style={{
                        backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)',
                        backgroundSize: '32px 32px'
                      }}></div>

                      <div className="relative">
                        <div className="mb-4">
                          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/80 backdrop-blur-sm rounded-full border border-blue-200">
                            <span className="text-xs font-medium text-blue-900">Đăng nhập Google</span>
                          </div>
                        </div>
                        <p className="text-slate-700 mb-3 leading-relaxed">
                          Tài khoản của bạn được quản lý bởi Google. Mật khẩu và bảo mật được xử lý thông qua hệ thống Google Authentication.
                        </p>
                        <p className="text-sm text-slate-600">
                          Nếu bạn cần đổi mật khẩu, vui lòng truy cập <a href="https://myaccount.google.com/security" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 underline font-medium">Cài đặt bảo mật Google</a>.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Password Change Form - Only for Email/Password users */}
                  {isPasswordProvider && (
                    <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword" className="text-slate-700 font-medium">Mật khẩu hiện tại</Label>
                      <Input
                        id="currentPassword"
                        type="password"
                        placeholder="Nhập mật khẩu hiện tại"
                        className="glass-subtle border-white/20 h-12"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                        disabled={isChangingPassword}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newPassword" className="text-slate-700 font-medium">Mật khẩu mới</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                        className="glass-subtle border-white/20 h-12"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                        disabled={isChangingPassword}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-slate-700 font-medium">Xác nhận mật khẩu mới</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="Nhập lại mật khẩu mới"
                        className="glass-subtle border-white/20 h-12"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        disabled={isChangingPassword}
                      />
                    </div>
                    <Button
                      onClick={handleChangePassword}
                      disabled={isChangingPassword}
                      className="bg-gradient-to-r from-brand-green to-brand-gold hover:from-green-700 hover:to-amber-600 text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      {isChangingPassword ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Đang cập nhật...
                        </>
                      ) : (
                        'Cập nhật mật khẩu'
                      )}
                    </Button>
                    </div>
                  )}

                  {/* No password account notice */}
                  {!isPasswordProvider && !isGoogleProvider && (
                    <div className="p-4 bg-slate-100 rounded-lg text-sm text-slate-600">
                      Đang tải thông tin đăng nhập...
                    </div>
                  )}
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
                <div className="mb-8">
                  <div className="flex items-baseline gap-3 mb-2">
                    <h2 className="text-2xl font-bold text-red-700">Vùng nguy hiểm</h2>
                    <span className="text-sm text-red-500">Hành động không thể hoàn tác</span>
                  </div>
                  <div className="h-1 w-20 bg-gradient-to-r from-red-600 to-rose-600 rounded-full"></div>
                </div>

                <div className="relative p-8 bg-gradient-to-br from-red-50 to-rose-50 rounded-2xl border-2 border-red-100 overflow-hidden">
                  {/* Warning pattern overlay */}
                  <div className="absolute inset-0 opacity-[0.02]" style={{
                    backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, currentColor 10px, currentColor 11px)',
                  }}></div>

                  <div className="relative">
                    <div className="mb-4">
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full border-2 border-red-200">
                        <span className="text-sm font-bold text-red-700">CẢNH BÁO</span>
                      </div>
                    </div>

                    <h3 className="text-xl font-bold text-red-900 mb-3">Xóa tài khoản vĩnh viễn</h3>
                    <p className="text-slate-700 mb-6 leading-relaxed">
                      Hành động này sẽ xóa vĩnh viễn tài khoản và toàn bộ dữ liệu của bạn. Quá trình này không thể hoàn tác sau khi hoàn thành.
                    </p>

                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 mb-6 border border-red-100">
                      <p className="text-sm font-medium text-slate-900 mb-2">Các dữ liệu sẽ bị xóa:</p>
                      <ul className="space-y-1.5 text-sm text-slate-600">
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                          Thông tin cá nhân và hồ sơ
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                          Địa điểm đã tạo và đánh giá
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                          Danh sách yêu thích và lưu trữ
                        </li>
                      </ul>
                    </div>

                    <Button
                      onClick={() => setDeleteAccountOpen(true)}
                      variant="destructive"
                      className="w-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white shadow-lg transition-all duration-200"
                    >
                      Xóa tài khoản của tôi
                    </Button>
                  </div>
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

      {/* Delete Account Confirmation Dialog */}
      <AlertDialog open={deleteAccountOpen} onOpenChange={setDeleteAccountOpen}>
        <AlertDialogContent className="max-w-lg">
          <AlertDialogHeader className="space-y-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-100 rounded-full">
                <span className="text-xs font-bold text-red-700">XÁC NHẬN XÓA TÀI KHOẢN</span>
              </div>
              <AlertDialogTitle className="text-2xl font-bold text-slate-900">
                Bạn có chắc chắn muốn tiếp tục?
              </AlertDialogTitle>
            </div>

            <AlertDialogDescription className="space-y-5">
              <div className="p-4 bg-red-50 rounded-xl border-l-4 border-red-500">
                <p className="text-sm font-medium text-red-900">
                  Hành động này không thể hoàn tác và sẽ xóa vĩnh viễn:
                </p>
              </div>

              <ul className="space-y-3 text-sm text-slate-700">
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2"></div>
                  <span>Tài khoản và thông tin cá nhân của bạn</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2"></div>
                  <span>Tất cả địa điểm và đánh giá bạn đã đóng góp</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2"></div>
                  <span>Danh sách địa điểm yêu thích và đã lưu</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2"></div>
                  <span>Toàn bộ lịch sử hoạt động trên hệ thống</span>
                </li>
              </ul>

              <div className="space-y-3 pt-4 border-t">
                {/* Google User: No password needed */}
                {isGoogleProvider && !isPasswordProvider && (
                  <div className="space-y-3">
                    <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                      <p className="text-sm font-medium text-blue-900 mb-2">
                        Xác thực với Google
                      </p>
                      <p className="text-xs text-blue-700">
                        Bạn sẽ được yêu cầu đăng nhập lại với Google để xác nhận việc xóa tài khoản. Đây là bước bảo mật quan trọng.
                      </p>
                    </div>
                  </div>
                )}

                {/* Email/Password User: Password confirmation */}
                {isPasswordProvider && (
                  <div className="space-y-3">
                    <Label htmlFor="deletePasswordConfirm" className="text-sm font-semibold text-slate-900">
                      Nhập mật khẩu của bạn để xác nhận
                    </Label>
                    <Input
                      id="deletePasswordConfirm"
                      type="password"
                      placeholder="••••••••"
                      value={deletePasswordConfirm}
                      onChange={(e) => setDeletePasswordConfirm(e.target.value)}
                      disabled={isDeletingAccount}
                      className="h-12 text-base"
                      autoFocus
                    />
                    <p className="text-xs text-slate-500">
                      Việc xác nhận này giúp đảm bảo chỉ bạn mới có thể xóa tài khoản.
                    </p>
                  </div>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter className="gap-3 sm:gap-3">
            <AlertDialogCancel
              onClick={() => {
                setDeleteAccountOpen(false)
                setDeletePasswordConfirm('')
              }}
              disabled={isDeletingAccount}
              className="flex-1"
            >
              Hủy bỏ
            </AlertDialogCancel>
            <Button
              onClick={handleDeleteAccount}
              disabled={
                isDeletingAccount ||
                (isPasswordProvider && !deletePasswordConfirm) // Only require password for email/password users
              }
              variant="destructive"
              className="flex-1 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 disabled:opacity-50"
            >
              {isDeletingAccount ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {isGoogleProvider ? 'Đang xác thực...' : 'Đang xóa...'}
                </>
              ) : (
                <>
                  {isGoogleProvider && !isPasswordProvider ? 'Xác nhận với Google' : 'Xóa tài khoản'}
                </>
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
