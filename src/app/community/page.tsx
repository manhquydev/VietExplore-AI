"use client"

export const dynamic = 'force-dynamic'

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useCommunityStats } from "@/hooks/use-community-stats"
import { useTopContributors } from "@/hooks/use-top-contributors"
import { useAnnouncements } from "@/hooks/use-announcements"
import { BrandedLoading } from "@/components/ui/branded-loading"
import {
  Users,
  MessageSquare,
  BookOpen,
  Award,
  TrendingUp,
  Calendar,
  ExternalLink,
  Heart,
  Star,
  FileText,
  MapPin,
  Sparkles,
  UserPlus,
  Globe,
  Loader2
} from "lucide-react"


const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// Map user role to badge SVG icons
const getRoleBadgeIcon = (role: string) => {
  const roleMap: Record<string, string> = {
    'admin': '/badges/verified.svg',
    'partner': '/badges/community-partner.svg',
    'contributor': '/badges/contributor.svg',
  }

  const normalizedRole = role.toLowerCase().trim()
  return roleMap[normalizedRole] || null
}

// Get user initials for avatar fallback
const getInitials = (name: string | undefined, username: string | undefined) => {
  if (name) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }
  if (username) {
    return username.slice(0, 2).toUpperCase()
  }
  return 'U'
}

