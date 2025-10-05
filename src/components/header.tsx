"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LoginModal } from "@/components/auth/login-modal"
import { RegisterModal } from "@/components/auth/register-modal"
import { useAuth } from "@/components/auth/auth-provider"
import { IconButton } from "@/components/ui/icon"
import { UserRoleDisplay } from "@/components/ui/role-badge"
import { Logo } from "@/components/ui/logo"
import { cn } from "@/lib/utils"
import { 
  User, 
  Heart, 
  Settings, 
  Shield, 
  Calendar, 
  LogOut,
  HelpCircle,
  Camera,
  Award,
  Flag
} from "lucide-react"
import { NotificationBell } from "@/components/notifications/notification-bell"

const navigation = [
  { name: "Trang chủ", href: "/" },
  { name: "Địa điểm", href: "/places" },
  { name: "Trợ lý AI", href: "/ai-assistant/chat" },
  { name: "Cộng đồng", href: "/community" },
  { name: "Tài nguyên", href: "/resources" },
]

export const Header: React.FC = () => {
  const pathname = usePathname()
  const { user, isAuthenticated, logout } = useAuth()
  const [isOpen, setIsOpen] = React.useState(false)
  const [showLoginModal, setShowLoginModal] = React.useState(false)
  const [showRegisterModal, setShowRegisterModal] = React.useState(false)


  const handleLogout = () => {
    logout()
    setIsOpen(false)
  }

  const openLoginModal = () => {
    setShowLoginModal(true)
    setIsOpen(false)
  }

  const openRegisterModal = () => {
    setShowRegisterModal(true)
    setIsOpen(false)
  }

  const switchToRegister = () => {
    setShowLoginModal(false)
    setShowRegisterModal(true)
  }

  const switchToLogin = () => {
    setShowRegisterModal(false)
    setShowLoginModal(true)
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

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-white/95  border-b border-slate-200  shadow-soft">
      <div className="container mx-auto">
        <div className="flex h-16 sm:h-20 items-center justify-between">
          {/* New Bánh Chưng Logo */}
          <Link href="/" className="flex items-center hover:scale-105 transition-all duration-200 group">
            <div className="relative p-1 sm:p-2">
              <Logo variant="horizontal" size="md" className="h-10 sm:h-12 lg:h-16 drop-shadow-sm group-hover:drop-shadow-md transition-all duration-200" priority />
              <div className="absolute inset-0 bg-gradient-to-r from-brand-green/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 -z-10"></div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-4 lg:gap-6">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "text-[15px] font-medium transition-colors hover:text-slate-900 ",
                  pathname === item.href
                    ? "text-slate-900  font-semibold"
                    : "text-slate-600 "
                )}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Notification Bell */}
            {isAuthenticated && user && <NotificationBell />}
            
            {/* Enhanced Authenticated User Menu */}
            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-11 w-11 rounded-full p-0 hover:scale-105 transition-all duration-200">
                    <div className="relative">
                      <Avatar className="h-10 w-10 ring-2 ring-transparent hover:ring-primary/20 transition-all duration-200">
                        <AvatarImage src={user.avatar} alt={user.fullName || "User Avatar"} />
                        <AvatarFallback className="bg-gradient-to-br from-green-700 to-amber-600 text-white font-semibold shadow-inner">
                          {getInitials(user.fullName, user.email)}
                        </AvatarFallback>
                      </Avatar>
                      {/* Online status indicator */}
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white"></div>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  className="w-80 p-0 glass-card border-slate-200/50 shadow-xl" 
                  align="end" 
                  forceMount
                  sideOffset={8}
                >
                  {/* Enhanced User Profile Header */}
                  <div className="p-4 bg-gradient-to-br from-primary/10 to-secondary/10">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12 ring-2 ring-primary/20 ring-primary/20">
                        <AvatarImage src={user.avatar} alt={user.fullName || "User Avatar"} />
                        <AvatarFallback className="bg-gradient-to-br from-green-700 to-amber-600 text-white font-semibold text-lg shadow-inner">
                          {getInitials(user.fullName, user.email)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-900 truncate">{user.fullName || 'User'}</p>
                        <p className="text-sm text-slate-600 truncate">{user.email}</p>
                        <UserRoleDisplay 
                          role={user.role}
                          variant="compact"
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="p-2">
                    {/* Personal Section */}
                    <div className="mb-1">
                      <DropdownMenuItem asChild className="h-10 cursor-pointer rounded-lg hover:bg-slate-100/50 transition-colors">
                        <Link href="/profile/me" className="flex items-center gap-3 px-3">
                          <User className="w-5 h-5 text-primary" />
                          <div className="flex-1">
                            <div className="font-medium text-slate-900">Hồ sơ cá nhân</div>
                            <div className="text-xs text-slate-500">Quản lý thông tin cá nhân</div>
                          </div>
                        </Link>
                      </DropdownMenuItem>

                      <DropdownMenuItem asChild className="h-10 cursor-pointer rounded-lg hover:bg-slate-100/50 transition-colors">
                        <Link href="/itineraries/my" className="flex items-center gap-3 px-3">
                          <Calendar className="w-5 h-5 text-purple-600" />
                          <div className="flex-1">
                            <div className="font-medium text-slate-900">Lịch trình của tôi</div>
                            <div className="text-xs text-slate-500">Quản lý hành trình du lịch</div>
                          </div>
                        </Link>
                      </DropdownMenuItem>

                      <DropdownMenuItem asChild className="h-10 cursor-pointer rounded-lg hover:bg-slate-100/50 transition-colors">
                        <Link href="/places/saved" className="flex items-center gap-3 px-3">
                          <Heart className="w-5 h-5 text-rose-600" />
                          <div className="flex-1">
                            <div className="font-medium text-slate-900">Địa điểm yêu thích</div>
                            <div className="text-xs text-slate-500">Danh sách đã lưu</div>
                          </div>
                        </Link>
                      </DropdownMenuItem>

                      <DropdownMenuItem asChild className="h-10 cursor-pointer rounded-lg hover:bg-slate-100/50 transition-colors">
                        <Link href="/contribute/my-drafts" className="flex items-center gap-3 px-3">
                          <Camera className="w-5 h-5 text-emerald-600" />
                          <div className="flex-1">
                            <div className="font-medium text-slate-900">Đóng góp của tôi</div>
                            <div className="text-xs text-slate-500">Bài viết và hình ảnh</div>
                          </div>
                        </Link>
                      </DropdownMenuItem>

                      <DropdownMenuItem asChild className="h-10 cursor-pointer rounded-lg hover:bg-slate-100/50 transition-colors">
                        <Link href="/contribute/my-reports" className="flex items-center gap-3 px-3">
                          <Flag className="w-5 h-5 text-red-600" />
                          <div className="flex-1">
                            <div className="font-medium text-slate-900">Báo cáo & Đề xuất</div>
                            <div className="text-xs text-slate-500">Theo dõi trạng thái</div>
                          </div>
                        </Link>
                      </DropdownMenuItem>
                    </div>

                    <DropdownMenuSeparator className="my-2" />

                    {/* Settings & Support */}
                    <div className="mb-1">
                      <DropdownMenuItem asChild className="h-10 cursor-pointer rounded-lg hover:bg-slate-100/50 transition-colors">
                        <Link href="/settings" className="flex items-center gap-3 px-3">
                          <Settings className="w-5 h-5 text-slate-600" />
                          <div className="flex-1">
                            <div className="font-medium text-slate-900">Cài đặt</div>
                            <div className="text-xs text-slate-500">Tùy chỉnh tài khoản</div>
                          </div>
                        </Link>
                      </DropdownMenuItem>

                      <DropdownMenuItem asChild className="h-10 cursor-pointer rounded-lg hover:bg-slate-100/50 transition-colors">
                        <Link href="/help/faq" className="flex items-center gap-3 px-3">
                          <HelpCircle className="w-5 h-5 text-amber-600" />
                          <div className="flex-1">
                            <div className="font-medium text-slate-900">Trợ giúp</div>
                            <div className="text-xs text-slate-500">FAQ và hướng dẫn</div>
                          </div>
                        </Link>
                      </DropdownMenuItem>
                    </div>

                    {/* Admin/Moderator Section */}
                    {(user.role === 'moderator' || user.role === 'admin') && (
                      <>
                        <DropdownMenuSeparator className="my-2" />
                        <div className="mb-1">
                          <DropdownMenuItem asChild className="h-10 cursor-pointer rounded-lg hover:bg-slate-100/50 transition-colors">
                            <Link href="/admin/moderation" className="flex items-center gap-3 px-3">
                              <Shield className="w-5 h-5 text-primary" />
                              <div className="flex-1">
                                <div className="font-medium text-slate-900">Kiểm duyệt</div>
                                <div className="text-xs text-slate-500">Quản lý nội dung</div>
                              </div>
                            </Link>
                          </DropdownMenuItem>
                        </div>
                      </>
                    )}

                    {user.role === 'admin' && (
                      <div className="mb-1">
                        <DropdownMenuItem asChild className="h-10 cursor-pointer rounded-lg hover:bg-slate-100/50 transition-colors">
                          <Link href="/admin" className="flex items-center gap-3 px-3">
                            <Award className="w-5 h-5 text-violet-600" />
                            <div className="flex-1">
                              <div className="font-medium text-slate-900">Quản trị hệ thống</div>
                              <div className="text-xs text-slate-500">Bảng điều khiển admin</div>
                            </div>
                          </Link>
                        </DropdownMenuItem>
                      </div>
                    )}

                    <DropdownMenuSeparator className="my-2" />

                    {/* Logout */}
                    <DropdownMenuItem 
                      onClick={handleLogout}
                      className="h-10 cursor-pointer rounded-lg hover:bg-red-50 transition-colors px-3"
                    >
                      <div className="flex items-center gap-3 w-full">
                        <LogOut className="w-5 h-5 text-red-600" />
                        <div className="flex-1">
                          <div className="font-medium text-red-600">Đăng xuất</div>
                          <div className="text-xs text-red-500">Thoát khỏi tài khoản</div>
                        </div>
                      </div>
                    </DropdownMenuItem>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                {/* CTA Button - Desktop */}
                <Button className="hidden md:inline-flex bg-gradient-to-r from-green-600 to-yellow-500 hover:from-green-700 hover:to-yellow-600 text-white shadow-lg" onClick={openLoginModal}>
                  Bắt đầu với AI
                </Button>
                
                {/* Login Button */}
                <Button variant="ghost" onClick={openLoginModal} className="hidden sm:inline-flex">
                  Đăng nhập
                </Button>
              </>
            )}


            {/* Mobile Menu - Using Icon Registry */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <div className="md:hidden">
                  <IconButton
                    icon="menu"
                    label="Menu"
                    variant="ghost"
                    className="text-slate-700  hover:bg-slate-100 "
                  />
                </div>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px] bg-white/95  backdrop-blur-md border-slate-200/50 /50">
                <div className="flex flex-col gap-4 mt-8">
                  {/* Mobile Navigation */}
                  <nav className="flex flex-col gap-4">
                    {navigation.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className={cn(
                          "text-base font-medium transition-colors hover:text-slate-900  py-2",
                          pathname === item.href
                            ? "text-slate-900  font-semibold"
                            : "text-slate-600 "
                        )}
                      >
                        {item.name}
                      </Link>
                    ))}
                  </nav>

                  {/* Mobile Auth Actions */}
                  <div className="pt-4 border-t border-slate-200 space-y-2">
                    {isAuthenticated && user ? (
                      <>
                        <div className="flex items-center gap-3 p-3 glass-subtle rounded-xl">
                          <Avatar className="h-10 w-10 ring-2 ring-primary/20 ring-primary/20">
                            <AvatarImage src={user.avatar} alt={user.fullName || "User Avatar"} />
                            <AvatarFallback className="bg-gradient-to-br from-green-700 to-amber-600 text-white font-semibold shadow-inner">
                              {getInitials(user.fullName, user.email)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm text-slate-900 truncate">{user.fullName || 'User'}</p>
                            <p className="text-xs text-slate-600 truncate">{user.email}</p>
                            <UserRoleDisplay 
                              role={user.role}
                              variant="compact"
                              className="mt-1"
                            />
                          </div>
                        </div>
                        <Button 
                          variant="outline" 
                          className="w-full glass-subtle hover:bg-red-50" 
                          onClick={handleLogout}
                        >
                          <LogOut className="w-4 h-4 mr-2" />
                          Đăng xuất
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button className="w-full bg-gradient-to-r from-green-600 to-yellow-500 hover:from-green-700 hover:to-yellow-600 text-white shadow-lg" onClick={openLoginModal}>
                          Bắt đầu với AI
                        </Button>
                        <Button variant="outline" className="w-full glass-subtle" onClick={openRegisterModal}>
                          Tạo tài khoản
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Auth Modals */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSwitchToRegister={switchToRegister}
      />
      <RegisterModal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        onSwitchToLogin={switchToLogin}
      />
    </header>
  )
}
