import * as React from "react"
import Link from "next/link"

const footerLinks = {
  about: [
    { name: "Về dự án", href: "/about" },
    { name: "Sứ mệnh", href: "/about/mission" },
    { name: "Liên hệ", href: "/about/contact" },
  ],
  resources: [
    { name: "Cộng đồng", href: "/community" },
    { name: "Hướng dẫn", href: "/help/faq" },
    { name: "Đóng góp", href: "/contribute/new-place" },
  ],
  legal: [
    { name: "Điều khoản", href: "/legal/terms" },
    { name: "Chính sách", href: "/legal/privacy" },
    { name: "Nội dung", href: "/legal/content-policy" },
  ],
}

// Typography-focused social links - Clear & Refined
const socialLinks = [
  { name: "Facebook", href: "#", label: "Facebook" },
  { name: "Email", href: "mailto:hello@dulichviet.com", label: "Email" },
  { name: "GitHub", href: "https://github.com/dulichviet", label: "GitHub" },
]

export const Footer: React.FC = () => {
  return (
    <footer className="relative overflow-hidden border-t border-border/50">
      {/* Gentle gradient background - Like evening mist */}
      <div className="absolute inset-0 bg-gradient-to-br from-surface via-bg to-primary/5" />
      
      <div className="container mx-auto py-12 sm:py-16 lg:py-20 relative">
        {/* Main Footer Content - Elegant spacing */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12 lg:gap-16 text-sm mb-12 sm:mb-16">
          {/* Brand Section - Typography as Voice */}
          <div className="sm:col-span-2 lg:col-span-1 space-y-6 lg:space-y-8">
            <div>
              <h4 className="font-bold text-2xl sm:text-3xl text-primary mb-4 sm:mb-6 tracking-tight">
                Du Lịch Việt
              </h4>
              <p className="text-muted leading-relaxed text-sm sm:text-base mb-6 sm:mb-8">
                Một cửa sổ trong suốt mở ra vẻ đẹp bất tận của Việt Nam. 
                Nơi mỗi thông tin đều được kiểm chứng, mỗi gợi ý đều đáng tin cậy.
              </p>
            </div>
            
            {/* Professional Social Icons */}
            <div className="space-y-4">
              <p className="text-xs text-muted font-semibold uppercase tracking-wider opacity-60">
                Kết nối với chúng tôi
              </p>
              <div className="flex gap-3">
                {/* Facebook */}
                <Link
                  href="#"
                  className="glass-subtle hover:text-primary motion-soft p-3 rounded-xl hover:scale-105 group"
                  aria-label="Facebook"
                >
                  <svg 
                    width="20" 
                    height="20" 
                    viewBox="0 0 24 24" 
                    fill="currentColor" 
                    className="text-muted group-hover:text-[#1877F2] transition-colors"
                  >
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </Link>

                {/* Email */}
                <Link
                  href="mailto:hello@dulichviet.com"
                  className="glass-subtle hover:text-primary motion-soft p-3 rounded-xl hover:scale-105 group"
                  aria-label="Email"
                >
                  <svg 
                    width="20" 
                    height="20" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                    className="text-muted group-hover:text-[#EA4335] transition-colors"
                  >
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                </Link>

                {/* GitHub */}
                <Link
                  href="https://github.com/dulichviet"
                  className="glass-subtle hover:text-primary motion-soft p-3 rounded-xl hover:scale-105 group"
                  aria-label="GitHub"
                >
                  <svg 
                    width="20" 
                    height="20" 
                    viewBox="0 0 24 24" 
                    fill="currentColor" 
                    className="text-muted group-hover:text-[#333] dark:group-hover:text-white transition-colors"
                  >
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                </Link>
              </div>
            </div>
          </div>

          {/* Navigation Links - Enhanced mobile-responsive layout */}
          <div className="space-y-4 sm:space-y-6">
            <h5 className="font-bold text-foreground mb-4 sm:mb-6 text-base sm:text-lg">Giới thiệu</h5>
            <nav className="space-y-3 sm:space-y-4">
              {footerLinks.about.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="block text-muted hover:text-primary motion-soft hover:translate-x-2 transform text-sm sm:text-base py-1 touch-target-44"
                >
                  {link.name}
                </Link>
              ))}
            </nav>
          </div>

          <div className="space-y-4 sm:space-y-6">
            <h5 className="font-bold text-foreground mb-4 sm:mb-6 text-base sm:text-lg">Tài nguyên</h5>
            <nav className="space-y-3 sm:space-y-4">
              {footerLinks.resources.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="block text-muted hover:text-primary motion-soft hover:translate-x-2 transform text-sm sm:text-base py-1 touch-target-44"
                >
                  {link.name}
                </Link>
              ))}
            </nav>
          </div>

          <div className="space-y-4 sm:space-y-6">
            <h5 className="font-bold text-foreground mb-4 sm:mb-6 text-base sm:text-lg">Điều khoản</h5>
            <nav className="space-y-3 sm:space-y-4">
              {footerLinks.legal.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="block text-muted hover:text-primary motion-soft hover:translate-x-2 transform text-sm sm:text-base py-1 touch-target-44"
                >
                  {link.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        {/* Trust Badge Section - Mobile-optimized layout */}
        <div className="glass-card p-6 sm:p-8 mb-12 sm:mb-16">
          <div className="text-left sm:text-center space-y-6 sm:space-y-8">
            <h5 className="text-base sm:text-lg font-bold text-foreground">Hệ thống tin cậy</h5>
            
            <div className="flex flex-col sm:flex-row sm:justify-center items-start sm:items-center gap-4 sm:gap-8 lg:gap-12">
              <div className="flex items-center gap-2 sm:gap-3 motion-gentle hover:scale-105">
                <img src="/badges/verified.svg" alt="Verified" className="w-8 h-8 sm:w-10 sm:h-10" />
                <span className="text-xs sm:text-sm font-medium text-muted">UNESCO Heritage</span>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 motion-gentle hover:scale-105">
                <img src="/badges/contributor.svg" alt="Contributor" className="w-8 h-8 sm:w-10 sm:h-10" />
                <span className="text-xs sm:text-sm font-medium text-muted">Expert Contributors</span>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 motion-gentle hover:scale-105">
                <img src="/badges/community-partner.svg" alt="Partner" className="w-9 h-9 sm:w-11 sm:h-11" />
                <span className="text-xs sm:text-sm font-medium text-muted">Official Partners</span>
              </div>
            </div>
            
            <div className="max-w-3xl sm:mx-auto">
              <p className="text-xs sm:text-sm text-muted leading-relaxed text-left sm:text-center">
                Du Lịch Việt cam kết cung cấp thông tin chính xác, đáng tin cậy với hệ thống kiểm duyệt nghiêm ngặt. 
                Mỗi nội dung đều được xác minh bởi cộng đồng chuyên gia và đối tác chính thống.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Section - Mobile-first responsive layout */}
        <div className="pt-6 sm:pt-8 border-t border-border/30">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-6">
            <div className="text-center sm:text-left">
              <p className="text-xs sm:text-sm text-muted">
                © 2025 Du Lịch Việt. Nền tảng phi lợi nhuận phục vụ cộng đồng.
              </p>
              <p className="text-xs text-muted/70 mt-1 sm:mt-2">
                Một sản phẩm được tạo ra với tình yêu Việt Nam
              </p>
            </div>
            
            <div className="flex items-center gap-3 sm:gap-6 text-xs sm:text-sm text-muted">
              <span className="glass-subtle px-3 py-1 rounded-lg">Phiên bản 1.0</span>
              <span className="flex items-center gap-2">
                <span>Made with</span>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="16" 
                  height="16" 
                  viewBox="0 0 24 24" 
                  fill="currentColor" 
                  stroke="none"
                  className="text-red-500 animate-pulse"
                >
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
                <span>in Vietnam</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
