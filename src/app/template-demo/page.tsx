"use client"

export const dynamic = 'force-dynamic'

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card-custom"
import { Badge } from "@/components/ui/badge"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { PlaceDetailContent } from "@/components/place-detail-content"
import { PlaceDetailTemplate2 } from "@/components/place-detail-template-2"
import { PlaceDetailTemplate3 } from "@/components/place-detail-template-3"
import {
  LayoutGrid,
  Newspaper,
  Map,
  ArrowRight,
  Star,
  Eye,
  Heart,
  Bookmark,
  CheckCircle,
  Layers,
  Compass,
  Camera
} from "lucide-react"
import { cn } from "@/lib/utils"

// Mock data for demo
const mockPlace = {
  id: "bai-bien-my-khe-da-nang",
  name: "Suối nước nóng Quang Hanh",
  shortDescription: "Suối nước nóng thiên nhiên nổi tiếng với khoáng chất quý hiếm, tọa lạc tại vùng đất có lịch sử thay đổi hành chính",
  description: `Suối nước nóng Quang Hanh là một trong những điểm du lịch nổi tiếng tại Hà Tĩnh, được biết đến với làn nước nóng thiên nhiên chứa nhiều khoáng chất có lợi cho sức khỏe.

Suối có nhiệt độ dao động từ 38-42°C quanh năm, chứa các khoáng chất như lưu huỳnh, natri bicarbonate và silica, rất tốt cho việc điều trị các bệnh về da và xương khớp.

Khu vực này đã trải qua nhiều thay đổi về mặt hành chính, từ thị xã Hồng Lĩnh nay đã được nâng cấp thành thành phố Hồng Lĩnh, thể hiện sự phát triển không ngừng của vùng đất này.

Du khách có thể tận hưởng các dịch vụ tắm suối, massage và thưởng thức các món ăn đặc sản địa phương trong không gian thiên nhiên tuyệt đẹp.`,
  type: "van-hoa" as const,
  region: "trung-bo" as const,
  province: "Hà Tĩnh",
  address: "Đường Quang Trung, Phường Bắc Hồng, TP. Hồng Lĩnh, Hà Tĩnh",
  coordinates: {
    lat: 16.0544,
    lng: 108.2277
  },
  images: [
    {
      id: "img1",
      url: "https://images.unsplash.com/photo-1539650116574-75c0c6d73c6e?w=800",
      alt: "Toàn cảnh bãi biển Mỹ Khê",
      caption: "Bãi biển Mỹ Khê vào buổi sáng với cát trắng mịn",
      isPrimary: true
    },
    {
      id: "img2",
      url: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800",
      alt: "Hoạt động lướt sóng tại Mỹ Khê",
      caption: "Du khách lướt sóng tại bãi biển",
      isPrimary: false
    },
    {
      id: "img3",
      url: "https://images.unsplash.com/photo-1540979388789-6cee28a1cdc9?w=800",
      alt: "Cầu Rồng nhìn từ bãi biển",
      caption: "Cầu Rồng nhìn từ bãi biển Mỹ Khê",
      isPrimary: false
    },
    {
      id: "img4",
      url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
      alt: "Hoàng hôn tại Mỹ Khê",
      caption: "Hoàng hôn tuyệt đẹp tại bãi biển Mỹ Khê",
      isPrimary: false
    }
  ],
  video: {
    id: "video-1",
    url: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
    thumbnail: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
    duration: 60
  },
  openingHours: "24/7",
  entryFee: "Miễn phí",
  bestTimeToVisit: "Tháng 3 - 8",
  facilities: ["Bãi đỗ xe", "Nhà vệ sinh", "Khu thay đồ", "Nhà hàng", "Cửa hàng lưu niệm", "WiFi miễn phí"],
  tags: ["biển", "gia đình", "thể thao", "check-in", "bình minh"],
  sources: [
    {
      type: "website" as const,
      url: "https://danang.gov.vn",
      description: "Website chính thức thành phố Đà Nẵng"
    },
    {
      type: "social" as const,
      url: "https://facebook.com/danangfantasticity",
      description: "Fanpage du lịch Đà Nẵng"
    }
  ],
  trustLevel: "partner" as const,
  authorRole: "partner" as const,
  authorName: "Sở Du lịch Đà Nẵng",
  createdAt: "2024-01-15",
  updatedAt: "2024-02-20",
  stats: {
    views: 15420,
    likes: 892,
    saves: 234,
    reviews: 67
  },
  vietnamAddress: {
    provinceId: "26",
    provinceName: "Hà Tĩnh",
    districtId: "259",
    districtName: "TP. Hồng Lĩnh",
    wardId: "9265",
    wardName: "Phường Bắc Hồng",
    fullAddress: "Phường Bắc Hồng, TP. Hồng Lĩnh, Hà Tĩnh"
  },
  addressConversion: {
    oldAddress: {
      province: { id: 26, name: "Hà Tĩnh" },
      district: { id: 259, name: "TX. Hồng Lĩnh" },
      ward: { id: 9265, name: "Phường Bắc Hồng" },
      fullAddress: "Phường Bắc Hồng, TX. Hồng Lĩnh, Hà Tĩnh"
    },
    newAddress: {
      province: { id: 26, name: "Hà Tĩnh" },
      district: { id: 259, name: "TP. Hồng Lĩnh" },
      ward: { id: 9265, name: "Phường Bắc Hồng" },
      fullAddress: "Phường Bắc Hồng, TP. Hồng Lĩnh, Hà Tĩnh"
    },
    hasChanges: true,
    conversionMessage: "Thị xã Hồng Lĩnh đã được nâng cấp thành thành phố Hồng Lĩnh theo Nghị quyết 1211/NQ-UBTVQH14 ngày 16/11/2021",
    status: 'converted' as const
  }
}

