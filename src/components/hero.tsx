import * as React from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { apiClient } from "@/lib/client/api"
import { generatePlaceUrl } from "@/lib/utils/url-helpers"
import type { Place } from "@/lib/types/places"

const REGION_LABELS: Record<string, string> = {
  "bac-bo": "Miền Bắc",
  "trung-bo": "Miền Trung",
  "nam-bo": "Miền Nam",
}

const STAR_PATH =
  "M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.804 2.037a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.804-2.037a1 1 0 00-1.176 0l-2.804 2.037c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"

type HeroDisplay = {
  title: string
  description: string
  location: string
  image: string
  href: string
  rating?: Place["rating"]
  trustLabel?: Place["trustLabel"]
  isFallback: boolean
}

const DEFAULT_HERO_CONTENT: HeroDisplay = {
  title: "Golden Hour Vietnam",
  description: "Photographic art capturing the soul of each destination",
  location: "Việt Nam",
  image:
    "https://images.unsplash.com/photo-1526481280695-3c46973ed5c4?w=1200&h=900&fit=crop&q=80",
  href: "/places",
  isFallback: true,
}

export const Hero: React.FC = () => {
  const [randomPlace, setRandomPlace] = React.useState<Place | null>(null)
  const [placeLoading, setPlaceLoading] = React.useState(true)

  React.useEffect(() => {
    let active = true

    const loadRandomPlace = async () => {
      const fetchRandomPlace = async (
        filters: Parameters<typeof apiClient.places.random>[0],
      ) => {
        try {
          return await apiClient.places.random(filters)
        } catch (error) {
          console.error("Failed to fetch random place:", error)
          return {
            success: false as const,
            data: undefined,
            error:
              (error as { error?: string; message?: string })?.error ||
              (error as { message?: string })?.message ||
              "Call random place API failed",
          }
        }
      }

      try {
        setPlaceLoading(true)

        let response = await fetchRandomPlace({ trustLabel: "verified", pool: 50 })

        if ((!response.success || !response.data) && active) {
          response = await fetchRandomPlace({ pool: 50 })
        }

        if (!active) {
          return
        }

        if (response.success && response.data) {
          setRandomPlace(response.data)
        } else if (response.error && active) {
          console.warn("Random place response:", response.error)
        }
      } catch (error) {
        if (active) {
          console.error("Failed to load random place for hero:", error)
        }
      } finally {
        if (active) {
          setPlaceLoading(false)
        }
      }
    }

    loadRandomPlace()

    return () => {
      active = false
    }
  }, [])

  const heroContent = React.useMemo<HeroDisplay>(() => {
    if (!randomPlace) {
      return DEFAULT_HERO_CONTENT
    }

    const primaryImage =
      randomPlace.images?.find((image) => image?.isPrimary)?.url ??
      randomPlace.images?.[0]?.url ??
      DEFAULT_HERO_CONTENT.image

    const description =
      randomPlace.shortDescription?.trim() ||
      randomPlace.description?.trim() ||
      DEFAULT_HERO_CONTENT.description

    return {
      title: randomPlace.name,
      description,
      location:
        randomPlace.province?.trim() ||
        REGION_LABELS[randomPlace.region] ||
        DEFAULT_HERO_CONTENT.location,
      image: primaryImage,
      href: generatePlaceUrl({
        slug: randomPlace.slug,
        name: randomPlace.name,
        id: randomPlace.id,
      }),
      rating: randomPlace.rating,
      trustLabel: randomPlace.trustLabel,
      isFallback: false,
    }
  }, [randomPlace])

  const heroDescription = React.useMemo(() => {
    const text = heroContent.description || ""
    if (text.length > 160) {
      return `${text.slice(0, 157)}...`
    }
    return text
  }, [heroContent.description])

  const ratingAverage = randomPlace?.rating?.average ?? null
  const ratingCount = randomPlace?.rating?.count ?? 0

  return (
    <section className="container py-12 sm:py-16 lg:py-24 relative overflow-hidden">
      {/* Subtle background gradient - like morning mist */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/3 via-transparent to-secondary/3 -z-10" />
      
      <div className="grid lg:grid-cols-12 gap-8 lg:gap-16 items-center">
        {/* Text Content - "Typography as Voice" */}
        <div className="lg:col-span-6 space-y-8 lg:space-y-10">
          <div className="space-y-6 lg:space-y-8">
            <Badge variant="outline" className="w-fit bg-primary/8 border-primary/20 text-primary font-medium backdrop-blur-sm flex items-center gap-2 text-xs sm:text-sm">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="14" 
                height="14" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                className="sm:w-4 sm:h-4"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <circle cx="9" cy="9" r="2"/>
                <path d="M21 15l-3.086-3.086a2 2 0 00-2.828 0L6 21"/>
              </svg>
              Cửa sổ khám phá Việt Nam
            </Badge>
            
            {/* Strong Typography Hierarchy - Confident & Modern */}
            <h1 className="font-bold leading-[1.1] text-[clamp(28px,6vw,68px)] tracking-tight text-text">
              Khám phá vẻ đẹp{" "}
              <span className="gradient-text">
                Việt Nam
              </span>{" "}
              qua ống kính AI
            </h1>
            
            {/* Comfortable reading - like quiet conversation */}
            <p className="text-muted text-base sm:text-lg leading-relaxed max-w-xl">
              Từng thước phim, từng câu chuyện là một cánh cửa mở ra vẻ đẹp bất tận của đất nước. 
              Để AI đồng hành cùng bạn tạo nên hành trình khó quên qua những địa điểm đáng tin cậy nhất.
            </p>
          </div>

          {/* Gentle, refined CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Link href="/places">
              <Button
                size="lg"
                className="motion-gentle w-full sm:w-auto text-base sm:text-lg px-6 sm:px-10 py-4 sm:py-6 h-auto rounded-xl bg-primary hover:bg-primary-700 text-white shadow-lg hover:shadow-xl hover:scale-105 font-semibold"
              >
                Khám phá ngay →
              </Button>
            </Link>
            <Link href="/ai-assistant/chat">
              <Button
                variant="secondary"
                size="lg"
                className="motion-gentle w-full sm:w-auto text-base sm:text-lg px-6 sm:px-10 py-4 sm:py-6 h-auto rounded-xl border-2 border-primary/30 text-primary hover:bg-primary/5 hover:border-primary/50 font-semibold backdrop-blur-sm"
              >
                Trò chuyện với AI
              </Button>
            </Link>
          </div>

          {/* Eloquent emptiness - generous spacing for trust indicators */}
          <div className="pt-8 lg:pt-12 space-y-4 lg:space-y-6">
            <p className="text-xs sm:text-sm text-muted font-semibold uppercase tracking-wider opacity-60">
              Được tin tưởng bởi cộng đồng
            </p>
            <div className="grid grid-cols-3 gap-4 sm:gap-8">
              <div className="text-center space-y-1 sm:space-y-2">
                <div className="text-xl sm:text-3xl font-bold text-primary">1K+</div>
                <div className="text-xs sm:text-sm text-muted">Địa điểm xác minh</div>
              </div>
              <div className="text-center space-y-1 sm:space-y-2">
                <div className="text-xl sm:text-3xl font-bold text-primary">10K+</div>
                <div className="text-xs sm:text-sm text-muted">Người dùng</div>
              </div>
              <div className="text-center space-y-1 sm:space-y-2">
                <div className="text-xl sm:text-3xl font-bold text-primary">100%</div>
                <div className="text-xs sm:text-sm text-muted">Kiểm duyệt</div>
              </div>
            </div>
          </div>
        </div>

        {/* Hero Visual - "Sheet of Glass" Principle */}
        <div className="lg:col-span-6 mt-8 lg:mt-0">
          <div className="relative">
            {/* Main Glass Card - Premium photographic art */}
            <div className="relative glass-card overflow-hidden motion-gentle hover:scale-[1.02]">
              <div className="aspect-[4/3] sm:aspect-[5/4] relative">
                {heroContent.image ? (
                  <img
                    src={heroContent.image}
                    alt={heroContent.title}
                    className="absolute inset-0 h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : null}

                <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-secondary/20 to-primary/30 mix-blend-multiply" />

                {/* Gentle motion overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />

                <div className="absolute inset-0 flex items-center justify-center p-6 sm:p-8">
                  <div className="text-center text-white drop-shadow-lg space-y-4 max-w-xl">
                    <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-white/70">
                      {randomPlace ? "Gợi ý ngẫu nhiên hôm nay" : "Câu chuyện từ VietExplore"}
                      {placeLoading ? (
                        <span className="h-1 w-1 rounded-full bg-white/60 animate-pulse" />
                      ) : null}
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-bold">{heroContent.title}</h3>
                    <p className="text-sm sm:text-base text-white/90 leading-relaxed">
                      {heroDescription}
                    </p>
                  </div>
                </div>

                {/* Floating glass elements - Subtle signposts */}
                <div className="absolute top-6 right-6 glass-subtle rounded-xl p-4 motion-soft hover:scale-105">
                  {ratingAverage !== null ? (
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 text-success font-semibold">
                        <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path d={STAR_PATH} />
                        </svg>
                        <span>{ratingAverage.toFixed(1)}</span>
                      </div>
                      <span className="text-xs text-muted">
                        {ratingCount} reviews
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-success rounded-full animate-pulse opacity-80" />
                      <span className="text-sm font-medium text-text">AI san sang ho tro</span>
                    </div>
                  )}
                </div>

                <div className="absolute bottom-6 left-6 glass-subtle rounded-xl p-4 sm:p-5 motion-soft">
                  <div className="space-y-2">
                    <div className="font-semibold text-text flex flex-wrap items-center gap-2">
                      {heroContent.title}
                      {randomPlace?.trustLabel === "verified" ? (
                        <span className="text-[10px] uppercase tracking-widest bg-success/10 text-success px-2 py-0.5 rounded-full">
                          Verified
                        </span>
                      ) : null}
                    </div>
                    <div className="text-sm flex flex-wrap items-center gap-3 text-white/90 drop-shadow-md">
                      <span>{heroContent.location}</span>
                      {ratingAverage !== null ? (
                        <span className="flex items-center gap-1 text-success font-semibold">
                          <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path d={STAR_PATH} />
                          </svg>
                          {ratingAverage.toFixed(1)}
                        </span>
                      ) : null}
                      {randomPlace ? (
                        <Link
                          href={heroContent.href}
                          className="inline-flex items-center gap-1 rounded-full bg-primary/80 px-3 py-1 text-xs sm:text-sm font-semibold text-white shadow-sm hover:bg-primary transition-colors"
                        >
                          Khám phá
                        </Link>
                      ) : (
                        <span>4 ngay - Khuyen nghi AI</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Floating glass cards - Natural, fluid positioning */}
            <div className="absolute -top-8 -left-8 glass-subtle rounded-2xl p-6 hidden lg:block motion-gentle hover:scale-110">
              <div className="text-center space-y-2">
                <div className="text-3xl font-bold text-primary">AI</div>
                <div className="text-sm font-medium text-text">Cá nhân hóa</div>
                <div className="text-xs text-muted">Thông minh</div>
              </div>
            </div>

            <div className="absolute -bottom-8 -right-8 glass-subtle rounded-2xl p-6 hidden lg:block motion-gentle hover:scale-110">
              <div className="text-center space-y-2">
                {/* Only necessary functional icon */}
                <svg className="w-8 h-8 text-success mx-auto" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                </svg>
                <div className="text-sm font-medium text-text">Đáng tin cậy</div>
                <div className="text-xs text-muted">Cộng đồng</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
