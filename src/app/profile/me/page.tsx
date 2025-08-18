"use client"

import * as React from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card-custom"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  User,
  MapPin,
  Calendar,
  Star,
  Edit,
  Save,
  Camera,
  Award,
  BarChart3,
  Heart,
  BookOpen
} from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import { UserRoleDisplay } from "@/components/ui/role-badge"

export default function ProfilePage() {
  const { user, isAuthenticated, updateUser } = useAuth()
  const [isEditing, setIsEditing] = React.useState(false)
  const [isSaving, setIsSaving] = React.useState(false)
  const [formData, setFormData] = React.useState({
    fullName: user?.fullName || "",
    bio: user?.profile?.bio || "",
    location: user?.profile?.location || "",
    website: user?.profile?.website || ""
  })

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // TODO: Save to API
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      updateUser({
        fullName: formData.fullName,
        profile: {
          ...user?.profile,
          bio: formData.bio,
          location: formData.location,
          website: formData.website
        }
      })
      
      setIsEditing(false)
    } catch (error) {
      console.error('Save failed:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      fullName: user?.fullName || "",
      bio: user?.profile?.bio || "",
      location: user?.profile?.location || "",
      website: user?.profile?.website || ""
    })
    setIsEditing(false)
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-bg text-text">
        <Header />
        <main className="container py-16">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Đăng nhập để xem hồ sơ</h1>
            <Button>Đăng nhập ngay</Button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg text-text">
      <Header />
      
      <main className="container py-8">
        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <Card className="mb-8">
            <CardContent className="p-8">
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="relative">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={user.avatar} alt={user.fullName} />
                    <AvatarFallback className="text-2xl">
                      {user.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute -bottom-2 -right-2 h-8 w-8 p-0 rounded-full"
                  >
                    <Camera className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex-1">
                  {isEditing ? (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="fullName">Họ và tên</Label>
                        <Input
                          id="fullName"
                          value={formData.fullName}
                          onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="bio">Giới thiệu bản thân</Label>
                        <Textarea
                          id="bio"
                          placeholder="Chia sẻ về bản thân, sở thích du lịch..."
                          value={formData.bio}
                          onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                          rows={3}
                        />
                      </div>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="location">Địa điểm</Label>
                          <Input
                            id="location"
                            placeholder="VD: Hà Nội, Việt Nam"
                            value={formData.location}
                            onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="website">Website</Label>
                          <Input
                            id="website"
                            placeholder="https://yourwebsite.com"
                            value={formData.website}
                            onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                          />
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <Button onClick={handleSave} loading={isSaving}>
                          <Save className="w-4 h-4 mr-2" />
                          Lưu thay đổi
                        </Button>
                        <Button variant="outline" onClick={handleCancel}>
                          Hủy
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h1 className="text-2xl font-bold mb-1 flex items-center gap-2">
                            {user.fullName}
                            {user.verified && (
                              <Badge variant="default" className="text-xs">
                                <Award className="w-3 h-3 mr-1" />
                                Verified
                              </Badge>
                            )}
                          </h1>
                          <p className="text-muted">@{user.username}</p>
                          <div className="mt-2">
                            <UserRoleDisplay 
                              role={user.role}
                              variant="compact"
                            />
                          </div>
                        </div>
                        <Button variant="outline" onClick={() => setIsEditing(true)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Chỉnh sửa
                        </Button>
                      </div>

                      {user.profile?.bio && (
                        <p className="text-muted mb-4">{user.profile.bio}</p>
                      )}

                      <div className="flex flex-wrap gap-4 text-sm text-muted">
                        {user.profile?.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            <span>{user.profile.location}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>Tham gia {new Date(user.createdAt).toLocaleDateString('vi-VN')}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats & Content */}
          <Tabs defaultValue="stats">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="stats">Thống kê</TabsTrigger>
              <TabsTrigger value="contributions">Đóng góp</TabsTrigger>
              <TabsTrigger value="itineraries">Lịch trình</TabsTrigger>
              <TabsTrigger value="activity">Hoạt động</TabsTrigger>
            </TabsList>

            <TabsContent value="stats" className="space-y-6">
              <div className="grid sm:grid-cols-3 gap-6">
                <Card>
                  <CardContent className="p-6 text-center">
                    <div className="text-3xl font-bold text-primary mb-2">
                      {user.stats?.placesContributed || 0}
                    </div>
                    <div className="text-muted">Địa điểm đóng góp</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6 text-center">
                    <div className="text-3xl font-bold text-primary mb-2">
                      {user.stats?.itinerariesCreated || 0}
                    </div>
                    <div className="text-muted">Lịch trình tạo</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6 text-center">
                    <div className="text-3xl font-bold text-primary mb-2">
                      {user.stats?.helpfulVotes || 0}
                    </div>
                    <div className="text-muted">Lượt thích nhận</div>
                  </CardContent>
                </Card>
              </div>

              {/* Badges/Achievements */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    Huy hiệu & Thành tích
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {user.badges && user.badges.length > 0 ? (
                      user.badges.map((badge, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-surface rounded-lg">
                          <div className="w-10 h-10 bg-primary-50 rounded-full flex items-center justify-center">
                            <Award className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <div className="font-medium">{badge}</div>
                            <div className="text-xs text-muted">Huy hiệu thành tích</div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-full text-center py-8 text-muted">
                        <Award className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>Chưa có huy hiệu nào</p>
                        <p className="text-sm">Đóng góp nội dung để nhận huy hiệu đầu tiên!</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="contributions">
              <Card>
                <CardHeader>
                  <CardTitle>Đóng góp gần đây</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted">
                    <MapPin className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Chưa có đóng góp nào</p>
                    <p className="text-sm mb-4">Bắt đầu chia sẻ những địa điểm tuyệt vời bạn đã khám phá!</p>
                    <Button variant="outline" asChild>
                      <a href="/contribute/new-place">Đóng góp địa điểm mới</a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="itineraries">
              <Card>
                <CardHeader>
                  <CardTitle>Lịch trình của tôi</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted">
                    <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Chưa có lịch trình nào</p>
                    <p className="text-sm mb-4">Tạo lịch trình đầu tiên để lưu kế hoạch du lịch!</p>
                    <Button variant="outline" asChild>
                      <a href="/itineraries/builder">Tạo lịch trình mới</a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activity">
              <Card>
                <CardHeader>
                  <CardTitle>Hoạt động gần đây</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted">
                    <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Chưa có hoạt động nào</p>
                    <p className="text-sm">Hoạt động của bạn sẽ được hiển thị ở đây</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  )
}
