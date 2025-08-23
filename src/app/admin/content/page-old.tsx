"use client"

import { useFirebaseAuth } from "@/components/auth/FirebaseAuthProvider"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function AdminContentPage() {
  const { user, profile, loading } = useFirebaseAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return
    
    if (!user) {
      router.push('/auth/login')
      return
    }
    
    if (!profile || profile.role !== 'admin') {
      router.push('/')
      return
    }
  }, [user, profile, loading, router])

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  if (!user || !profile || profile.role !== 'admin') {
    return <div className="p-8">Access denied</div>
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Content Management</h1>
      <div className="space-y-4">
        <div className="bg-blue-100 p-4 rounded">
          <p><strong>Admin:</strong> {user.email}</p>
          <p><strong>Role:</strong> {profile.role}</p>
        </div>
        
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-bold mb-2">Content Management Features</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>Manage places and destinations</li>
            <li>Assign trust badges</li>
            <li>Hide/restore content</li>
            <li>Content statistics</li>
            <li>Trust label management</li>
          </ul>
        </div>
        
        <p className="text-gray-600">
          Content management system will be implemented here.<br/>
          Currently showing placeholder for admin access verification.
        </p>
      </div>
    </div>
  )
}
import { useAuth } from "@/lib/auth"
import { getUserRole, hasPermission } from "@/lib/rbac"
import { httpsCallable } from "firebase/functions"
import { functions } from "@/lib/firebase"
import { redirect } from "next/navigation"
import Link from "next/link"

interface ContentItem {
  id: string
  type: 'place' | 'itinerary' | 'user'
  title: string
  description: string
  status: 'published' | 'draft' | 'hidden' | 'pending'
  trustLabel: 'community' | 'contributor' | 'partner' | 'verified' | null
  createdBy: {
    id: string
    name: string
    role: string
  }
  createdAt: string
  publishedAt?: string
  moderatedBy?: string
  stats?: {
    views: number
    likes: number
    reports: number
  }
}

interface TrustBadgeStats {
  community: number
  contributor: number
  partner: number
  verified: number
}

// Firebase Functions
const getContentQueue = httpsCallable(functions, 'getContentQueue')
const setTrustLabel = httpsCallable(functions, 'setTrustLabel')
const getTrustLabelStats = httpsCallable(functions, 'getTrustLabelStats')
const hideContent = httpsCallable(functions, 'hideContent')
const restoreContent = httpsCallable(functions, 'restoreContent')

const trustLabelConfig = {
  community: { 
    label: "Cộng đồng", 
    variant: "secondary" as const, 
    icon: Users,
    description: "Nội dung từ người dùng thường"
  },
  contributor: { 
    label: "Cộng tác viên", 
    variant: "default" as const, 
    icon: Award,
    description: "Nội dung từ cộng tác viên uy tín"
  },
  partner: { 
    label: "Đối tác cộng đồng", 
    variant: "warning" as const, 
    icon: Building,
    description: "Nội dung từ đối tác chính thức"
  },
  verified: { 
    label: "Đã kiểm duyệt", 
    variant: "success" as const, 
    icon: Shield,
    description: "Nội dung đã được moderator xác minh"
  }
}

const statusConfig = {
  published: { label: "Đã xuất bản", variant: "success" as const },
  draft: { label: "Bản nháp", variant: "secondary" as const },
  hidden: { label: "Đã ẩn", variant: "danger" as const },
  pending: { label: "Chờ duyệt", variant: "warning" as const }
}