const templates = [
  {
    id: "template-1",
    name: "Modern Card-based Layout",
    icon: LayoutGrid,
    description: "Layout hiện đại với thiết kế card-based, tối ưu cho mobile và desktop",
    features: [
      "Hero section với gallery ảnh tương tác",
      "Sidebar thông tin chi tiết",
      "Layout responsive hoàn hảo",
      "Action buttons nổi bật",
      "Card design hiện đại"
    ],
    color: "blue",
    component: PlaceDetailContent
  },
  {
    id: "template-2",
    name: "Magazine-style Layout",
    icon: Newspaper,
    description: "Thiết kế phong cách tạp chí với typography đẹp và trình bày chuyên nghiệp",
    features: [
      "Hero full-screen ấn tượng",
      "Typography tạp chí chuyên nghiệp",
      "Image spread magazine-style",
      "Byline và author bio chi tiết",
      "Pull quotes và highlight"
    ],
    color: "red",
    component: PlaceDetailTemplate2
  },
  {
    id: "template-3",
    name: "Interactive Map-focused Layout",
    icon: Map,
    description: "Layout split-view với bản đồ tương tác, lý tưởng cho thông tin địa lý",
    features: [
      "Split-view với bản đồ tương tác",
      "Map controls và view modes",
      "GPS coordinates chi tiết",
      "Location-focused information",
      "Map integration với actions"
    ],
    color: "green",
    component: PlaceDetailTemplate3
  }
]

