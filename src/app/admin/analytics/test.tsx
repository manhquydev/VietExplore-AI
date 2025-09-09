"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  BarChart3,
  Users,
  MapPin,
  Activity,
  Eye,
  Heart,
  Globe,
  Zap
} from "lucide-react"

export default function AnalyticsTestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-admin-neutral-50 to-admin-primary-50/30">
      
      {/* Enhanced Header Section */}
      <div className="relative px-4 md:px-6 lg:px-8 pt-6 pb-8">
        <div className="absolute inset-0 bg-gradient-to-r from-admin-primary-500/8 via-admin-info-500/4 to-admin-success-500/6 rounded-b-3xl backdrop-blur-sm"></div>
        
        <div className="relative max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="h-14 w-14 bg-gradient-to-br from-admin-primary-600 to-admin-info-700 rounded-2xl flex items-center justify-center shadow-xl">
                    <BarChart3 className="h-7 w-7 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 h-4 w-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
                </div>
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold text-admin-neutral-900 tracking-tight">
                    🚀 NEW Analytics Dashboard
                  </h1>
                  <p className="text-admin-neutral-600 mt-1 flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Thống kê toàn diện với giao diện hiện đại
                    <Badge variant="outline" className="ml-2">
                      <Zap className="h-3 w-3 mr-1" />
                      Live Data
                    </Badge>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Analytics Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 pb-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4 bg-white/60 backdrop-blur-sm border border-admin-neutral-200/50 rounded-xl p-1">
            <TabsTrigger value="overview" className="data-[state=active]:bg-white data-[state=active]:shadow-md">
              <Activity className="h-4 w-4 mr-2" />
              Tổng quan
            </TabsTrigger>
            <TabsTrigger value="performance" className="data-[state=active]:bg-white data-[state=active]:shadow-md">
              <BarChart3 className="h-4 w-4 mr-2" />
              Hiệu suất
            </TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-white data-[state=active]:shadow-md">
              <Users className="h-4 w-4 mr-2" />
              Người dùng
            </TabsTrigger>
            <TabsTrigger value="geography" className="data-[state=active]:bg-white data-[state=active]:shadow-md">
              <MapPin className="h-4 w-4 mr-2" />
              Địa lý
            </TabsTrigger>
          </TabsList>

          <div className="space-y-6">
            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {/* Enhanced Key Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Sample Cards */}
                <Card className="relative overflow-hidden bg-white/80 backdrop-blur-sm border border-admin-neutral-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-blue-600/5"></div>
                  <CardContent className="relative p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-admin-neutral-600">Tổng người dùng</p>
                        <div className="text-2xl font-bold text-admin-neutral-900">1,234</div>
                      </div>
                      <div className="h-10 w-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-md">
                        <Users className="h-5 w-5 text-white" />
                      </div>
                    </div>
                    <div className="mt-3 flex items-center">
                      <div className="flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        +12.5%
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="relative overflow-hidden bg-white/80 backdrop-blur-sm border border-admin-neutral-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-emerald-600/5"></div>
                  <CardContent className="relative p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-admin-neutral-600">Địa điểm</p>
                        <div className="text-2xl font-bold text-admin-neutral-900">567</div>
                      </div>
                      <div className="h-10 w-10 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-xl flex items-center justify-center shadow-md">
                        <MapPin className="h-5 w-5 text-white" />
                      </div>
                    </div>
                    <div className="mt-3 flex items-center">
                      <div className="flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        +8.2%
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="relative overflow-hidden bg-white/80 backdrop-blur-sm border border-admin-neutral-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-purple-600/5"></div>
                  <CardContent className="relative p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-admin-neutral-600">Lượt xem</p>
                        <div className="text-2xl font-bold text-admin-neutral-900">89.1K</div>
                      </div>
                      <div className="h-10 w-10 bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl flex items-center justify-center shadow-md">
                        <Eye className="h-5 w-5 text-white" />
                      </div>
                    </div>
                    <div className="mt-3 flex items-center">
                      <div className="flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        +15.3%
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="relative overflow-hidden bg-white/80 backdrop-blur-sm border border-admin-neutral-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="absolute inset-0 bg-gradient-to-br from-rose-500/10 to-rose-600/5"></div>
                  <CardContent className="relative p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-admin-neutral-600">Tương tác</p>
                        <div className="text-2xl font-bold text-admin-neutral-900">4.2K</div>
                      </div>
                      <div className="h-10 w-10 bg-gradient-to-br from-rose-600 to-rose-700 rounded-xl flex items-center justify-center shadow-md">
                        <Heart className="h-5 w-5 text-white" />
                      </div>
                    </div>
                    <div className="mt-3 flex items-center">
                      <div className="flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        +22.1%
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Success Message */}
              <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="text-4xl mb-4">🎉</div>
                    <h3 className="text-xl font-bold text-green-900 mb-2">
                      Dashboard Analytics đã được nâng cấp thành công!
                    </h3>
                    <p className="text-green-700 mb-4">
                      Giao diện mới với nhiều tính năng analytics chuyên nghiệp đã được triển khai.
                    </p>
                    <div className="flex justify-center gap-4">
                      <Badge className="bg-green-600 text-white">✓ Modern UI/UX</Badge>
                      <Badge className="bg-blue-600 text-white">✓ Real-time Data</Badge>
                      <Badge className="bg-purple-600 text-white">✓ Advanced Charts</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Other tabs placeholder */}
            <TabsContent value="performance">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Biểu đồ hiệu suất và metrics chi tiết sẽ được hiển thị tại đây.</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="users">
              <Card>
                <CardHeader>
                  <CardTitle>User Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Phân tích người dùng và behavior patterns.</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="geography">
              <Card>
                <CardHeader>
                  <CardTitle>Geographic Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Phân bố địa lý và insights khu vực.</p>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  )
}