export default function ContentManagement() {
  const { user } = useAuth()
  const [contentItems, setContentItems] = React.useState<ContentItem[]>([])
  const [trustStats, setTrustStats] = React.useState<TrustBadgeStats>({
    community: 0,
    contributor: 0,
    partner: 0,
    verified: 0
  })
  const [loading, setLoading] = React.useState(true)
  const [searchTerm, setSearchTerm] = React.useState('')
  const [statusFilter, setStatusFilter] = React.useState<string>('all')
  const [trustFilter, setTrustFilter] = React.useState<string>('all')
  const [typeFilter, setTypeFilter] = React.useState<string>('all')

  const userRole = getUserRole(user)
  const canManageContent = hasPermission(userRole, 'admin.manage_roles') || hasPermission(userRole, 'moderation.queue_view')

  React.useEffect(() => {
    if (!user || !canManageContent) {
      redirect('/auth/login')
      return
    }
    loadContentData()
  }, [user, canManageContent, statusFilter, trustFilter, typeFilter])

  const loadContentData = async () => {
    try {
      setLoading(true)
      
      // Load content items
      const contentResult = await getContentQueue({
        status: statusFilter === 'all' ? undefined : statusFilter,
        trustLabel: trustFilter === 'all' ? undefined : trustFilter,
        type: typeFilter === 'all' ? undefined : typeFilter,
        limit: 100
      })
      
      const items = (contentResult.data as any)?.items || []
      setContentItems(items)

      // Load trust label stats
      const statsResult = await getTrustLabelStats()
      const stats = (statsResult.data as any) || {}
      
      setTrustStats({
        community: stats.community || 0,
        contributor: stats.contributor || 0,
        partner: stats.partner || 0,
        verified: stats.verified || 0
      })

    } catch (error) {
      console.error('Error loading content data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSetTrustLabel = async (contentId: string, label: string) => {
    try {
      await setTrustLabel({ 
        targetType: 'place', // Can be dynamic
        targetId: contentId, 
        label 
      })
      loadContentData()
    } catch (error) {
      console.error('Error setting trust label:', error)
    }
  }

  const handleHideContent = async (contentId: string, reason: string) => {
    try {
      await hideContent({ contentId, reason })
      loadContentData()
    } catch (error) {
      console.error('Error hiding content:', error)
    }
  }

  const handleRestoreContent = async (contentId: string) => {
    try {
      await restoreContent({ contentId })
      loadContentData()
    } catch (error) {
      console.error('Error restoring content:', error)
    }
  }

  const filteredItems = contentItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  if (!user || !canManageContent) {
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-bg text-text">
        <Header />
        <div className="container mx-auto py-8">
          <div className="text-center">Đang tải dữ liệu nội dung...</div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg text-text">
      <Header />
      
      <div className="container mx-auto py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Content Management</h1>
            <p className="text-muted">
              Quản lý nội dung và nhãn tin cậy
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={loadContentData}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Làm mới
            </Button>
            <Badge variant="success">
              {userRole === 'admin' ? 'Admin' : 'Moderator'} Access
            </Badge>
          </div>
        </div>

        {/* Trust Badge Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Object.entries(trustLabelConfig).map(([key, config]) => {
            const Icon = config.icon
            const count = trustStats[key as keyof TrustBadgeStats]
            return (
              <Card key={key}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Icon className="w-5 h-5" />
                    <div>
                      <p className="text-sm text-muted">{config.label}</p>
                      <p className="text-2xl font-bold">{count}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Tìm kiếm nội dung..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="published">Đã xuất bản</SelectItem>
                    <SelectItem value="draft">Bản nháp</SelectItem>
                    <SelectItem value="hidden">Đã ẩn</SelectItem>
                    <SelectItem value="pending">Chờ duyệt</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={trustFilter} onValueChange={setTrustFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Nhãn tin cậy" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="community">Cộng đồng</SelectItem>
                    <SelectItem value="contributor">Cộng tác viên</SelectItem>
                    <SelectItem value="partner">Đối tác</SelectItem>
                    <SelectItem value="verified">Đã kiểm duyệt</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Loại" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="place">Địa điểm</SelectItem>
                    <SelectItem value="itinerary">Lịch trình</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content List */}
        <div className="space-y-4">
          {filteredItems.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted">Không có nội dung nào để hiển thị</p>
              </CardContent>
            </Card>
          ) : (
            filteredItems.map((item) => (
              <ContentItemCard 
                key={item.id} 
                item={item}
                onSetTrustLabel={(label) => handleSetTrustLabel(item.id, label)}
                onHide={(reason) => handleHideContent(item.id, reason)}
                onRestore={() => handleRestoreContent(item.id)}
              />
            ))
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  )
}

// Content Item Card Component
function ContentItemCard({ 
  item, 
  onSetTrustLabel, 
  onHide, 
  onRestore 
}: { 
  item: ContentItem
  onSetTrustLabel: (label: string) => void
  onHide: (reason: string) => void
  onRestore: () => void
}) {
  const [showTrustDialog, setShowTrustDialog] = React.useState(false)
  const [hideReason, setHideReason] = React.useState('')

  const TrustIcon = item.trustLabel ? trustLabelConfig[item.trustLabel].icon : Users

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant={statusConfig[item.status].variant}>
                {statusConfig[item.status].label}
              </Badge>
              {item.trustLabel && (
                <Badge variant={trustLabelConfig[item.trustLabel].variant}>
                  <TrustIcon className="w-3 h-3 mr-1" />
                  {trustLabelConfig[item.trustLabel].label}
                </Badge>
              )}
              <span className="text-sm text-muted capitalize">{item.type}</span>
            </div>

            <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
            <p className="text-muted mb-4 line-clamp-2">{item.description}</p>

            <div className="flex items-center gap-4 text-sm text-muted">
              <div className="flex items-center gap-1">
                <User className="w-4 h-4" />
                <span>{item.createdBy.name} ({item.createdBy.role})</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{new Date(item.createdAt).toLocaleDateString('vi-VN')}</span>
              </div>
              {item.stats && (
                <>
                  <span>{item.stats.views} lượt xem</span>
                  <span>{item.stats.likes} thích</span>
                  {item.stats.reports > 0 && (
                    <span className="text-red-500">{item.stats.reports} báo cáo</span>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2 ml-4">
            <Dialog open={showTrustDialog} onOpenChange={setShowTrustDialog}>
              <DialogTrigger asChild>
                <Button variant="secondary" size="sm">
                  <Shield className="w-4 h-4 mr-1" />
                  Nhãn tin cậy
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Gán nhãn tin cậy</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  {Object.entries(trustLabelConfig).map(([key, config]) => {
                    const Icon = config.icon
                    return (
                      <Button
                        key={key}
                        variant={item.trustLabel === key ? "primary" : "secondary"}
                        className="w-full justify-start"
                        onClick={() => {
                          onSetTrustLabel(key)
                          setShowTrustDialog(false)
                        }}
                      >
                        <Icon className="w-4 h-4 mr-2" />
                        <div className="text-left">
                          <div className="font-medium">{config.label}</div>
                          <div className="text-xs text-muted">{config.description}</div>
                        </div>
                      </Button>
                    )
                  })}
                </div>
              </DialogContent>
            </Dialog>

            <Link href={`/places/${item.id}`}>
              <Button variant="ghost" size="sm">
                <Eye className="w-4 h-4 mr-1" />
                Xem
              </Button>
            </Link>

            {item.status === 'published' ? (
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="danger" size="sm">
                    <Trash2 className="w-4 h-4 mr-1" />
                    Ẩn
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Ẩn nội dung</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Input
                      placeholder="Lý do ẩn nội dung..."
                      value={hideReason}
                      onChange={(e) => setHideReason(e.target.value)}
                    />
                    <Button 
                      variant="danger" 
                      onClick={() => {
                        onHide(hideReason)
                        setHideReason('')
                      }}
                      disabled={!hideReason.trim()}
                    >
                      Xác nhận ẩn
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            ) : item.status === 'hidden' ? (
              <Button variant="success" size="sm" onClick={onRestore}>
                Khôi phục
              </Button>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