export default function CommunityPage() {
  const { stats: communityStats, loading: statsLoading, error: statsError } = useCommunityStats()
  const { contributors: topContributors, loading: contributorsLoading, error: contributorsError } = useTopContributors({ limit: 3 })
  const { announcements, loading: announcementsLoading } = useAnnouncements({
    filters: { isPinned: true },
    limit: 3,
    adminMode: false
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-amber-50 ">
      <Header />
      
      <main className="min-h-screen pt-14 sm:pt-16 md:pt-20">
        {/* Hero Section - Compact & Optimized */}
        <section className="relative py-6 sm:py-8 md:py-12 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-green-50/80 via-amber-50/40 to-green-50/60 "></div>

          <div className="relative container">
            <div className="glass-card max-w-4xl mx-auto text-center p-4 sm:p-6 md:p-8">
              <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-slate-100  flex items-center justify-center">
                  <Users className="w-5 h-5 sm:w-6 sm:h-6 text-brand-green " />
                </div>
                <h1 className="gradient-text text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
                  Cộng Đồng Du Lịch Việt
                </h1>
              </div>
              <p className="text-sm sm:text-base md:text-lg text-slate-600  mb-4 sm:mb-5 md:mb-6 max-w-2xl mx-auto leading-relaxed">
                Kết nối với hàng nghìn người yêu du lịch Việt Nam. Chia sẻ trải nghiệm,<br className="hidden sm:block" />
                khám phá địa điểm mới và lên kế hoạch chuyến đi cùng nhau.
              </p>

              {/* Quick Stats - Visual Indicators */}
              <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 md:gap-6 text-xs sm:text-sm text-slate-600  mb-4 sm:mb-5 md:mb-6">
                {statsLoading ? (
                  <div className="flex items-center gap-2">
                    <BrandedLoading size="sm" variant="spinner" text="Đang tải thống kê..." showText={false} />
                    <span className="ml-2">Đang tải thống kê...</span>
                  </div>
                ) : statsError ? (
                  <div className="text-red-500 text-sm">{statsError}</div>
                ) : communityStats ? (
                  <>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-sky-500 rounded-full"></div>
                      <span>{communityStats.totalMembers.toLocaleString()} thành viên</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                      <span>{communityStats.totalPlaces.toLocaleString()} địa điểm</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span>{communityStats.totalItineraries.toLocaleString()} lịch trình</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                      <span>+{communityStats.monthlyGrowth}% tăng trưởng</span>
                    </div>
                  </>
                ) : null}
              </div>

              <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3 justify-center">
                <Button className="bg-gradient-to-r from-brand-green to-brand-forest hover:from-brand-forest hover:to-brand-green text-white min-h-[44px] text-sm sm:text-base">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Tham gia cộng đồng
                </Button>
                <Button variant="secondary" className="glass-subtle min-h-[44px] text-sm sm:text-base">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Hướng dẫn
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="container py-6 sm:py-8 md:py-10 lg:py-12">
          <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6 sm:space-y-8">
              {/* Announcements */}
              <div className="glass-card p-4 sm:p-5 md:p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-5 md:mb-6">
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 ">Thông báo cộng đồng</h2>
                  <Link href="/community/announcements">
                    <Button variant="secondary" size="sm" className="glass-subtle min-h-[40px] text-xs sm:text-sm">
                      Xem tất cả
                      <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
                
                <div className="space-y-3 sm:space-y-4">
                  {announcementsLoading ? (
                    <div className="flex justify-center py-6 sm:py-8">
                      <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin text-brand-green" />
                    </div>
                  ) : announcements.length === 0 ? (
                    <div className="glass-subtle p-6 sm:p-8 rounded-2xl text-center">
                      <p className="text-sm sm:text-base text-slate-600">Chưa có thông báo nào</p>
                    </div>
                  ) : (
                    announcements.map((announcement) => (
                      <Link
                        key={announcement.id}
                        href={`/community/announcements/${announcement.slug}`}
                        className="block glass-subtle p-4 sm:p-5 md:p-6 rounded-2xl hover:shadow-lg transition-shadow min-h-[44px]"
                      >
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3 mb-2 sm:mb-3">
                          <div className="flex flex-wrap items-center gap-2">
                            {announcement.isPinned && (
                              <Badge variant="danger" className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs">
                                Quan trọng
                              </Badge>
                            )}
                            <span className="text-xs sm:text-sm text-slate-600">
                              {announcement.publishedAt && formatDate(announcement.publishedAt)}
                            </span>
                          </div>
                          <span className="text-xs sm:text-sm text-slate-500">
                            {announcement.authorName}
                          </span>
                        </div>

                        <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1 sm:mb-2">
                          {announcement.title}
                        </h3>

                        <p className="text-sm sm:text-base text-slate-600 leading-relaxed line-clamp-2">
                          {announcement.excerpt}
                        </p>
                      </Link>
                    ))
                  )}
                </div>
              </div>

              {/* Community Guidelines */}
              <div className="glass-card p-4 sm:p-5 md:p-6">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900  mb-4 sm:mb-5 md:mb-6">Quy tắc cộng đồng</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <Link href="/community/guidelines">
                    <div className="glass-subtle p-4 sm:p-5 rounded-xl hover:scale-105 transition-transform cursor-pointer min-h-[88px] sm:min-h-[100px]">
                      <div className="flex items-center gap-2 sm:gap-3 mb-2">
                        <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-brand-green" />
                        <h3 className="font-semibold text-sm sm:text-base text-slate-900 ">Hướng dẫn đóng góp</h3>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-600 ">
                        Cách chia sẻ địa điểm và lịch trình hiệu quả
                      </p>
                    </div>
                  </Link>

                  <Link href="/community/handbook">
                    <div className="glass-subtle p-4 sm:p-5 rounded-xl hover:scale-105 transition-transform cursor-pointer min-h-[88px] sm:min-h-[100px]">
                      <div className="flex items-center gap-2 sm:gap-3 mb-2">
                        <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-brand-forest" />
                        <h3 className="font-semibold text-sm sm:text-base text-slate-900 ">Cẩm nang thành viên</h3>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-600 ">
                        Tất cả về cách sử dụng platform hiệu quả
                      </p>
                    </div>
                  </Link>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4 sm:space-y-6">
              {/* Top Contributors */}
              <div className="glass-card p-4 sm:p-5 md:p-6">
                <h3 className="text-base sm:text-lg font-bold text-slate-900  mb-3 sm:mb-4 flex items-center gap-2">
                  <Award className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />
                  Người đóng góp hàng đầu
                </h3>
                {contributorsLoading ? (
                  <div className="flex flex-col items-center justify-center py-6">
                    <BrandedLoading size="sm" variant="logo" text="Đang tải..." />
                  </div>
                ) : contributorsError ? (
                  <div className="text-center text-red-500 text-xs sm:text-sm py-4">{contributorsError}</div>
                ) : topContributors.length > 0 ? (
                  <div className="space-y-3 sm:space-y-4">
                    {topContributors.map((contributor, index) => {
                      const badgeIcon = getRoleBadgeIcon(contributor.role)
                      return (
                        <Link
                          key={contributor.id}
                          href={`/profile/${contributor.username}`}
                          className="flex items-center gap-2 sm:gap-3 hover:bg-gray-50 p-2 -m-2 rounded-xl transition-colors min-h-[56px]"
                        >
                          <div className="relative flex-shrink-0">
                            <Avatar className="w-10 h-10 sm:w-12 sm:h-12 ring-2 ring-brand-green/20">
                              <AvatarImage src={contributor.avatar || undefined} alt={contributor.name} />
                              <AvatarFallback className="bg-gradient-to-r from-brand-green to-brand-forest text-white text-xs sm:text-sm">
                                {getInitials(contributor.name, contributor.username)}
                              </AvatarFallback>
                            </Avatar>
                            {index === 0 && (
                              <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-yellow-500 rounded-full flex items-center justify-center shadow-md">
                                <Star className="w-2 h-2 sm:w-3 sm:h-3 text-white fill-current" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1 sm:gap-2 mb-0.5 sm:mb-1">
                              <h4 className="font-semibold text-slate-900 text-xs sm:text-sm truncate">
                                {contributor.name}
                              </h4>
                              {badgeIcon && (
                                <div className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0">
                                  <Image
                                    src={badgeIcon}
                                    alt={contributor.role}
                                    width={16}
                                    height={16}
                                    className="w-full h-full object-contain"
                                    title={contributor.role}
                                  />
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-1 sm:gap-2 text-[10px] sm:text-xs text-slate-600">
                              <span className="truncate">@{contributor.username}</span>
                              <span>•</span>
                              <span className="flex-shrink-0">{contributor.contributions} đóng góp</span>
                            </div>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 text-xs sm:text-sm py-4">Chưa có người đóng góp</div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="glass-card p-4 sm:p-5 md:p-6">
                <h3 className="text-base sm:text-lg font-bold text-slate-900  mb-3 sm:mb-4">Hành động nhanh</h3>
                <div className="space-y-2 sm:space-y-3">
                  <Link href="/contribute/new-place">
                    <Button variant="secondary" className="w-full glass-subtle justify-start min-h-[44px] text-sm sm:text-base">
                      <MapPin className="w-4 h-4 mr-2 sm:mr-3" />
                      Thêm địa điểm mới
                    </Button>
                  </Link>

                  <Link href="/community/guidelines">
                    <Button variant="secondary" className="w-full glass-subtle justify-start min-h-[44px] text-sm sm:text-base">
                      <BookOpen className="w-4 h-4 mr-2 sm:mr-3" />
                      Đọc hướng dẫn
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Community Highlights */}
              <div className="glass-card p-4 sm:p-5 md:p-6">
                <h3 className="text-base sm:text-lg font-bold text-slate-900  mb-3 sm:mb-4">Nổi bật tuần này</h3>
                {statsLoading ? (
                  <div className="flex flex-col items-center justify-center py-6">
                    <BrandedLoading size="sm" variant="logo" text="Đang tải..." />
                  </div>
                ) : statsError ? (
                  <div className="text-center text-red-500 text-xs sm:text-sm py-4">{statsError}</div>
                ) : communityStats?.weeklyHighlights ? (
                  <div className="space-y-3 sm:space-y-4">
                    <div className="glass-subtle p-3 sm:p-4 rounded-xl">
                      <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
                        <Heart className="w-3 h-3 sm:w-4 sm:h-4 text-red-500" />
                        <span className="text-xs sm:text-sm font-medium text-slate-900 ">
                          Địa điểm được yêu thích nhất
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-600 ">
                        {communityStats.weeklyHighlights.topPlace ? (
                          <Link
                            href={`/places/${communityStats.weeklyHighlights.topPlace.slug}`}
                            className="hover:text-brand-green underline"
                          >
                            {communityStats.weeklyHighlights.topPlace.name} với {communityStats.weeklyHighlights.topPlace.likes.toLocaleString()} lượt thích
                          </Link>
                        ) : (
                          'Chưa có dữ liệu'
                        )}
                      </p>
                    </div>

                    <div className="glass-subtle p-3 sm:p-4 rounded-xl">
                      <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
                        <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500" />
                        <span className="text-xs sm:text-sm font-medium text-slate-900 ">
                          Lịch trình hot nhất
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-600 ">
                        {communityStats.weeklyHighlights.topItinerary ? (
                          `"${communityStats.weeklyHighlights.topItinerary.title}" bởi ${communityStats.weeklyHighlights.topItinerary.author}`
                        ) : (
                          'Tính năng lịch trình sẽ có sớm'
                        )}
                      </p>
                    </div>

                    <div className="glass-subtle p-3 sm:p-4 rounded-xl">
                      <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
                        <Globe className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500" />
                        <span className="text-xs sm:text-sm font-medium text-slate-900 ">
                          Xu hướng tìm kiếm
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-600 ">
                        {communityStats.weeklyHighlights.trending.length > 0 ? (
                          `${communityStats.weeklyHighlights.trending.join(' ')} đang trending`
                        ) : (
                          'Chưa có xu hướng nổi bật'
                        )}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 text-xs sm:text-sm py-4">Chưa có dữ liệu</div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
