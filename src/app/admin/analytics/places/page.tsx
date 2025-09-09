"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from "recharts"
import { 
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  AlertCircle,
  Users,
  MapPin,
  Calendar,
  Target,
  Activity,
  Award,
  Filter
} from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import { useFirebaseAuth } from "@/hooks/use-firebase-auth"
import { useToast } from "@/hooks/use-toast"
import { BrandedLoading } from "@/components/ui/branded-loading"
import { cn } from "@/lib/utils"

interface AnalyticsData {
  overview: {
    totalPlaces: number
    totalModerators: number
    avgProcessingTime: number // hours
    slaCompliance: number // percentage
  }
  moderatorPerformance: {
    id: string
    name: string
    assignedPlaces: number
    approvedCount: number
    rejectedCount: number
    avgProcessingTime: number
    slaCompliance: number
    qualityScore: number
  }[]
  placeStats: {
    byStatus: { status: string; count: number; color: string }[]
    byType: { type: string; count: number }[]
    byRegion: { region: string; count: number }[]
  }
  trends: {
    submissions: { date: string; count: number }[]
    approvals: { date: string; count: number }[]
    rejections: { date: string; count: number }[]
  }
  slaMetrics: {
    onTime: number
    late: number
    overdue: number
    escalated: number
  }
}

const mockData: AnalyticsData = {
  overview: {
    totalPlaces: 1247,
    totalModerators: 8,
    avgProcessingTime: 18.5,
    slaCompliance: 85.2
  },
  moderatorPerformance: [
    {
      id: "mod1",
      name: "Nguyễn Văn A",
      assignedPlaces: 15,
      approvedCount: 124,
      rejectedCount: 12,
      avgProcessingTime: 14.2,
      slaCompliance: 92.5,
      qualityScore: 4.8
    },
    {
      id: "mod2", 
      name: "Trần Thị B",
      assignedPlaces: 12,
      approvedCount: 98,
      rejectedCount: 8,
      avgProcessingTime: 16.8,
      slaCompliance: 88.7,
      qualityScore: 4.6
    },
    {
      id: "mod3",
      name: "Lê Minh C", 
      assignedPlaces: 18,
      approvedCount: 156,
      rejectedCount: 15,
      avgProcessingTime: 22.1,
      slaCompliance: 78.3,
      qualityScore: 4.4
    }
  ],
  placeStats: {
    byStatus: [
      { status: "published", count: 892, color: "#10b981" },
      { status: "in_review", count: 156, color: "#f59e0b" },
      { status: "draft", count: 123, color: "#6b7280" },
      { status: "rejected", count: 76, color: "#ef4444" }
    ],
    byType: [
      { type: "Biển", count: 324 },
      { type: "Núi", count: 298 },
      { type: "Văn hóa", count: 267 },
      { type: "Ẩm thực", count: 231 },
      { type: "Check-in", count: 127 }
    ],
    byRegion: [
      { region: "Bắc Bộ", count: 456 },
      { region: "Trung Bộ", count: 423 },
      { region: "Nam Bộ", count: 368 }
    ]
  },
  trends: {
    submissions: [
      { date: "2024-01", count: 45 },
      { date: "2024-02", count: 52 },
      { date: "2024-03", count: 38 },
      { date: "2024-04", count: 67 },
      { date: "2024-05", count: 59 },
      { date: "2024-06", count: 78 }
    ],
    approvals: [
      { date: "2024-01", count: 38 },
      { date: "2024-02", count: 44 },
      { date: "2024-03", count: 32 },
      { date: "2024-04", count: 58 },
      { date: "2024-05", count: 51 },
      { date: "2024-06", count: 65 }
    ],
    rejections: [
      { date: "2024-01", count: 7 },
      { date: "2024-02", count: 8 },
      { date: "2024-03", count: 6 },
      { date: "2024-04", count: 9 },
      { date: "2024-05", count: 8 },
      { date: "2024-06", count: 13 }
    ]
  },
  slaMetrics: {
    onTime: 756,
    late: 145,
    overdue: 89,
    escalated: 23
  }
}

