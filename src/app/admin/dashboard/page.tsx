"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card-custom"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useFirebaseAuth } from "@/components/auth/FirebaseAuthProvider"
import { Icon } from "@/components/ui/icon"
import { httpsCallable } from "firebase/functions"
import { functions } from "@/lib/firebase"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface DashboardStats {
  totalUsers: number
  pendingReviews: number
  contentReports: number
  systemAlerts: number
  usersByRole: { role: string; label: string; count: number }[]
}

interface RecentActivity {
  id: string
  type: string
  description: string
  timestamp: string
  severity: 'info' | 'success' | 'warning' | 'error'
}

interface UserData {
  id: string
  email: string
  displayName?: string
  role: string
}

interface ModerationData {
  users?: UserData[]
  items?: any[]
  pendingReports?: number
  urgentItems?: number
}

// Firebase Functions
const getAllUsers = httpsCallable(functions, 'getAllUsers')
const getDashboardStats = httpsCallable(functions, 'getDashboardStats')
const getRecentActivities = httpsCallable(functions, 'getRecentActivities')
const getModerationQueue = httpsCallable(functions, 'getModerationQueue')

export default function AdminDashboard() {
  const { user, profile, loading: authLoading } = useFirebaseAuth()
  const router = useRouter()
  const [stats, setStats] = React.useState<DashboardStats>({
    totalUsers: 0,
    pendingReviews: 0,
    contentReports: 0,
    systemAlerts: 0,
    usersByRole: []
  })
  const [recentActivities, setRecentActivities] = React.useState<RecentActivity[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    if (authLoading) return
    
    if (!user) {
      router.push('/auth/login')
      return
    }
    
    if (!profile || profile.role !== 'admin') {
      router.push('/')
      return
    }
    
    loadDashboardData()
  }, [user, profile, authLoading, router])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      
      // Load users data with error handling
      let users: UserData[] = []
      try {
        const usersResult = await getAllUsers({ limit: 1000 })
        users = (usersResult.data as any)?.users || []
      } catch (error) {
        console.warn('Unable to load users:', error)
        users = []
      }
      
      // Load moderation data with error handling
      let pendingItems: any[] = []
      try {
        const moderationResult = await getModerationQueue({ 
          status: 'pending', 
          limit: 100 
        })
        pendingItems = (moderationResult.data as ModerationData)?.items || []
      } catch (error) {
        console.warn('Unable to load moderation queue:', error)
      }
      
      // Load recent activities from Firebase Functions  
      try {
        const activitiesResult = await getRecentActivities({ limit: 5 })
        const activitiesData = activitiesResult.data as any
        setRecentActivities(activitiesData.activities || [])
      } catch (error) {
        console.warn('Unable to load recent activities:', error)
        setRecentActivities([])
      }

      // Calculate user stats by role
      const usersByRole = users.reduce((acc: any, user: UserData) => {
        const role = user.role || 'traveler'
        acc[role] = (acc[role] || 0) + 1
        return acc
      }, {})

      const roleLabels = {
        guest: "Khách vãng lai",
        traveler: "Du khách", 
        contributor: "Cộng tác viên",
        partner: "Đối tác",
        moderator: "Kiểm duyệt viên",
        admin: "Quản trị viên"
      }

      const formattedRoles = Object.entries(usersByRole).map(([role, count]) => ({
        role,
        label: roleLabels[role as keyof typeof roleLabels] || role,
        count: count as number
      }))

      // Load dashboard statistics from Firebase Functions
      try {
        const statsResult = await getDashboardStats()
        const statsData = statsResult.data as any
        
        setStats({
          totalUsers: users.length,
          pendingReviews: pendingItems.length,
          contentReports: statsData.moderationStats?.reportedContent || 0,
          systemAlerts: statsData.systemStats?.alerts || 0,
          usersByRole: formattedRoles
        })
      } catch (error) {
        console.warn('Unable to load dashboard stats:', error)
        // Fallback to basic stats
        setStats({
          totalUsers: users.length,
          pendingReviews: pendingItems.length,
          contentReports: 0,
          systemAlerts: 0,
          usersByRole: formattedRoles
        })
      }



    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-bg text-text">
        <Header />
        <div className="container mx-auto py-8">
          <div className="text-center">Đang tải dữ liệu...</div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg text-text">
      <Header />
      
      <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text">Admin Dashboard</h1>
          <p className="text-muted mt-2">
            Quản lý hệ thống và giám sát hoạt động nền tảng
          </p>
        </div>
        <Badge variant="danger" className="text-sm">
          <Icon name="shield" className="mr-1" />
          Admin Access
        </Badge>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng người dùng</CardTitle>
            <Icon name="users" className="text-muted" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted">Người dùng hoạt động</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chờ duyệt</CardTitle>
            <Icon name="clock" className="text-muted" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingReviews}</div>
            <p className="text-xs text-muted">Nội dung cần xem xét</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Báo cáo</CardTitle>
            <Icon name="flag" className="text-muted" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.contentReports}</div>
            <p className="text-xs text-muted">Báo cáo vi phạm</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cảnh báo hệ thống</CardTitle>
            <Icon name="alert-triangle" className="text-muted" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.systemAlerts}</div>
            <p className="text-xs text-muted">Cần xem xét ngay</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* User Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="users" />
              Quản lý người dùng
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.usersByRole.map((item) => (
                <div key={item.role} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="min-w-[100px] justify-center">
                      {item.label}
                    </Badge>
                    <span className="text-sm text-muted">{item.count} người</span>
                  </div>
                  <Link href="/admin/users">
                    <Button variant="ghost" size="sm">
                      Quản lý
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-4 border-t border-border">
              <Link href="/admin/users">
                <Button className="w-full">
                  <Icon name="user-plus" className="mr-2" />
                  Xem tất cả người dùng
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* System Activities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="activity" />
              Hoạt động gần đây
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => {
                let bgColor = 'bg-blue-500'
                if (activity.severity === 'success') bgColor = 'bg-green-500'
                else if (activity.severity === 'warning') bgColor = 'bg-yellow-500'
                else if (activity.severity === 'error') bgColor = 'bg-red-500'
                
                return (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-2 ${bgColor}`} />
                  <div className="flex-1">
                    <p className="text-sm text-text">{activity.description}</p>
                    <p className="text-xs text-muted">{activity.timestamp}</p>
                  </div>
                </div>
                )
              })}
            </div>
            <div className="mt-6 pt-4 border-t border-border">
              <Button variant="secondary" className="w-full">
                Xem tất cả hoạt động
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="zap" />
            Hành động nhanh
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/moderation/dashboard">
              <Button variant="secondary" className="w-full">
                Duyệt nội dung
              </Button>
            </Link>
            <Link href="/admin/users">
              <Button variant="secondary" className="w-full">
                Quản lý người dùng
              </Button>
            </Link>
            <Button variant="secondary" className="w-full">
              Xem thống kê
            </Button>
            <Button variant="secondary" className="w-full">
              Cài đặt hệ thống
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Emergency Actions */}
      <Card className="border-red-200 bg-red-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-700">
            <Icon name="alert-triangle" />
            Hành động khẩn cấp
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="danger">
              Ẩn nội dung ngay
            </Button>
            <Button variant="danger">
              Khóa tài khoản
            </Button>
            <Button variant="danger">
              Bảo trì hệ thống
            </Button>
          </div>
        </CardContent>
      </Card>
      </div>
      
      <Footer />
    </div>
  )
}
