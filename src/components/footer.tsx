import * as React from "react"
import Link from "next/link"
import { Icon } from "@/components/ui/icon"

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

// Giới hạn 3 social icons theo DLV-ICON-POLICY
const socialLinks = [
  { name: "Facebook", href: "#", label: "FB" },
  { name: "Email", href: "mailto:hello@dulichviet.com", label: "Email" },
  { name: "GitHub", href: "https://github.com/dulichviet", label: "GitHub" },
]

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="container mx-auto py-10">
        {/* Main Footer Content */}
        <div className="grid md:grid-cols-4 gap-8 text-sm">
          {/* Brand & Description */}
          <div className="md:col-span-1">
            <h4 className="font-bold text-lg text-primary mb-3">
              Du Lịch Việt
            </h4>
            <p className="text-muted leading-relaxed mb-4">
              Nền tảng phi lợi nhuận, cung cấp thông tin du lịch Việt Nam đáng tin cậy với sự hỗ trợ của AI trợ lý thông minh.
            </p>
            
            {/* Social Links - Balanced text + icon approach */}
            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <Link
                  key={social.name}
                  href={social.href}
                  className="text-sm text-muted hover:text-primary transition-colors font-medium flex items-center gap-2"
                  aria-label={social.name}
                >
                  <Icon 
                    name={social.name.toLowerCase() === 'facebook' ? 'facebook' : 
                          social.name.toLowerCase() === 'email' ? 'mail' : 'github'} 
                    className="w-4 h-4" 
                  />
                  {social.label}
                </Link>
              ))}
            </div>
          </div>

          {/* About Links */}
          <div>
            <h5 className="font-semibold text-text mb-3">Giới thiệu</h5>
            <nav className="space-y-2">
              {footerLinks.about.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="block text-muted hover:text-text transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </nav>
          </div>

          {/* Resources Links */}
          <div>
            <h5 className="font-semibold text-text mb-3">Tài nguyên</h5>
            <nav className="space-y-2">
              {footerLinks.resources.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="block text-muted hover:text-text transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </nav>
          </div>

          {/* Legal Links */}
          <div>
            <h5 className="font-semibold text-text mb-3">Điều khoản</h5>
            <nav className="space-y-2">
              {footerLinks.legal.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="block text-muted hover:text-text transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-8 pt-6 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted">
          <div>
            <p>© {new Date().getFullYear()} Du Lịch Việt. Tất cả quyền được bảo lưu.</p>
            <p className="text-xs mt-1">
              Dự án phi lợi nhuận - Dữ liệu xác thực bởi cộng đồng
            </p>
          </div>
          
          <div className="text-xs">
            <p>Được xây dựng với ❤️ tại Việt Nam</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
