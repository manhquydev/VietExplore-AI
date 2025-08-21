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
import { useAuth } from "@/hooks/useAuth"
import { Icon, IconButton } from "@/components/ui/icon"
import { UserRoleDisplay } from "@/components/ui/role-badge"
import { Logo } from "@/components/ui/logo"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Trang chủ", href: "/" },
  { name: "Địa điểm", href: "/places" },
  { name: "Lịch trình", href: "/itineraries/builder" },
  { name: "Đóng góp", href: "/contribute/new-place" },
  { name: "Trợ lý AI", href: "/ai-assistant/chat" },
  { name: "Cộng đồng", href: "/community" },
  { name: "Về dự án", href: "/about" },
]

export const Header: React.FC = () => {
  const pathname = usePathname()
  const { user, isAuthenticated, logout } = useAuth()
  const [isDark, setIsDark] = React.useState(false)
  const [isOpen, setIsOpen] = React.useState(false)
  const [showLoginModal, setShowLoginModal] = React.useState(false)
  const [showRegisterModal, setShowRegisterModal] = React.useState(false)

  const toggleDarkMode = () => {
    setIsDark(!isDark)
    document.documentElement.classList.toggle('dark')
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
    <header className="sticky top-0 z-30 w-full backdrop-blur-md bg-white/95 border-b border-border shadow-soft">
      <div className="container mx-auto">
        <div className="flex h-[80px] items-center justify-between">
          {/* Enhanced Logo */}
          <Link href="/" className="flex items-center hover:scale-105 transition-all duration-200 group">
            <div className="relative p-1 lg:p-2">
              <Logo variant="horizontal" size="md" className="h-12 lg:h-16 drop-shadow-sm group-hover:drop-shadow-md transition-all duration-200" />
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 -z-10"></div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "text-[15px] font-medium transition-colors hover:text-text",
                  pathname === item.href ? "text-text" : "text-muted"
                )}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Authenticated User Menu */}
            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={user.avatar} alt={user.fullName} />
                      <AvatarFallback>
                        {user.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64" align="end" forceMount>
                  <div className="p-3">
                    <div className="flex flex-col space-y-2">
                      <p className="font-medium">{user.fullName}</p>
                      <p className="truncate text-sm text-muted">
                        {user.email}
                      </p>
                      <UserRoleDisplay 
                        role={user.role}
                        variant="compact"
                      />
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile/me">
                      <Icon name="user" className="mr-2" />
                      <span>Hồ sơ cá nhân</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/itineraries/my">
                      <span>Lịch trình của tôi</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/places/saved">
                      <Icon name="heart" className="mr-2" />
                      <span>Địa điểm yêu thích</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings">
                      <span>Cài đặt</span>
                    </Link>
                  </DropdownMenuItem>
                  {(user.role === 'moderator' || user.role === 'admin') && (
                    <DropdownMenuItem asChild>
                      <Link href="/moderation/dashboard">
                        <Icon name="shield" className="mr-2" />
                        <span>Kiểm duyệt</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {user.role === 'admin' && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin/dashboard">
                        <Icon name="settings" className="mr-2" />
                        <span>Quản trị hệ thống</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <span>Đăng xuất</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                {/* CTA Button - Desktop */}
                <Button className="hidden md:inline-flex" onClick={openLoginModal}>
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
            />

            {/* Mobile Menu - Using Icon Registry */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <div className="md:hidden">
                  <IconButton
                    icon="menu"
                    label="Menu"
                    variant="ghost"
                  />
                </div>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <div className="flex flex-col gap-4 mt-8">
                  {/* Mobile Navigation */}
                  <nav className="flex flex-col gap-4">
                    {navigation.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className={cn(
                          "text-base font-medium transition-colors hover:text-text py-2",
                          pathname === item.href ? "text-text" : "text-muted"
                        )}
                      >
                        {item.name}
                      </Link>
                    ))}
                  </nav>

                  {/* Mobile Auth Actions */}
                  <div className="pt-4 border-t border-border space-y-2">
                    {isAuthenticated && user ? (
                      <>
                        <div className="flex items-center gap-3 p-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.avatar} alt={user.fullName} />
                            <AvatarFallback>
                              {user.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">{user.fullName}</p>
                            <p className="text-xs text-muted">{user.email}</p>
                          </div>
                        </div>
                        <Button variant="outline" className="w-full" onClick={handleLogout}>
                          Đăng xuất
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button className="w-full" onClick={openLoginModal}>
                          Bắt đầu với AI
                        </Button>
                        <Button variant="outline" className="w-full" onClick={openRegisterModal}>
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