"use client"

import * as React from "react"
import { Metadata } from "next"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card-custom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"

// Remove metadata export since we're using "use client"
// We'll handle SEO differently for client components if needed

type ContactType = 'general' | 'role-upgrade' | 'suggest-place' | 'report' | 'partnership' | 'technical'

const contactTypes = [
  {
    id: 'general' as ContactType,
    label: 'Hỗ trợ chung',
    description: 'Câu hỏi và hỗ trợ sử dụng nền tảng',
    color: 'bg-blue-50 border-blue-200 text-blue-800',
    accent: 'border-l-blue-500'
  },
  {
    id: 'role-upgrade' as ContactType,
    label: 'Nâng cấp quyền hạn',
    description: 'Đăng ký trở thành Contributor hoặc Community Partner',
    color: 'bg-green-50 border-green-200 text-green-800',
    accent: 'border-l-green-500'
  },
  {
    id: 'suggest-place' as ContactType,
    label: 'Đề xuất địa điểm',
    description: 'Gợi ý địa điểm mới cho Ban biên tập',
    color: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    accent: 'border-l-yellow-500'
  },
  {
    id: 'report' as ContactType,
    label: 'Báo cáo vi phạm',
    description: 'Báo cáo nội dung không phù hợp hoặc sai sự thật',
    color: 'bg-red-50 border-red-200 text-red-800',
    accent: 'border-l-red-500'
  },
  {
    id: 'partnership' as ContactType,
    label: 'Hợp tác kinh doanh',
    description: 'Liên hệ hợp tác cho tổ chức, doanh nghiệp',
    color: 'bg-purple-50 border-purple-200 text-purple-800',
    accent: 'border-l-purple-500'
  },
  {
    id: 'technical' as ContactType,
    label: 'Hỗ trợ kỹ thuật',
    description: 'Lỗi hệ thống, vấn đề kỹ thuật',
    color: 'bg-gray-50 border-gray-200 text-gray-800',
    accent: 'border-l-gray-500'
  }
]

