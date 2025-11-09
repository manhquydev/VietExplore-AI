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
import { ProfessionalRoleBadge } from "@/components/ui/professional-role-badge"
import { PlaceCard } from "@/components/place-card"
import Link from "next/link"
import {
  MapPin,
  Calendar,
  Globe,
  Mail,
  Star,
  Heart,
  Award,
  CheckCircle,
  Loader2,
  User,
  ExternalLink,
  Facebook,
  Instagram
} from "lucide-react"
import { cn } from "@/lib/utils"

interface ProfilePageProps {
  params: Promise<{
    username: string
  }>
}

interface UserProfile {
  id: string
  username: string
  fullName: string
  avatar: string | null
  role: string
  verified: boolean
  emailVerified: boolean
  badges: string[]
  profile: {
    bio: string
    location: string
    website: string
    socialLinks: {
      facebook?: string
      instagram?: string
    }
  }
  stats: {
    placesContributed: number
    reviewsWritten: number
    helpfulVotesReceived: number
    itinerariesCreated: number
  }
  createdAt: string
}

interface Place {
  id: string
  name: string
  slug: string
  shortDescription: string
  type: string
  region: string
  province: string
  images: any[]
  stats: {
    views: number
    likes: number
    saves: number
    reviews: number
  }
  trustLevel: string
  createdAt: string
}

export default function ProfilePage({ params }: ProfilePageProps) {
  const [username, setUsername] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [places, setPlaces] = useState<Place[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadProfile() {
      try {
        const resolvedParams = await params
        const usernameFromParams = resolvedParams.username
        setUsername(usernameFromParams)

        // Fetch user profile from API
        const response = await fetch(`/api/users/${usernameFromParams}`)
        const data = await response.json()

        if (!response.ok || !data.success) {
          if (response.status === 404) {
            notFound()
          }
          throw new Error(data.error || 'Failed to load profile')
        }

        setUserProfile(data.data.user)
        setPlaces(data.data.places || [])
      } catch (err: any) {
        console.error('Error loading profile:', err)
        setError(err.message || 'Failed to load profile')
      } finally {
        setIsLoading(false)
      }
    }
    loadProfile()
  }, [params])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
        <Header />
        <div className="container mx-auto py-16 flex justify-center items-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">Đang tải hồ sơ...</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (error || !userProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
        <Header />
        <div className="container mx-auto py-16 flex justify-center items-center min-h-[400px]">
          <div className="text-center">
            <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Không tìm thấy người dùng</h2>
            <p className="text-gray-600 mb-6">Tài khoản @{username} không tồn tại hoặc đã bị xóa.</p>
            <Button asChild>
              <Link href="/community">Khám phá cộng đồng</Link>
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
      <Header />

      <div className="container mx-auto py-8 px-4 max-w-7xl">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-600 mb-8" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-blue-600 transition-colors">
            Trang chủ
          </Link>
          <span>/</span>
          <Link href="/community" className="hover:text-blue-600 transition-colors">
            Cộng đồng
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">@{userProfile.username}</span>
        </nav>

        {/* Profile Header Card */}
        <Card className="mb-8 border-0 shadow-2xl bg-white/80 backdrop-blur-sm overflow-hidden">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-end mb-6">
              {/* Avatar */}
              <Avatar className="w-32 h-32 border-2 border-gray-200 shadow-lg">
                {userProfile.avatar ? (
                  <AvatarImage src={userProfile.avatar} alt={userProfile.fullName} />
                ) : null}
                <AvatarFallback className="text-4xl font-bold bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                  {userProfile.fullName?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                {/* Name and badges */}
                <div className="flex flex-col gap-3 mb-4">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                      {userProfile.fullName}
                    </h1>
                    {userProfile.verified && (
                      <CheckCircle className="h-6 w-6 text-blue-500" title="Tài khoản đã xác thực" />
                    )}
                  </div>
                  <p className="text-gray-600 text-lg">@{userProfile.username}</p>

                  {/* Role badge */}
                  <div className="flex items-center gap-2">
                    <ProfessionalRoleBadge role={userProfile.role} showLabel={true} />
                    {userProfile.emailVerified && (
                      <Badge variant="outline" className="border-green-500 text-green-700">
                        <Mail className="h-3 w-3 mr-1" />
                        Email đã xác thực
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Bio */}
                {userProfile.profile?.bio && (
                  <p className="text-gray-700 leading-relaxed mb-4 max-w-3xl">
                    {userProfile.profile.bio}
                  </p>
                )}

                {/* Meta info */}
                <div className="flex flex-wrap gap-6 text-sm text-gray-600">
                  {userProfile.profile?.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {userProfile.profile.location}
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Tham gia {new Date(userProfile.createdAt).toLocaleDateString('vi-VN', {
                      month: 'long',
                      year: 'numeric'
                    })}
                  </div>
                  {userProfile.profile?.website && (
                    <a
                      href={userProfile.profile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                    >
                      <Globe className="w-4 h-4" />
                      Website
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  {userProfile.profile?.socialLinks?.facebook && (
                    <a
                      href={userProfile.profile.socialLinks.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
                      title="Facebook"
                    >
                      <Facebook className="w-4 h-4" />
                    </a>
                  )}
                  {userProfile.profile?.socialLinks?.instagram && (
                    <a
                      href={userProfile.profile.socialLinks.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-pink-600 hover:text-pink-700 transition-colors"
                      title="Instagram"
                    >
                      <Instagram className="w-4 h-4" />
                    </a>
                  )}
                </div>

                {/* Badges */}
                {userProfile.badges && userProfile.badges.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {userProfile.badges.map((badge, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 border-amber-200"
                      >
                        <Award className="h-3 w-3 mr-1" />
                        {badge}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Địa điểm</CardTitle>
              <MapPin className="text-blue-500 h-5 w-5" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {places.length}
              </div>
              <p className="text-xs text-gray-500 mt-1">Đã đóng góp</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Đánh giá</CardTitle>
              <Star className="text-yellow-500 h-5 w-5" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {userProfile.stats?.reviewsWritten || 0}
              </div>
              <p className="text-xs text-gray-500 mt-1">Đã viết</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Hữu ích</CardTitle>
              <Heart className="text-red-500 h-5 w-5" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {userProfile.stats?.helpfulVotesReceived || 0}
              </div>
              <p className="text-xs text-gray-500 mt-1">Lượt vote</p>
            </CardContent>
          </Card>
        </div>

        {/* User's Places */}
        {places.length > 0 ? (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                Địa điểm đã đóng góp
              </h2>
              {places.length >= 12 && (
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/places?contributor=${username}`}>
                    Xem tất cả
                  </Link>
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {places.map((place) => (
                <PlaceCard
                  key={place.id}
                  place={place}
                  onAddToItinerary={() => {}}
                />
              ))}
            </div>
          </div>
        ) : (
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm mb-12">
            <CardContent className="p-12 text-center">
              <MapPin className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                Chưa có địa điểm nào
              </h3>
              <p className="text-gray-500">
                {userProfile.fullName} chưa đóng góp địa điểm nào cho cộng đồng.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <Footer />
    </div>
  )
}