export default function TemplateDemoPage() {
  const [selectedTemplate, setSelectedTemplate] = React.useState<string | null>(null)
  const [showComparison, setShowComparison] = React.useState(true)

  if (selectedTemplate) {
    const template = templates.find(t => t.id === selectedTemplate)
    if (template) {
      const TemplateComponent = template.component
      return (
        <div className="relative">
          {/* Back button */}
          <div className="fixed top-20 left-4 z-50">
            <Button
              onClick={() => setSelectedTemplate(null)}
              className="bg-white/90 backdrop-blur-md text-gray-900 hover:bg-white border border-gray-200 shadow-lg"
            >
              ← Quay lại so sánh
            </Button>
          </div>
          <TemplateComponent place={mockPlace} />
        </div>
      )
    }
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
        <div className="container mx-auto px-4 py-12 max-w-7xl">
          {/* Header */}
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-blue-100 text-blue-800 px-4 py-2">
              Template Demo
            </Badge>
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              3 Mẫu Template Trang Chi Tiết Địa Điểm
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Khám phá và so sánh 3 thiết kế template khác nhau cho trang chi tiết địa điểm,
              mỗi template được tối ưu cho trải nghiệm người dùng và mục đích sử dụng riêng biệt.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
            <Card className="text-center border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <LayoutGrid className="h-6 w-6 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-2">3</div>
                <div className="text-gray-600">Template Designs</div>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-2">100%</div>
                <div className="text-gray-600">Responsive Design</div>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Layers className="h-6 w-6 text-purple-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-2">15+</div>
                <div className="text-gray-600">UI Components</div>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="h-6 w-6 text-orange-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-2">A+</div>
                <div className="text-gray-600">UX Rating</div>
              </CardContent>
            </Card>
          </div>

          {/* Templates Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
            {templates.map((template) => {
              const Icon = template.icon
              const colorClasses = {
                blue: "from-blue-500 to-indigo-600 bg-blue-50 border-blue-200 text-blue-700",
                red: "from-red-500 to-pink-600 bg-red-50 border-red-200 text-red-700",
                green: "from-green-500 to-emerald-600 bg-green-50 border-green-200 text-green-700"
              }

              return (
                <Card key={template.id} className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 group cursor-pointer">
                  <CardHeader className="pb-4">
                    <div className={cn(
                      "w-16 h-16 bg-gradient-to-r rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300",
                      template.color === 'blue' && 'from-blue-500 to-indigo-600',
                      template.color === 'red' && 'from-red-500 to-pink-600',
                      template.color === 'green' && 'from-green-500 to-emerald-600'
                    )}>
                      <Icon className="h-8 w-8 text-white" />
                    </div>

                    <CardTitle className="text-2xl font-bold text-gray-900 mb-3">
                      {template.name}
                    </CardTitle>

                    <p className="text-gray-600 leading-relaxed">
                      {template.description}
                    </p>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-3 mb-6">
                      {template.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <CheckCircle className={cn(
                            "h-4 w-4",
                            template.color === 'blue' && 'text-blue-600',
                            template.color === 'red' && 'text-red-600',
                            template.color === 'green' && 'text-green-600'
                          )} />
                          <span className="text-sm text-gray-700">{feature}</span>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-3">
                      <Button
                        onClick={() => setSelectedTemplate(template.id)}
                        className={cn(
                          "w-full font-semibold text-white transition-all duration-300 group-hover:scale-105",
                          template.color === 'blue' && 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700',
                          template.color === 'red' && 'bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700',
                          template.color === 'green' && 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700'
                        )}
                      >
                        Xem Template Live Demo
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>

                      <Badge
                        variant="outline"
                        className={cn(
                          "w-full justify-center py-2 font-medium",
                          colorClasses[template.color as keyof typeof colorClasses]
                        )}
                      >
                        {template.id === 'template-1' && 'Recommended for E-commerce'}
                        {template.id === 'template-2' && 'Perfect for Storytelling'}
                        {template.id === 'template-3' && 'Ideal for Location-based'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Comparison Section */}
          <Card className="border-0 shadow-2xl bg-gradient-to-r from-gray-900 to-gray-800 text-white">
            <CardContent className="p-12">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold mb-4">So Sánh Templates</h2>
                <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                  Bảng so sánh chi tiết các tính năng và ưu điểm của từng template
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-600">
                      <th className="text-left py-4 px-4 font-semibold">Tính năng</th>
                      <th className="text-center py-4 px-4 font-semibold">Template 1</th>
                      <th className="text-center py-4 px-4 font-semibold">Template 2</th>
                      <th className="text-center py-4 px-4 font-semibold">Template 3</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-300">
                    <tr className="border-b border-gray-700">
                      <td className="py-4 px-4">Mobile Responsiveness</td>
                      <td className="text-center py-4 px-4">
                        <CheckCircle className="h-5 w-5 text-green-400 mx-auto" />
                      </td>
                      <td className="text-center py-4 px-4">
                        <CheckCircle className="h-5 w-5 text-green-400 mx-auto" />
                      </td>
                      <td className="text-center py-4 px-4">
                        <CheckCircle className="h-5 w-5 text-green-400 mx-auto" />
                      </td>
                    </tr>
                    <tr className="border-b border-gray-700">
                      <td className="py-4 px-4">Image Gallery</td>
                      <td className="text-center py-4 px-4">
                        <CheckCircle className="h-5 w-5 text-green-400 mx-auto" />
                      </td>
                      <td className="text-center py-4 px-4">
                        <CheckCircle className="h-5 w-5 text-green-400 mx-auto" />
                      </td>
                      <td className="text-center py-4 px-4">
                        <CheckCircle className="h-5 w-5 text-green-400 mx-auto" />
                      </td>
                    </tr>
                    <tr className="border-b border-gray-700">
                      <td className="py-4 px-4">Interactive Map</td>
                      <td className="text-center py-4 px-4">-</td>
                      <td className="text-center py-4 px-4">-</td>
                      <td className="text-center py-4 px-4">
                        <CheckCircle className="h-5 w-5 text-green-400 mx-auto" />
                      </td>
                    </tr>
                    <tr className="border-b border-gray-700">
                      <td className="py-4 px-4">Magazine Layout</td>
                      <td className="text-center py-4 px-4">-</td>
                      <td className="text-center py-4 px-4">
                        <CheckCircle className="h-5 w-5 text-green-400 mx-auto" />
                      </td>
                      <td className="text-center py-4 px-4">-</td>
                    </tr>
                    <tr className="border-b border-gray-700">
                      <td className="py-4 px-4">Card-based Design</td>
                      <td className="text-center py-4 px-4">
                        <CheckCircle className="h-5 w-5 text-green-400 mx-auto" />
                      </td>
                      <td className="text-center py-4 px-4">-</td>
                      <td className="text-center py-4 px-4">Partial</td>
                    </tr>
                    <tr className="border-b border-gray-700">
                      <td className="py-4 px-4">Best for</td>
                      <td className="text-center py-4 px-4 text-blue-400">E-commerce</td>
                      <td className="text-center py-4 px-4 text-red-400">Storytelling</td>
                      <td className="text-center py-4 px-4 text-green-400">Location-based</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Call to Action */}
          <div className="text-center mt-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Sẵn sàng áp dụng vào dự án?
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Tất cả 3 template đều được thiết kế theo chuẩn của Du Lịch Việt-AI và sẵn sàng tích hợp
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3">
                <Eye className="h-5 w-5 mr-2" />
                Xem code template
              </Button>
              <Button variant="outline" size="lg" className="border-2 border-gray-200 text-gray-600 hover:bg-gray-50 px-8 py-3">
                <Camera className="h-5 w-5 mr-2" />
                Tải xuống assets
              </Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}