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
import { Icon, IconButton } from "@/components/ui/icon"
import { UserRoleDisplay } from "@/components/ui/role-badge"
import { Logo } from "@/components/ui/logo"
import { cn } from "@/lib/utils"
import { 
  User, 
  Heart, 
  Settings, 
  Shield, 
  Calendar, 
  MapPin, 
  Award, 
  FileText, 
  LogOut,
  HelpCircle,
  BookOpen,
  Camera
} from "lucide-react"

const navigation = [
  { name: "Trang chủ", href: "/" },
  { name: "Địa điểm", href: "/places" },
  { name: "Lịch trình", href: "/itineraries/builder" },
  { name: "Đóng góp", href: "/contribute/new-place" },
  { name: "Trợ lý AI", href: "/ai-assistant/chat" },
  { name: "Cộng đồng", href: "/community" },
  { name: "Tài nguyên", href: "/resources" },
  { name: "Về dự án", href: "/about" },
]

export const Header: React.FC = () => {
  const pathname = usePathname()
  const { user, isAuthenticated, logout } = useAuth()
  const [isDark, setIsDark] = React.useState(false)
  const [isOpen, setIsOpen] = React.useState(false)
  const [showLoginModal, setShowLoginModal] = React.useState(false)
  const [showRegisterModal, setShowRegisterModal] = React.useState(false)

  // Initialize dark mode from localStorage or system preference
  React.useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const shouldBeDark = savedTheme === 'dark' || (!savedTheme && systemDark)
    
    setIsDark(shouldBeDark)
    if (shouldBeDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [])

  const toggleDarkMode = () => {
    const newDarkMode = !isDark
    setIsDark(newDarkMode)
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }

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

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-white/95 dark:bg-slate-950/95 border-b border-slate-200 dark:border-slate-800 shadow-soft">
      <div className="container mx-auto">
        <div className="flex h-16 sm:h-20 items-center justify-between">
          {/* Enhanced Logo */}
          <Link href="/" className="flex items-center hover:scale-105 transition-all duration-200 group">
            <div className="relative p-1 sm:p-2">
              <Logo variant="horizontal" size="md" className="h-10 sm:h-12 lg:h-16 drop-shadow-sm group-hover:drop-shadow-md transition-all duration-200" />
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 -z-10"></div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-4 lg:gap-6">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "text-[15px] font-medium transition-colors hover:text-white dark:hover:text-white",
                  pathname === item.href 
                    ? "text-slate-900 dark:text-white font-semibold" 
                    : "text-slate-600 dark:text-slate-200 hover:text-slate-900"
                )}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Enhanced Authenticated User Menu */}
            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-11 w-11 rounded-full p-0 hover:scale-105 transition-all duration-200">
                    <div className="relative">
                      <Avatar className="h-10 w-10 ring-2 ring-transparent hover:ring-sky-200/50 dark:hover:ring-sky-400/30 transition-all duration-200">
                        <AvatarImage src={user.avatar} alt={user.fullName} />
                        <AvatarFallback className="bg-gradient-to-br from-sky-500 to-teal-500 text-white font-semibold">
                          {user.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {/* Online status indicator */}
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-800"></div>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  className="w-80 p-0 glass-card border-slate-200/50 dark:border-slate-700/50 shadow-xl" 
                  align="end" 
                  forceMount
                  sideOffset={8}
                >
                  {/* Enhanced User Profile Header */}
                  <div className="p-4 bg-gradient-to-br from-sky-500/10 to-teal-500/10 dark:from-sky-400/10 dark:to-teal-400/10">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12 ring-2 ring-sky-200/50 dark:ring-sky-400/30">
                        <AvatarImage src={user.avatar} alt={user.fullName} />
                        <AvatarFallback className="bg-gradient-to-br from-sky-500 to-teal-500 text-white font-semibold text-lg">
                          {user.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-900 dark:text-white truncate">{user.fullName}</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400 truncate">{user.email}</p>
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
                      <DropdownMenuItem asChild className="h-10 cursor-pointer rounded-lg hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-colors">
                        <Link href="/profile/me" className="flex items-center gap-3 px-3">
                          <User className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                          <div className="flex-1">
                            <div className="font-medium text-slate-900 dark:text-white">Hồ sơ cá nhân</div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">Quản lý thông tin cá nhân</div>
                          </div>
                        </Link>
                      </DropdownMenuItem>

                      <DropdownMenuItem asChild className="h-10 cursor-pointer rounded-lg hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-colors">
                        <Link href="/itineraries/my" className="flex items-center gap-3 px-3">
                          <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                          <div className="flex-1">
                            <div className="font-medium text-slate-900 dark:text-white">Lịch trình của tôi</div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">Quản lý hành trình du lịch</div>
                          </div>
                        </Link>
                      </DropdownMenuItem>

                      <DropdownMenuItem asChild className="h-10 cursor-pointer rounded-lg hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-colors">
                        <Link href="/places/saved" className="flex items-center gap-3 px-3">
                          <Heart className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                          <div className="flex-1">
                            <div className="font-medium text-slate-900 dark:text-white">Địa điểm yêu thích</div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">Danh sách đã lưu</div>
                          </div>
                        </Link>
                      </DropdownMenuItem>

                      <DropdownMenuItem asChild className="h-10 cursor-pointer rounded-lg hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-colors">
                        <Link href="/contribute/my-drafts" className="flex items-center gap-3 px-3">
                          <Camera className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                          <div className="flex-1">
                            <div className="font-medium text-slate-900 dark:text-white">Đóng góp của tôi</div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">Bài viết và hình ảnh</div>
                          </div>
                        </Link>
                      </DropdownMenuItem>
                    </div>

                    <DropdownMenuSeparator className="my-2" />

                    {/* Settings & Support */}
                    <div className="mb-1">
                      <DropdownMenuItem asChild className="h-10 cursor-pointer rounded-lg hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-colors">
                        <Link href="/settings" className="flex items-center gap-3 px-3">
                          <Settings className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                          <div className="flex-1">
                            <div className="font-medium text-slate-900 dark:text-white">Cài đặt</div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">Tùy chỉnh tài khoản</div>
                          </div>
                        </Link>
                      </DropdownMenuItem>

                      <DropdownMenuItem asChild className="h-10 cursor-pointer rounded-lg hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-colors">
                        <Link href="/help/faq" className="flex items-center gap-3 px-3">
                          <HelpCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                          <div className="flex-1">
                            <div className="font-medium text-slate-900 dark:text-white">Trợ giúp</div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">FAQ và hướng dẫn</div>
                          </div>
                        </Link>
                      </DropdownMenuItem>
                    </div>

                    {/* Admin/Moderator Section */}
                    {(user.role === 'moderator' || user.role === 'admin') && (
                      <>
                        <DropdownMenuSeparator className="my-2" />
                        <div className="mb-1">
                          <DropdownMenuItem asChild className="h-10 cursor-pointer rounded-lg hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-colors">
                            <Link href="/moderation/dashboard" className="flex items-center gap-3 px-3">
                              <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                              <div className="flex-1">
                                <div className="font-medium text-slate-900 dark:text-white">Kiểm duyệt</div>
                                <div className="text-xs text-slate-500 dark:text-slate-400">Quản lý nội dung</div>
                              </div>
                            </Link>
                          </DropdownMenuItem>
                        </div>
                      </>
                    )}

                    {user.role === 'admin' && (
                      <div className="mb-1">
                        <DropdownMenuItem asChild className="h-10 cursor-pointer rounded-lg hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-colors">
                          <Link href="/admin/dashboard" className="flex items-center gap-3 px-3">
                            <Award className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                            <div className="flex-1">
                              <div className="font-medium text-slate-900 dark:text-white">Quản trị hệ thống</div>
                              <div className="text-xs text-slate-500 dark:text-slate-400">Bảng điều khiển admin</div>
                            </div>
                          </Link>
                        </DropdownMenuItem>
                      </div>
                    )}

                    <DropdownMenuSeparator className="my-2" />

                    {/* Logout */}
                    <DropdownMenuItem 
                      onClick={handleLogout}
                      className="h-10 cursor-pointer rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors px-3"
                    >
                      <div className="flex items-center gap-3 w-full">
                        <LogOut className="w-5 h-5 text-red-600 dark:text-red-400" />
                        <div className="flex-1">
                          <div className="font-medium text-red-600 dark:text-red-400">Đăng xuất</div>
                          <div className="text-xs text-red-500 dark:text-red-500">Thoát khỏi tài khoản</div>
                        </div>
                      </div>
                    </DropdownMenuItem>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                {/* CTA Button - Desktop */}
                <Button className="hidden md:inline-flex bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-600 hover:to-teal-600 text-white" onClick={openLoginModal}>
                  Bắt đầu với AI
                </Button>
                
                {/* Login Button */}
                <Button variant="ghost" onClick={openLoginModal} className="hidden sm:inline-flex">
                  Đăng nhập
                </Button>
              </>
            )}

            {/* Dark Mode Toggle - Using Icon Registry */}
            <IconButton
              icon={isDark ? "sun" : "moon"}
              label="Đổi giao diện"
              variant="ghost"
              onClick={toggleDarkMode}
              className="text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            />

            {/* Mobile Menu - Using Icon Registry */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <div className="md:hidden">
                  <IconButton
                    icon="menu"
                    label="Menu"
                    variant="ghost"
                    className="text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                  />
                </div>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px] bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-slate-200/50 dark:border-slate-800/50">
                <div className="flex flex-col gap-4 mt-8">
                  {/* Mobile Navigation */}
                  <nav className="flex flex-col gap-4">
                    {navigation.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className={cn(
                          "text-base font-medium transition-colors hover:text-slate-900 dark:hover:text-white py-2",
                          pathname === item.href 
                            ? "text-slate-900 dark:text-white font-semibold" 
                            : "text-slate-600 dark:text-slate-200"
                        )}
                      >
                        {item.name}
                      </Link>
                    ))}
                  </nav>

                  {/* Mobile Auth Actions */}
                  <div className="pt-4 border-t border-slate-200 dark:border-slate-700 space-y-2">
                    {isAuthenticated && user ? (
                      <>
                        <div className="flex items-center gap-3 p-3 glass-subtle rounded-xl">
                          <Avatar className="h-10 w-10 ring-2 ring-sky-200/50 dark:ring-sky-400/30">
                            <AvatarImage src={user.avatar} alt={user.fullName} />
                            <AvatarFallback className="bg-gradient-to-br from-sky-500 to-teal-500 text-white font-semibold">
                              {user.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm text-slate-900 dark:text-white truncate">{user.fullName}</p>
                            <p className="text-xs text-slate-600 dark:text-slate-400 truncate">{user.email}</p>
                            <UserRoleDisplay 
                              role={user.role}
                              variant="compact"
                              className="mt-1"
                            />
                          </div>
                        </div>
                        <Button 
                          variant="outline" 
                          className="w-full glass-subtle hover:bg-red-50 dark:hover:bg-red-900/20" 
                          onClick={handleLogout}
                        >
                          <LogOut className="w-4 h-4 mr-2" />
                          Đăng xuất
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button className="w-full bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-600 hover:to-teal-600 text-white" onClick={openLoginModal}>
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
