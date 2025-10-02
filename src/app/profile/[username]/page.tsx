"use client"

export const dynamic = 'force-dynamic'

import * as React from "react"
import { useState, useEffect } from "react"
import { notFound } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card-custom"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Icon } from "@/components/ui/icon"
import { UserRoleDisplay } from "@/components/ui/role-badge"
import { MOCK_USERS, MOCK_PLACES } from "@/lib/mock-data"
import { PlaceCard } from "@/components/place-card"
import Link from "next/link"

interface ProfilePageProps {
  params: Promise<{
    username: string
  }>
}

export default function ProfilePage({ params }: ProfilePageProps) {
  const [username, setUsername] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadParams() {
      const resolvedParams = await params
      setUsername(resolvedParams.username)
      setIsLoading(false)
    }
    loadParams()
  }, [params])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg text-text">
        <Header />
        <div className="container mx-auto py-8 flex justify-center items-center min-h-[400px]">
          <div className="text-center">
            <div className="text-4xl mb-4">⏳</div>
            <p className="text-muted">Đang tải hồ sơ...</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  const user = MOCK_USERS.find(u => u.username === username)
  
  if (!user) {
    notFound()
  }

  // Mock user's contributions
  const userPlaces = MOCK_PLACES.filter(place => 
    place.submittedBy?.id === user.id
  ).slice(0, 6)

  const getRoleBadge = (role: string) => {
    const config = {
      traveler: { variant: "default" as const, label: "Du khách" },
      contributor: { variant: "success" as const, label: "Cộng tác viên" },
      partner: { variant: "warning" as const, label: "Đối tác" },
      moderator: { variant: "info" as const, label: "Kiểm duyệt viên" },
      admin: { variant: "danger" as const, label: "Quản trị viên" }
    }
    return config[role as keyof typeof config] || config.traveler
  }

  const roleBadge = getRoleBadge(user.role)

  return (
    <div className="min-h-screen bg-bg text-text">
      <Header />
      
      <div className="container mx-auto py-8 max-w-6xl">
        {/* Profile Header */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row gap-6">
              <Avatar className="w-24 h-24">
                <AvatarImage src={user.avatar} alt={user.fullName} />
                <AvatarFallback className="text-2xl">
                  {user.fullName?.split(' ').map(n => n[0]).join('').toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-text">{user.fullName}</h1>
                    <p className="text-muted">@{user.username}</p>
                  </div>
                  
                  <UserRoleDisplay 
                    role={user.role}
                    variant="compact"
                  />
                </div>
                
                {user.profile?.bio && (
                  <p className="text-muted mb-4 leading-relaxed">
                    {user.profile.bio}
                  </p>
                )}
                
                <div className="flex flex-wrap gap-4 text-sm text-muted">
                  {user.profile?.location && (
                    <div className="flex items-center gap-1">
                      <Icon name="location" className="w-4 h-4" />
                      {user.profile.location}
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Icon name="calendar" className="w-4 h-4" />
                    Tham gia {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                  </div>
                  {user.profile?.website && (
                    <a
                      href={user.profile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-primary hover:underline"
                    >
                      <Icon name="share" className="w-4 h-4" />
                      Website
                    </a>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Địa điểm đóng góp</CardTitle>
              <Icon name="location" className="text-muted" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{user.stats?.placesContributed || 0}</div>
              <p className="text-xs text-muted">Đã được duyệt và xuất bản</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Lịch trình tạo</CardTitle>
              <Icon name="map" className="text-muted" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{user.stats?.itinerariesCreated || 0}</div>
              <p className="text-xs text-muted">Lịch trình đã chia sẻ</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Lượt hữu ích</CardTitle>
              <Icon name="heart" className="text-muted" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{user.stats?.helpfulVotes || 0}</div>
              <p className="text-xs text-muted">Từ cộng đồng</p>
            </CardContent>
          </Card>
        </div>

        {/* User's Places */}
        {userPlaces.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-text">
                Địa điểm đã đóng góp
              </h2>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/places?contributor=${username}`}>
                  Xem tất cả
                </Link>
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userPlaces.map((place) => (
                <PlaceCard
                  key={place.id}
                  place={place}
                  onAddToItinerary={() => {}}
                />
              ))}
            </div>
          </div>
        )}

        {/* Contact */}
        <Card>
          <CardContent className="p-6 text-center">
            <h3 className="font-semibold text-text mb-2">
              Liên hệ với {user.fullName}
            </h3>
            <p className="text-muted text-sm mb-4">
              Bạn có câu hỏi về những địa điểm mà {user.fullName.split(' ')[0]} đã chia sẻ?
            </p>
            <Button variant="outline">
              <Icon name="mail" className="mr-2" />
              Gửi tin nhắn
            </Button>
          </CardContent>
        </Card>
      </div>
      
      <Footer />
    </div>
  )
}