export default function ContactPage() {
  const searchParams = useSearchParams()
  const [selectedType, setSelectedType] = React.useState<ContactType>(
    (searchParams.get('type') as ContactType) || 'general'
  )
  const [formData, setFormData] = React.useState({
    firstName: '',
    lastName: '',
    email: '',
    subject: '',
    message: '',
    // Role upgrade specific fields
    currentRole: '',
    experience: '',
    socialProfiles: '',
    // Place suggestion specific fields
    placeName: '',
    placeLocation: '',
    placeDescription: '',
    // Report specific fields
    reportUrl: '',
    reportReason: '',
    // Partnership specific fields
    organizationName: '',
    organizationType: '',
    website: ''
  })

  const currentType = contactTypes.find(type => type.id === selectedType)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission logic here
    console.log('Form submitted:', { type: selectedType, data: formData })
  }

  const renderSpecificFields = () => {
    switch (selectedType) {
      case 'role-upgrade':
        return (
          <>
            <div>
              <Label htmlFor="currentRole" className="text-sm font-medium mb-2 block">Vai trò hiện tại</Label>
              <Select value={formData.currentRole} onValueChange={(value) => setFormData(prev => ({ ...prev, currentRole: value }))}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Chọn vai trò hiện tại" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="traveler">Traveler (Người dùng thường)</SelectItem>
                  <SelectItem value="guest">Guest (Chưa đăng ký)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="experience" className="text-sm font-medium mb-2 block">Kinh nghiệm du lịch/Lĩnh vực chuyên môn</Label>
              <Textarea
                id="experience"
                value={formData.experience}
                onChange={(e) => setFormData(prev => ({ ...prev, experience: e.target.value }))}
                className="min-h-[100px] resize-none"
                placeholder="Mô tả kinh nghiệm du lịch, blog, hướng dẫn viên, hoặc chuyên môn trong lĩnh vực du lịch..."
              />
            </div>
            
            <div>
              <Label htmlFor="socialProfiles" className="text-sm font-medium mb-2 block">Trang cá nhân/Social Media (nếu có)</Label>
              <Textarea
                id="socialProfiles"
                value={formData.socialProfiles}
                onChange={(e) => setFormData(prev => ({ ...prev, socialProfiles: e.target.value }))}
                className="min-h-[80px] resize-none"
                placeholder="Facebook, Instagram, Blog cá nhân, YouTube... (mỗi link một dòng)"
              />
            </div>
          </>
        )
        
      case 'suggest-place':
        return (
          <>
            <div>
              <Label htmlFor="placeName" className="text-sm font-medium mb-2 block">Tên địa điểm</Label>
              <Input
                id="placeName"
                value={formData.placeName}
                onChange={(e) => setFormData(prev => ({ ...prev, placeName: e.target.value }))}
                placeholder="Ví dụ: Hồ Tràm Beach, Núi Bà Đen..."
                className="h-12"
              />
            </div>
            
            <div>
              <Label htmlFor="placeLocation" className="text-sm font-medium mb-2 block">Vị trí (Tỉnh/Thành phố)</Label>
              <Input
                id="placeLocation"
                value={formData.placeLocation}
                onChange={(e) => setFormData(prev => ({ ...prev, placeLocation: e.target.value }))}
                placeholder="Ví dụ: Bà Rịa - Vũng Tàu, Tây Ninh..."
                className="h-12"
              />
            </div>
            
            <div>
              <Label htmlFor="placeDescription" className="text-sm font-medium mb-2 block">Mô tả địa điểm</Label>
              <Textarea
                id="placeDescription"
                value={formData.placeDescription}
                onChange={(e) => setFormData(prev => ({ ...prev, placeDescription: e.target.value }))}
                className="min-h-[120px] resize-none"
                placeholder="Mô tả về địa điểm, đặc điểm nổi bật, lý do nên thêm vào nền tảng..."
              />
            </div>
          </>
        )
        
      case 'report':
        return (
          <>
            <div>
              <Label htmlFor="reportUrl" className="text-sm font-medium mb-2 block">Link địa điểm/nội dung vi phạm</Label>
              <Input
                id="reportUrl"
                value={formData.reportUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, reportUrl: e.target.value }))}
                placeholder="https://dulichviet.com/places/..."
                className="h-12"
              />
            </div>
            
            <div>
              <Label htmlFor="reportReason" className="text-sm font-medium mb-2 block">Lý do báo cáo</Label>
              <Select value={formData.reportReason} onValueChange={(value) => setFormData(prev => ({ ...prev, reportReason: value }))}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Chọn lý do báo cáo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="wrong-info">Thông tin sai sự thật</SelectItem>
                  <SelectItem value="inappropriate">Nội dung không phù hợp</SelectItem>
                  <SelectItem value="spam">Spam/Quảng cáo</SelectItem>
                  <SelectItem value="copyright">Vi phạm bản quyền</SelectItem>
                  <SelectItem value="other">Khác</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )
        
      case 'partnership':
        return (
          <>
            <div>
              <Label htmlFor="organizationName" className="text-sm font-medium mb-2 block">Tên tổ chức/Doanh nghiệp</Label>
              <Input
                id="organizationName"
                value={formData.organizationName}
                onChange={(e) => setFormData(prev => ({ ...prev, organizationName: e.target.value }))}
                placeholder="Ví dụ: Sở Du lịch Đà Nẵng, ABC Travel..."
                className="h-12"
              />
            </div>
            
            <div>
              <Label htmlFor="organizationType" className="text-sm font-medium mb-2 block">Loại hình tổ chức</Label>
              <Select value={formData.organizationType} onValueChange={(value) => setFormData(prev => ({ ...prev, organizationType: value }))}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Chọn loại hình tổ chức" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="government">Cơ quan nhà nước</SelectItem>
                  <SelectItem value="tourism-board">Sở Du lịch/Văn hóa</SelectItem>
                  <SelectItem value="travel-agency">Công ty du lịch</SelectItem>
                  <SelectItem value="hotel">Khách sạn/Resort</SelectItem>
                  <SelectItem value="restaurant">Nhà hàng/Ẩm thực</SelectItem>
                  <SelectItem value="cultural">Tổ chức văn hóa</SelectItem>
                  <SelectItem value="media">Truyền thông/Báo chí</SelectItem>
                  <SelectItem value="other">Khác</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="website" className="text-sm font-medium mb-2 block">Website (nếu có)</Label>
              <Input
                id="website"
                value={formData.website}
                onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                placeholder="https://..."
                className="h-12"
              />
            </div>
          </>
        )
        
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-bg text-text">
      <Header />
      
      <div className="container mx-auto py-20 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-text mb-6">
            Liên hệ với chúng tôi
          </h1>
          <p className="text-xl text-muted max-w-3xl mx-auto leading-relaxed text-justify">
            Chúng tôi cung cấp nhiều kênh hỗ trợ chuyên biệt để phục vụ tốt nhất các nhu cầu khác nhau của cộng đồng. 
            Hãy chọn loại yêu cầu phù hợp để được hỗ trợ nhanh nhất.
          </p>
        </div>

        {/* Contact Type Selection */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-center">Chọn loại yêu cầu</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {contactTypes.map((type) => (
              <Card 
                key={type.id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-md border-l-4 ${type.accent} ${
                  selectedType === type.id 
                    ? `ring-2 ring-primary ${type.color}` 
                    : 'hover:scale-105'
                }`}
                onClick={() => setSelectedType(type.id)}
              >
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-lg">{type.label}</h3>
                      {selectedType === type.id && (
                        <Badge className="bg-primary text-white" variant="secondary">Đã chọn</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted leading-relaxed text-justify">{type.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            {currentType && (
              <Card className={`border-l-4 ${currentType.accent} shadow-lg`}>
                <CardHeader className="pb-6">
                  <div className="space-y-2">
                    <CardTitle className="text-2xl font-bold">{currentType.label}</CardTitle>
                    <p className="text-muted leading-relaxed">{currentType.description}</p>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="firstName" className="text-sm font-medium mb-2 block">Họ</Label>
                        <Input 
                          id="firstName" 
                          value={formData.firstName}
                          onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                          placeholder="Nhập họ" 
                          className="h-12" 
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName" className="text-sm font-medium mb-2 block">Tên</Label>
                        <Input 
                          id="lastName" 
                          value={formData.lastName}
                          onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                          placeholder="Nhập tên" 
                          className="h-12" 
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="email" className="text-sm font-medium mb-2 block">Email</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="your@email.com" 
                        className="h-12" 
                        required
                      />
                    </div>
                    
                    {renderSpecificFields()}
                    
                    <div>
                      <Label htmlFor="subject" className="text-sm font-medium mb-2 block">Chủ đề</Label>
                      <Input 
                        id="subject" 
                        value={formData.subject}
                        onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                        placeholder="Tóm tắt nội dung yêu cầu" 
                        className="h-12" 
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="message" className="text-sm font-medium mb-2 block">Nội dung chi tiết</Label>
                      <Textarea
                        id="message"
                        value={formData.message}
                        onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                        className="min-h-[140px] resize-none"
                        placeholder="Mô tả chi tiết yêu cầu của bạn..."
                        required
                      />
                    </div>
                    
                    <Button type="submit" className="w-full h-12 text-base font-medium">
                      Gửi yêu cầu →
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>
          {/* Contact Info & Guidelines */}
          <div className="space-y-6">
            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="p-8">
                <h3 className="font-bold text-xl text-blue-900 mb-6">Email chuyên biệt</h3>
                <div className="space-y-4 text-sm">
                  <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                    <p className="font-semibold mb-1 text-green-800">Nâng cấp quyền hạn:</p>
                    <a href="mailto:roles@dulichviet.com" className="text-green-600 hover:underline font-medium">
                      roles@dulichviet.com
                    </a>
                  </div>
                  <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <p className="font-semibold mb-1 text-yellow-800">Đề xuất địa điểm:</p>
                    <a href="mailto:suggest@dulichviet.com" className="text-yellow-600 hover:underline font-medium">
                      suggest@dulichviet.com
                    </a>
                  </div>
                  <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                    <p className="font-semibold mb-1 text-red-800">Báo cáo vi phạm:</p>
                    <a href="mailto:report@dulichviet.com" className="text-red-600 hover:underline font-medium">
                      report@dulichviet.com
                    </a>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <p className="font-semibold mb-1 text-purple-800">Hợp tác kinh doanh:</p>
                    <a href="mailto:partnership@dulichviet.com" className="text-purple-600 hover:underline font-medium">
                      partnership@dulichviet.com
                    </a>
                  </div>
                  <div>
                    <p className="font-medium mb-1">Hỗ trợ kỹ thuật:</p>
                    <a href="mailto:tech@dulichviet.com" className="text-primary hover:underline">
                    </a>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="font-semibold mb-1 text-gray-800">Hỗ trợ kỹ thuật:</p>
                    <a href="mailto:tech@dulichviet.com" className="text-gray-600 hover:underline font-medium">
                      tech@dulichviet.com
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-indigo-500">
              <CardContent className="p-8">
                <h3 className="font-bold text-xl text-indigo-900 mb-6">Thời gian xử lý</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between p-2 bg-blue-50 rounded">
                    <span className="text-gray-700">Hỗ trợ chung:</span>
                    <span className="font-bold text-blue-600">24-48 giờ</span>
                  </div>
                  <div className="flex justify-between p-2 bg-green-50 rounded">
                    <span className="text-gray-700">Nâng cấp quyền:</span>
                    <span className="font-bold text-green-600">3-5 ngày</span>
                  </div>
                  <div className="flex justify-between p-2 bg-yellow-50 rounded">
                    <span className="text-gray-700">Đề xuất địa điểm:</span>
                    <span className="font-bold text-yellow-600">1-2 ngày</span>
                  </div>
                  <div className="flex justify-between p-2 bg-red-50 rounded">
                    <span className="text-gray-700">Báo cáo vi phạm:</span>
                    <span className="font-bold text-red-600">≤ 48 giờ</span>
                  </div>
                  <div className="flex justify-between p-2 bg-purple-50 rounded">
                    <span className="text-gray-700">Hợp tác kinh doanh:</span>
                    <span className="font-bold text-purple-600">1-2 tuần</span>
                  </div>
                  <div className="flex justify-between p-2 bg-gray-50 rounded">
                    <span className="text-gray-700">Hỗ trợ kỹ thuật:</span>
                    <span className="font-bold text-gray-600">12-24 giờ</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {selectedType === 'role-upgrade' && (
              <Card className="border-l-4 border-l-green-500 bg-green-50">
                <CardContent className="p-8">
                  <h3 className="font-bold text-xl text-green-800 mb-6">Yêu cầu nâng cấp</h3>
                  <div className="space-y-4 text-sm">
                    <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-green-200">
                      <svg className="w-5 h-5 mt-0.5 flex-shrink-0 text-green-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                      </svg>
                      <span className="text-green-700 font-medium">Tài khoản hoạt động tối thiểu 30 ngày</span>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-green-200">
                      <svg className="w-5 h-5 mt-0.5 flex-shrink-0 text-green-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                      </svg>
                      <span>Kinh nghiệm du lịch hoặc chuyên môn liên quan</span>
                      <span className="text-green-700 font-medium">Kinh nghiệm du lịch hoặc chuyên môn liên quan</span>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-green-200">
                      <svg className="w-5 h-5 mt-0.5 flex-shrink-0 text-green-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                      </svg>
                      <span className="text-green-700 font-medium">Cam kết tuân thủ quy tắc cộng đồng</span>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-green-200">
                      <svg className="w-5 h-5 mt-0.5 flex-shrink-0 text-green-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                      </svg>
                      <span className="text-green-700 font-medium">Có thể cung cấp nguồn tham khảo đáng tin cậy</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="border-l-4 border-l-teal-500">
              <CardContent className="p-8">
                <h3 className="font-bold text-xl text-teal-900 mb-6">Kênh liên hệ khác</h3>
                <div className="space-y-4">
                  <a
                    href="https://facebook.com/dulichviet"
                    className="block p-4 bg-blue-50 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm">f</span>
                      </div>
                      <div>
                        <p className="font-semibold text-blue-800 group-hover:text-blue-900">Facebook Community</p>
                        <p className="text-sm text-blue-600">Thảo luận và hỗ trợ cộng đồng</p>
                      </div>
                    </div>
                  </a>
                  <a
                    href="https://github.com/dulichviet"
                    className="block p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                        </svg>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 group-hover:text-gray-900">GitHub</p>
                        <p className="text-sm text-gray-600">Báo lỗi kỹ thuật và đóng góp code</p>
                      </div>
                    </div>
                  </a>
                  <Link
                    href="/help/faq"
                    className="block p-4 bg-amber-50 rounded-lg border border-amber-200 hover:bg-amber-100 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                      </div>
                      <div>
                        <p className="font-semibold text-amber-800 group-hover:text-amber-900">FAQ</p>
                        <p className="text-sm text-amber-600">Câu hỏi thường gặp</p>
                      </div>
                    </div>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-16 grid md:grid-cols-2 gap-8">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-8 border border-blue-200">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-4 text-blue-900">Bạn mới tham gia?</h3>
              <p className="text-blue-700 mb-6 leading-relaxed">
                Tìm hiểu về quy trình hoạt động và cách tham gia đóng góp cho cộng đồng
              </p>
              <Button variant="secondary" asChild className="bg-blue-600 text-white hover:bg-blue-700">
                <Link href="/community/handbook">
                  Hướng dẫn tham gia →
                </Link>
              </Button>
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-50 to-orange-100 rounded-xl p-8 border border-yellow-200">
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-4 text-yellow-900">Câu hỏi thường gặp</h3>
              <p className="text-yellow-700 mb-6 leading-relaxed">
                Có thể câu hỏi của bạn đã được trả lời trong phần FAQ
              </p>
              <Button variant="secondary" asChild className="bg-yellow-600 text-white hover:bg-yellow-700">
                <Link href="/help/faq">
                  Xem FAQ →
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  )
}
