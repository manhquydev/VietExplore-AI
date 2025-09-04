"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BrandedLoading } from "@/components/ui/branded-loading"
import { AlertTriangle, Edit, Calendar, ArrowLeft, FileText } from "lucide-react"

export default function TestEditPageDemo() {
  const [currentView, setCurrentView] = useState<'loading' | 'error' | 'content'>('content')

  const mockDraft = {
    name: "Hồ Hoàn Kiếm - Trái Tim Hà Nội",
    status: "draft",
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20'),
    description: "Hồ Hoàn Kiếm là một trong những địa điểm biểu tượng nhất của Hà Nội, với lịch sử hàng nghìn năm và những câu chuyện huyền thoại về rùa thiêng và gươm báu. Đây là nơi tập trung của người dân và du khách từ khắp nơi trên thế giới.",
    images: [
      "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=300&h=200&fit=crop",
      "https://images.unsplash.com/photo-1540611025311-01df3cef54b5?w=300&h=200&fit=crop",
      "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=300&h=200&fit=crop"
    ]
  }

  const LoadingView = () => (
    <div className="min-h-[400px] flex items-center justify-center">
      <BrandedLoading 
        variant="logo" 
        size="lg"
        text="Đang tải thông tin bản nháp..."
      />
    </div>
  )

  const ErrorView = () => (
    <Card className="border-red-200 bg-red-50/50">
      <CardContent className="p-8">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-xl font-semibold mb-2 text-red-900">
            Không thể tải bản nháp
          </h3>
          <p className="text-red-700 mb-6 max-w-md mx-auto">
            Bản nháp không tồn tại hoặc bạn không có quyền truy cập
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" className="border-red-300 text-red-700 hover:bg-red-100">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại
            </Button>
            <Button className="bg-red-600 hover:bg-red-700">
              <FileText className="w-4 h-4 mr-2" />
              Về trang bản nháp
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const ContentView = () => (
    <Card className="bg-white/80 backdrop-blur-sm shadow-2xl border-0">
      <CardHeader className="pb-6">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-100 to-purple-100 rounded-lg flex items-center justify-center">
                <Edit className="w-5 h-5 text-pink-600" />
              </div>
              {mockDraft.name}
            </CardTitle>
            <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Tạo: {mockDraft.createdAt.toLocaleDateString('vi-VN')}
              </div>
              <div className="flex items-center gap-1">
                <Edit className="w-4 h-4" />
                Cập nhật: {mockDraft.updatedAt.toLocaleDateString('vi-VN')}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
              Bản nháp
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium mb-2">Thông tin cơ bản</h4>
            <div className="space-y-2 text-sm">
              <div><strong>Tên:</strong> {mockDraft.name}</div>
              <div><strong>Trạng thái:</strong> <span className="text-gray-600">Bản nháp</span></div>
              <div><strong>Loại:</strong> <span className="text-blue-600">Hồ nước</span></div>
            </div>
          </div>
          <div>
            <h4 className="font-medium mb-2">Mô tả</h4>
            <p className="text-sm text-muted-foreground">
              {mockDraft.description.length > 100 
                ? mockDraft.description.substring(0, 100) + '...' 
                : mockDraft.description
              }
            </p>
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-2">Hình ảnh ({mockDraft.images.length})</h4>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
            {mockDraft.images.map((image, index) => (
              <div key={index} className="aspect-square rounded-md bg-muted overflow-hidden">
                <img 
                  src={image} 
                  alt={`Image ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-6 border-t">
          <Button className="flex-1 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700">
            <Edit className="w-4 h-4 mr-2" />
            Chỉnh sửa bản nháp
          </Button>
          <Button 
            variant="outline" 
            className="px-6 border-gray-300 hover:bg-gray-50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Danh sách bản nháp
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
            Enhanced Edit Page Demo
          </h1>
          <p className="text-gray-600 text-lg">
            Modern, professional UI/UX for contribute/edit/xxx pages
          </p>
        </div>

        {/* Control Panel */}
        <Card className="bg-white/60 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>View States Demo</CardTitle>
            <p className="text-sm text-gray-600">
              Switch between different page states to see the enhanced UI/UX
            </p>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3 flex-wrap">
              <Button 
                variant={currentView === 'loading' ? 'default' : 'outline'}
                onClick={() => setCurrentView('loading')}
              >
                Loading State
              </Button>
              <Button 
                variant={currentView === 'error' ? 'default' : 'outline'}
                onClick={() => setCurrentView('error')}
              >
                Error State
              </Button>
              <Button 
                variant={currentView === 'content' ? 'default' : 'outline'}
                onClick={() => setCurrentView('content')}
              >
                Content View
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Demo Views */}
        {currentView === 'loading' && <LoadingView />}
        {currentView === 'error' && <ErrorView />}
        {currentView === 'content' && <ContentView />}

        {/* Features Summary */}
        <Card className="bg-white/60 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>UI/UX Enhancements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3 text-green-700">✅ Improvements Made</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• <strong>Branded Loading:</strong> Du Lịch Việt lotus logo animation</li>
                  <li>• <strong>No Emoji Icons:</strong> Professional Lucide icons instead</li>
                  <li>• <strong>Modern Card Design:</strong> Glass morphism with backdrop blur</li>
                  <li>• <strong>Status Indicators:</strong> Color-coded status badges</li>
                  <li>• <strong>Better Typography:</strong> Improved hierarchy and spacing</li>
                  <li>• <strong>Gradient Backgrounds:</strong> Soft pink to purple gradients</li>
                  <li>• <strong>Enhanced Buttons:</strong> Gradient primary buttons with icons</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3 text-blue-700">🎨 Design System</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• <strong>Colors:</strong> Pink/Purple brand gradients</li>
                  <li>• <strong>Shadows:</strong> Subtle drop shadows for depth</li>
                  <li>• <strong>Spacing:</strong> Consistent padding and margins</li>
                  <li>• <strong>Icons:</strong> Lucide React icons (professional)</li>
                  <li>• <strong>Loading:</strong> Branded spinner with logo</li>
                  <li>• <strong>States:</strong> Clear visual feedback for all states</li>
                  <li>• <strong>Responsive:</strong> Adapts well to all screen sizes</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}