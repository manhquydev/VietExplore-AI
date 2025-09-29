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
  RefreshCw
} from "lucide-react"
import { EmailVerificationService } from "@/lib/auth/email-verification"
import { auth } from "@/lib/firebase"
import { User as FirebaseUser, sendEmailVerification } from "firebase/auth"
import { useToast } from "@/components/providers/toast-provider"

interface EmailVerificationResult {
  success: boolean
  message?: string
  error?: string
}

export default function SettingsPage() {
  const { user, isAuthenticated } = useAuth()
  const { toast } = useToast()
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
      
      // Check our custom rate limit
      if (rateLimitExpiry > now) {
        const remaining = Math.ceil((rateLimitExpiry - now) / 1000);
        setTimeUntilCanResend(remaining);
        setCanResendEmail(false);
      } else {
        // Also check EmailVerificationService rate limiting
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
      // TODO: Save to API
      await new Promise(resolve => setTimeout(resolve, 1500))
    } catch (error) {
      console.error('Save failed:', error)
    } finally {
      setIsSaving(false)
    }
  }

  // Professional email verification with modern UX
  const handleResendEmailVerification = async (): Promise<EmailVerificationResult> => {
    console.log("🚀 Starting professional email verification...");
    
    // GUARANTEED fallback result
    let result: EmailVerificationResult = { success: false, error: "Function not completed" };
    
    try {
      const user = auth.currentUser;
      
      if (!user) {
        result = { success: false, error: "Vui lòng đăng nhập để gửi email xác minh" };
        console.log("❌ No user:", result);
        return result;
      }
      
      if (isResendingEmail) {
        result = { success: false, error: "Đang xử lý yêu cầu trước đó..." };
        console.log("⏳ Already in progress:", result);
        return result;
      }

      // Check rate limiting
      const now = Date.now();
      if (rateLimitExpiry > now) {
        const remainingSeconds = Math.ceil((rateLimitExpiry - now) / 1000);
        result = { 
          success: false, 
          error: `Vui lòng đợi ${remainingSeconds} giây trước khi gửi lại email xác minh` 
        };
        console.log("🚫 Rate limited:", result);
        return result;
      }
      
      setIsResendingEmail(true);
      setEmailVerificationMessage('');
      
      console.log("📧 Sending verification email...");
      await sendEmailVerification(user);
      console.log("✅ Email sent successfully");
      
      // Update timestamps for rate limiting
      const sentTime = Date.now();
      setLastSentTime(sentTime);
      setRateLimitExpiry(sentTime + 60000); // 1 minute cooldown
      
      // Success handling with professional messaging
      const successMessage = `Email xác minh đã được gửi đến ${user.email}. Vui lòng kiểm tra hộp thư (bao gồm thư mục spam).`;
      setEmailVerificationMessage(successMessage);
      
      result = { success: true, message: successMessage };
      console.log("✅ Success:", result);
      return result;
      
    } catch (error: any) {
      console.log("💥 Error caught:", error);
      
      // Enhanced error handling with user-friendly messages
      let errorMessage = 'Đã có lỗi xảy ra khi gửi email xác minh.';
      let rateLimitDuration = 0;
      
      if (error?.code === 'auth/too-many-requests') {
        errorMessage = 'Bạn đã gửi quá nhiều yêu cầu xác minh. Vui lòng thử lại sau 5 phút.';
        rateLimitDuration = 5 * 60 * 1000; // 5 minutes
        setRateLimitExpiry(Date.now() + rateLimitDuration);
      } else if (error?.code === 'auth/network-request-failed') {
        errorMessage = 'Lỗi kết nối mạng. Vui lòng kiểm tra internet và thử lại.';
      } else if (error?.code === 'auth/user-disabled') {
        errorMessage = 'Tài khoản đã bị vô hiệu hóa. Vui lòng liên hệ hỗ trợ.';
      } else if (error?.message) {
        // Clean up Firebase error messages
        if (error.message.includes('too-many-requests')) {
          errorMessage = 'Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau vài phút.';
          rateLimitDuration = 5 * 60 * 1000;
          setRateLimitExpiry(Date.now() + rateLimitDuration);
        } else {
          errorMessage = 'Có lỗi xảy ra. Vui lòng thử lại sau.';
        }
      }
      
      setEmailVerificationMessage(errorMessage);
      
      result = { success: false, error: errorMessage };
      console.log("❌ Error result:", result);
      return result;
      
    } finally {
      setIsResendingEmail(false);
      console.log("🧹 Cleanup completed");
    }
    
    // TypeScript safety fallback
    console.log("FALLBACK RETURN:", result);
    return result;
  }

  if (!isAuthenticated) {
    redirect('/auth/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-primary/5 to-secondary/5">
      <Header />
      
      <main className="container py-8 max-w-4xl">
        {/* Header */}
        <div className="glass-card p-8 mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
              <Settings className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Cài đặt tài khoản</h1>
              <p className="text-slate-600 mt-1">
                Quản lý thông tin cá nhân và tùy chỉnh trải nghiệm của bạn
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Profile Settings */}
          <div className="glass-card p-8">
            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <User className="w-4 h-4 text-primary" />
              </div>
              Thông tin cá nhân
            </h2>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="fullName" className="text-slate-700">Họ và tên</Label>
                  <Input
                    id="fullName"
                    defaultValue={user?.fullName}
                    placeholder="Nhập họ và tên"
                    className="glass-subtle border-white/20"
                  />
                </div>
                <div>
                  <Label htmlFor="username" className="text-slate-700">Tên người dùng</Label>
                  <Input
                    id="username"
                    defaultValue={user?.username}
                    placeholder="Nhập tên người dùng"
                    className="glass-subtle border-white/20"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="email" className="text-slate-700">Email</Label>
                <Input
                  id="email"
                  type="email"
                  defaultValue={user?.email}
                  placeholder="Nhập địa chỉ email"
                  className="glass-subtle border-white/20"
                />
              </div>
              
              <div>
                <Label htmlFor="bio" className="text-slate-700">Giới thiệu bản thân</Label>
                <Textarea
                  id="bio"
                  defaultValue={user?.profile?.bio}
                  placeholder="Viết vài dòng về bản thân..."
                  rows={3}
                  className="glass-subtle border-white/20"
                />
              </div>
              
              <div>
                <Label htmlFor="location" className="text-slate-700">Địa điểm</Label>
                <Input
                  id="location"
                  defaultValue={user?.profile?.location}
                  placeholder="Thành phố, quốc gia"
                  className="glass-subtle border-white/20"
                />
              </div>
            </div>
          </div>

          {/* Email Verification Section */}
          <div className="glass-card p-8">
            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                firebaseUser?.emailVerified 
                  ? 'bg-green-100' 
                  : 'bg-amber-100'
              }`}>
                {firebaseUser?.emailVerified ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <Mail className="w-4 h-4 text-amber-600" />
                )}
              </div>
              Xác minh Email
            </h2>
            
            <div className="space-y-6">
              {/* Email Status Display */}
              <div className={`p-6 rounded-xl border-2 ${
                firebaseUser?.emailVerified 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-amber-50 border-amber-200'
              }`}>
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-lg ${
                    firebaseUser?.emailVerified 
                      ? 'bg-green-100' 
                      : 'bg-amber-100'
                  }`}>
                    {firebaseUser?.emailVerified ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <Mail className="w-5 h-5 text-amber-600" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className={`font-semibold ${
                        firebaseUser?.emailVerified 
                          ? 'text-green-900' 
                          : 'text-amber-900'
                      }`}>
                        {firebaseUser?.emailVerified 
                          ? 'Email đã được xác minh' 
                          : 'Email chưa được xác minh'
                        }
                      </h3>
                      {firebaseUser?.emailVerified && (
                        <div className="flex items-center gap-1">
                          <Check className="w-4 h-4 text-green-600" />
                          <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded-full">
                            Xác minh
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <p className={`text-sm mb-3 ${
                      firebaseUser?.emailVerified 
                        ? 'text-green-700' 
                        : 'text-amber-700'
                    }`}>
                      {firebaseUser?.emailVerified 
                        ? `Địa chỉ email ${user?.email} đã được xác minh thành công. Tài khoản của bạn được bảo mật hoàn toàn.`
                        : `Để đảm bảo bảo mật tài khoản, vui lòng xác minh địa chỉ email ${user?.email}.`
                      }
                    </p>

                    {!firebaseUser?.emailVerified && (
                      <div className="space-y-3">
                        <div className="text-sm text-amber-700 bg-amber-100 p-3 rounded-lg">
                          <strong>Cách thức xác minh:</strong>
                          <ol className="mt-2 ml-4 list-decimal space-y-1">
                            <li>Nhấp vào nút "Gửi email xác minh" bên dưới</li>
                            <li>Kiểm tra hộp thư email của bạn (bao gồm thư mục spam)</li>
                            <li>Nhấp vào liên kết xác minh trong email</li>
                            <li>Quay lại trang này để kiểm tra trạng thái</li>
                          </ol>
                        </div>

                        {emailVerificationMessage && (
                          <div className={`text-sm p-3 rounded-lg ${
                            emailVerificationMessage.includes('thành công') || emailVerificationMessage.includes('gửi')
                              ? 'text-green-700 bg-green-100 border border-green-200'
                              : 'text-red-700 bg-red-100 border border-red-200'
                          }`}>
                            {emailVerificationMessage}
                          </div>
                        )}

                        <Button
                          onClick={async () => {
                            console.log("🚀 Professional email verification click");
                            
                            try {
                              const result = await handleResendEmailVerification();
                              
                              // Safety checks
                              if (!result || typeof result !== 'object') {
                                console.error("❌ Invalid result:", result);
                                toast?.error?.("Lỗi hệ thống. Vui lòng thử lại sau.");
                                return;
                              }
                              
                              // Handle result with professional UX
                              if (result.success) {
                                console.log("✅ Email sent successfully");
                                
                                // Success toast with custom styling
                                toast?.success?.(result.message || "Email xác minh đã được gửi thành công!", {
                                  duration: 8000,
                                  persistent: false
                                });
                                
                                // Optional: Show additional success message in UI
                                setEmailVerificationMessage(result.message || "");
                                
                                // Clear message after 10 seconds
                                setTimeout(() => {
                                  setEmailVerificationMessage('');
                                }, 10000);
                                
                              } else {
                                console.log("❌ Email send failed:", result.error);
                                
                                // Error handling with specific cases
                                const errorMsg = result.error || "Có lỗi xảy ra";
                                
                                if (errorMsg.includes('quá nhiều') || errorMsg.includes('too-many')) {
                                  // Rate limit error - show warning toast
                                  toast?.warning?.(errorMsg, {
                                    duration: 10000,
                                    persistent: true
                                  });
                                } else if (errorMsg.includes('mạng') || errorMsg.includes('network')) {
                                  // Network error
                                  toast?.warning?.("Lỗi kết nối. Vui lòng kiểm tra internet và thử lại.", {
                                    duration: 5000
                                  });
                                } else {
                                  // General error
                                  toast?.error?.(errorMsg, {
                                    duration: 6000
                                  });
                                }
                                
                                // Show error in UI as well
                                setEmailVerificationMessage(errorMsg);
                                
                                // Clear error message after 12 seconds
                                setTimeout(() => {
                                  setEmailVerificationMessage('');
                                }, 12000);
                              }
                              
                            } catch (clickError) {
                              console.error("💥 Critical error:", clickError);
                              
                              // Professional error handling
                              const errorMsg = "Đã xảy ra lỗi không mong muốn. Vui lòng thử lại sau.";
                              toast?.error?.(errorMsg, {
                                duration: 5000
                              });
                              
                              setEmailVerificationMessage(errorMsg);
                              setTimeout(() => {
                                setEmailVerificationMessage('');
                              }, 8000);
                            }
                            
                            console.log("🏁 Email verification click completed");
                          }}
                          disabled={isResendingEmail || !canResendEmail}
                          className={`${
                            isResendingEmail || !canResendEmail
                              ? 'bg-gray-400 hover:bg-gray-400' 
                              : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600'
                          } text-white transition-all`}
                        >
                          {isResendingEmail ? (
                            <>
                              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                              Đang gửi email...
                            </>
                          ) : canResendEmail ? (
                            <>
                              <Mail className="w-4 h-4 mr-2" />
                              Gửi email xác minh
                            </>
                          ) : timeUntilCanResend > 60 ? (
                            <>
                              <Clock className="w-4 h-4 mr-2 animate-pulse" />
                              Đợi {Math.ceil(timeUntilCanResend / 60)} phút
                            </>
                          ) : (
                            <>
                              <Clock className="w-4 h-4 mr-2 animate-pulse" />
                              Đợi {timeUntilCanResend} giây
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                    
                    {firebaseUser?.emailVerified && (
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-xs text-green-600 font-medium">
                          Tài khoản được bảo mật
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Additional Security Tips */}
              {!firebaseUser?.emailVerified && (
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <h4 className="font-medium text-slate-900 mb-2 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-slate-600" />
                    Tại sao cần xác minh email?
                  </h4>
                  <ul className="text-sm text-slate-700 space-y-1">
                    <li>• Đảm bảo bạn là người sở hữu địa chỉ email này</li>
                    <li>• Bảo vệ tài khoản khỏi việc truy cập trái phép</li>
                    <li>• Có thể khôi phục mật khẩu khi cần thiết</li>
                    <li>• Nhận thông báo quan trọng về tài khoản</li>
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Privacy Settings */}
          <div className="glass-card p-8">
            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
              <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                <Shield className="w-4 h-4 text-emerald-600" />
              </div>
              Quyền riêng tư
            </h2>
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 glass-subtle rounded-xl">
                <div className="space-y-1">
                  <Label className="text-slate-900">Hiển thị hồ sơ công khai</Label>
                  <p className="text-sm text-slate-600">Cho phép người khác xem hồ sơ của bạn</p>
                </div>
                <Switch
                  checked={privacy.profileVisible}
                  onCheckedChange={(checked) => setPrivacy(prev => ({ ...prev, profileVisible: checked }))}
                  className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-sky-500 data-[state=checked]:to-teal-500"
                />
              </div>
              
              <div className="flex items-center justify-between p-4 glass-subtle rounded-xl">
                <div className="space-y-1">
                  <Label className="text-slate-900">Hiển thị thống kê đóng góp</Label>
                  <p className="text-sm text-slate-600">Hiển thị số lượng địa điểm và lịch trình đã tạo</p>
                </div>
                <Switch
                  checked={privacy.showStats}
                  onCheckedChange={(checked) => setPrivacy(prev => ({ ...prev, showStats: checked }))}
                  className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-sky-500 data-[state=checked]:to-teal-500"
                />
              </div>
              
              <div className="flex items-center justify-between p-4 glass-subtle rounded-xl">
                <div className="space-y-1">
                  <Label className="text-slate-900">Cho phép tin nhắn</Label>
                  <p className="text-sm text-slate-600">Người dùng khác có thể gửi tin nhắn cho bạn</p>
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
            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <Bell className="w-4 h-4 text-purple-600" />
              </div>
              Thông báo
            </h2>
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 glass-subtle rounded-xl">
                <div className="space-y-1">
                  <Label className="text-slate-900">Thông báo qua email</Label>
                  <p className="text-sm text-slate-600">Nhận email về hoạt động quan trọng</p>
                </div>
                <Switch
                  checked={notifications.email}
                  onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, email: checked }))}
                  className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-purple-500 data-[state=checked]:to-pink-500"
                />
              </div>
              
              <div className="flex items-center justify-between p-4 glass-subtle rounded-xl">
                <div className="space-y-1">
                  <Label className="text-slate-900">Thông báo đẩy</Label>
                  <p className="text-sm text-slate-600">Nhận thông báo trên trình duyệt</p>
                </div>
                <Switch
                  checked={notifications.push}
                  onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, push: checked }))}
                  className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-purple-500 data-[state=checked]:to-pink-500"
                />
              </div>
              
              <div className="flex items-center justify-between p-4 glass-subtle rounded-xl">
                <div className="space-y-1">
                  <Label className="text-slate-900">Email marketing</Label>
                  <p className="text-sm text-slate-600">Nhận thông tin về tính năng mới và cập nhật</p>
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
            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
              <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                <Monitor className="w-4 h-4 text-amber-600" />
              </div>
              Giao diện & Ngôn ngữ
            </h2>
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="language" className="text-slate-700">Ngôn ngữ</Label>
                  <Select defaultValue="vi">
                    <SelectTrigger className="glass-subtle border-white/20">
                      <SelectValue placeholder="Chọn ngôn ngữ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vi">🇻🇳 Tiếng Việt</SelectItem>
                      <SelectItem value="en">🇺🇸 English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="timezone" className="text-slate-700">Múi giờ</Label>
                  <Select defaultValue="asia/ho_chi_minh">
                    <SelectTrigger className="glass-subtle border-white/20">
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
                <Label className="text-slate-700 mb-3 block">Chủ đề giao diện</Label>
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
                          ? 'border-primary bg-primary/5'
                          : 'border-white/20 glass-subtle hover:border-primary/50'
                      }`}
                    >
                      <Icon className={`w-6 h-6 mx-auto mb-2 ${
                        theme === value ? 'text-primary' : 'text-slate-600'
                      }`} />
                      <div className={`text-sm font-medium ${
                        theme === value ? 'text-primary-900' : 'text-slate-700'
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
            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                <Key className="w-4 h-4 text-indigo-600" />
              </div>
              Bảo mật tài khoản
            </h2>
            <div className="space-y-6">
              <h3 className="font-medium text-slate-900">Thay đổi mật khẩu</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="currentPassword" className="text-slate-700">Mật khẩu hiện tại</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    placeholder="Nhập mật khẩu hiện tại"
                    className="glass-subtle border-white/20"
                  />
                </div>
                <div>
                  <Label htmlFor="newPassword" className="text-slate-700">Mật khẩu mới</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="Nhập mật khẩu mới"
                    className="glass-subtle border-white/20"
                  />
                </div>
                <div>
                  <Label htmlFor="confirmPassword" className="text-slate-700">Xác nhận mật khẩu mới</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Nhập lại mật khẩu mới"
                    className="glass-subtle border-white/20"
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
          <div className="glass-card p-8 border-2 border-red-200/50">
            <h2 className="text-xl font-bold text-red-700 mb-6 flex items-center gap-3">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-red-600" />
              </div>
              Vùng nguy hiểm
            </h2>
            <div className="p-6 bg-red-50/50 rounded-xl border border-red-200/50">
              <h3 className="font-medium text-red-900 mb-2">Xóa tài khoản</h3>
              <p className="text-sm text-red-700 mb-4">
                Hành động này không thể hoàn tác. Tất cả dữ liệu của bạn sẽ bị xóa vĩnh viễn.
              </p>
              <Button 
                variant="destructive"
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