export default function PlacesAnalyticsPage() {
  const { user } = useAuth()
  const { firebaseUser, loading: authLoading, getIdToken } = useFirebaseAuth()
  const { toast } = useToast()
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState("30d")

  // Permission check
  const canViewAnalytics = user && ['moderator', 'admin'].includes(user.role)

  useEffect(() => {
    if (!canViewAnalytics || authLoading || !firebaseUser) {
      if (!authLoading) setLoading(false)
      return
    }

    const loadAnalytics = async () => {
      try {
        const token = await getIdToken()
        if (!token) {
          throw new Error('Authentication required')
        }
        
        const response = await fetch('/api/admin/analytics/places', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        if (response.ok) {
          const result = await response.json()
          if (result.success) {
            setData(result.data)
          } else {
            throw new Error(result.error)
          }
        } else {
          throw new Error('Failed to load analytics')
        }
      } catch (error) {
        console.error('Failed to load analytics:', error)
        toast({
          title: "Lỗi tải thống kê",
          description: "Không thể tải dữ liệu thống kê",
          variant: "destructive"
        })
        // Use mock data as fallback
        setData(mockData)
      } finally {
        setLoading(false)
      }
    }

    loadAnalytics()
  }, [canViewAnalytics, authLoading, firebaseUser, selectedPeriod, getIdToken, toast])

  if (!canViewAnalytics) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Activity className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Không có quyền truy cập</h3>
          <p className="text-gray-600">Cần quyền Moderator hoặc Admin để xem analytics</p>
        </div>
      </div>
    )
  }

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <BrandedLoading 
          variant="logo" 
          size="lg"
          text="Đang tải analytics..."
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      
      {/* Header */}
      <div className="relative px-4 md:px-6 lg:px-8 pt-6 pb-8">
        <div className="absolute inset-0 bg-gradient-to-r from-admin-primary-500/5 via-admin-success-500/3 to-admin-info-500/5 rounded-b-3xl"></div>
        
        <div className="relative max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 bg-gradient-to-br from-admin-primary-600 to-admin-success-700 rounded-2xl flex items-center justify-center shadow-lg">
                  <Activity className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold text-admin-neutral-900 tracking-tight">
                    Analytics Địa điểm
                  </h1>
                  <p className="text-admin-neutral-600 mt-1">
                    Phân tích hiệu suất và xu hướng
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                variant={selectedPeriod === "7d" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedPeriod("7d")}
              >
                7 ngày
              </Button>
              <Button
                variant={selectedPeriod === "30d" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedPeriod("30d")}
              >
                30 ngày
              </Button>
              <Button
                variant={selectedPeriod === "90d" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedPeriod("90d")}
              >
                90 ngày
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 space-y-6 pb-8">
        
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 text-sm font-medium">Tổng địa điểm</p>
                  <p className="text-2xl font-bold text-blue-900">{data.overview.totalPlaces.toLocaleString()}</p>
                </div>
                <MapPin className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 text-sm font-medium">SLA Compliance</p>
                  <p className="text-2xl font-bold text-green-900">{data.overview.slaCompliance}%</p>
                </div>
                <Target className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-600 text-sm font-medium">Thời gian xử lý TB</p>
                  <p className="text-2xl font-bold text-purple-900">{data.overview.avgProcessingTime}h</p>
                </div>
                <Clock className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-600 text-sm font-medium">Moderators</p>
                  <p className="text-2xl font-bold text-orange-900">{data.overview.totalModerators}</p>
                </div>
                <Users className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Phân bố theo Trạng thái</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={data.placeStats.byStatus}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    dataKey="count"
                    label={({ status, count, percent }) => `${status}: ${count} (${(percent * 100).toFixed(1)}%)`}
                  >
                    {data.placeStats.byStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Type Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Phân bố theo Loại</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.placeStats.byType}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="type" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Trends Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Xu hướng theo Thời gian</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  data={data.trends.submissions}
                  stroke="#8884d8" 
                  name="Đăng mới"
                  strokeWidth={2}
                />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  data={data.trends.approvals}
                  stroke="#82ca9d" 
                  name="Phê duyệt"
                  strokeWidth={2}
                />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  data={data.trends.rejections}
                  stroke="#ff7c7c" 
                  name="Từ chối"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Moderator Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Hiệu suất Moderator</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.moderatorPerformance.map((mod) => (
                <div key={mod.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-admin-primary-500 to-admin-success-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-semibold">
                          {mod.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-semibold">{mod.name}</h4>
                        <p className="text-sm text-gray-600">
                          {mod.assignedPlaces} địa điểm đang xử lý
                        </p>
                      </div>
                    </div>
                    <Badge className={cn(
                      mod.slaCompliance >= 90 ? "bg-green-100 text-green-700" :
                      mod.slaCompliance >= 80 ? "bg-yellow-100 text-yellow-700" :
                      "bg-red-100 text-red-700"
                    )}>
                      SLA: {mod.slaCompliance}%
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Phê duyệt</p>
                      <p className="font-semibold text-green-600">{mod.approvedCount}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Từ chối</p>
                      <p className="font-semibold text-red-600">{mod.rejectedCount}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Thời gian TB</p>
                      <p className="font-semibold">{mod.avgProcessingTime}h</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Chất lượng</p>
                      <div className="flex items-center gap-1">
                        <Award className="h-3 w-3 text-yellow-500" />
                        <span className="font-semibold">{mod.qualityScore}/5</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}