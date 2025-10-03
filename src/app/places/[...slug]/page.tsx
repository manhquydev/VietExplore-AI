import { notFound } from "next/navigation"
import { PlaceDetailContent } from "@/components/place-detail-content"
import { Place } from "@/lib/types/places"
import { Metadata } from "next"
import { getCanonicalPlaceUrl, parseCompoundUrl } from "@/lib/utils/url-helpers"
import { getAdminDb } from "@/lib/server/firebaseAdmin"

interface PlaceData {
  id: string
  name: string
  shortDescription: string
  description: string
  type: "bien" | "nui" | "van-hoa" | "am-thuc" | "check-in"
  region: "bac-bo" | "trung-bo" | "nam-bo"
  province: string
  address: string
  coordinates: {
    lat: number
    lng: number
  }
  images: Array<{
    id: string
    url: string
    alt: string
    caption?: string
    isPrimary: boolean
  }>
  video?: {
    id: string
    url: string
    thumbnail?: string
    duration?: number
  }
  openingHours?: string
  entryFee?: string
  bestTimeToVisit?: string
  facilities: string[]
  tags: string[]
  sources: Array<{
    type: "website" | "social" | "document" | "personal"
    url: string
    description: string
  }>
  trustLevel: "community" | "contributor" | "partner" | "verified"
  authorRole: "contributor" | "partner" | "admin"
  authorName: string
  createdAt: string
  updatedAt: string
  stats: {
    views: number
    likes: number
    saves: number
    reviews: number
  }
  // Vietnam Address structure
  vietnamAddress?: {
    provinceId: string
    provinceName: string
    districtId?: string
    districtName?: string
    wardId?: string
    wardName?: string
    fullAddress: string
  }
  // Address conversion data (old vs new after administrative changes)
  addressConversion?: {
    oldAddress: {
      province: { id: number, name: string }
      district: { id: number, name: string } | null
      ward: { id: number, name: string } | null
      fullAddress: string
    }
    newAddress: {
      province: { id: number, name: string }
      district: { id: number, name: string } | null
      ward: { id: number, name: string } | null
      fullAddress: string
    } | null
    hasChanges: boolean
    conversionMessage: string
    status: 'converted' | 'unchanged'
  }
}

// Fetch all place IDs for compound URL parsing - Direct Firestore access
async function getAllPlaceIds(): Promise<string[]> {
  try {
    const adminDb = getAdminDb();
    const placesSnapshot = await adminDb.collection('places')
      .where('status', '==', 'published')
      .select() // Only get document IDs for performance
      .get();

    return placesSnapshot.docs.map(doc => doc.id);
  } catch (error) {
    console.error('Error fetching place IDs from Firestore:', error);
    return [];
  }
}

// Fetch real place data - Direct Firestore access
async function getPlaceData(id: string): Promise<PlaceData | null> {
  try {
    const adminDb = getAdminDb();
    const placeDoc = await adminDb.collection('places').doc(id).get();

    if (!placeDoc.exists) {
      return null;
    }

    const place = placeDoc.data() as Place;

    // Only return published places
    if (place.status !== 'published') {
      return null;
    }

    // Transform Firestore data to PlaceData format
    return {
      id: placeDoc.id,
      name: place.name,
      shortDescription: place.shortDescription || '',
      description: place.description || '',
      type: place.type,
      region: place.region,
      province: place.province,
      address: place.address || '',
      coordinates: place.coordinates || { lat: 0, lng: 0 },
      images: place.images || [],
      video: place.video ? {
        id: place.video.id || 'video-1',
        url: place.video.url,
        thumbnail: place.video.thumbnail,
        duration: place.video.duration
      } : undefined,
      openingHours: place.openingHours,
      entryFee: place.entryFee,
      bestTimeToVisit: place.bestTimeToVisit,
      facilities: place.facilities || [],
      tags: place.tags || [],
      sources: place.sources ? place.sources.map((s: any) => ({
        type: s.type || 'website',
        url: s.url || '',
        description: s.description || ''
      })) : [],
      trustLevel: place.trustLabel || 'community',
      authorRole: place.source?.type === 'partner' ? 'partner' : 'contributor',
      authorName: place.source?.partnerName || 'Cộng đồng',
      createdAt: place.createdAt,
      updatedAt: place.updatedAt,
      stats: {
        views: place.viewCount || 0,
        likes: place.likeCount || 0,
        saves: 0, // Not implemented yet
        reviews: place.rating?.count || 0
      },
      vietnamAddress: place.vietnamAddress || undefined,
      addressConversion: place.addressConversion || undefined
    };
  } catch (error) {
    console.error('Error fetching place data from Firestore:', error);
    return null;
  }
}

// Fallback mock data for development
const mockPlace: PlaceData = {
  id: "bai-bien-my-khe-da-nang",
  name: "Bãi biển Mỹ Khê",
  shortDescription: "Một trong những bãi biển đẹp nhất Việt Nam với cát trắng mịn và nước biển trong xanh",
  description: `Bãi biển Mỹ Khê là một trong những bãi biển đẹp nhất Đà Nẵng và được tạp chí Forbes bình chọn là một trong 6 bãi biển quyến rũ nhất hành tinh.

Với đường bờ biển dài khoảng 20km, cát trắng mịn màng và làn nước trong xanh, Mỹ Khê là điểm đến lý tưởng cho những ai yêu thích hoạt động thể thao biển và thư giãn.

Đặc biệt, bãi biển này có hướng Đông Nam nên rất thuận lợi cho việc ngắm bình minh. Khu vực xung quanh có nhiều resort, khách sạn cao cấp và nhà hàng hải sản tươi ngon.

Các hoạt động phổ biến tại đây bao gồm tắm biển, lướt sóng, chơi thể thao bãi biển, và thưởng thức hải sản tại các quán ven biển.`,
  type: "bien",
  region: "trung-bo",
  province: "da-nang",
  address: "Phường Phước Mỹ, Quận Sơn Trà, Đà Nẵng",
  coordinates: {
    lat: 16.0544,
    lng: 108.2277
  },
  images: [
    {
      id: "img1",
      url: "https://images.unsplash.com/photo-1539650116574-75c0c6d73c6e?w=800",
      alt: "Toàn cảnh bãi biển Mỹ Khê",
      caption: "Bãi biển Mỹ Khê vào buổi sáng với cát trắng mịn",
      isPrimary: true
    },
    {
      id: "img2", 
      url: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800",
      alt: "Hoạt động lướt sóng tại Mỹ Khê",
      caption: "Du khách lướt sóng tại bãi biển",
      isPrimary: false
    },
    {
      id: "img3",
      url: "https://images.unsplash.com/photo-1540979388789-6cee28a1cdc9?w=800", 
      alt: "Cầu Rồng nhìn từ bãi biển",
      caption: "Cầu Rồng nhìn từ bãi biển Mỹ Khê",
      isPrimary: false
    }
  ],
  openingHours: "24/7",
  entryFee: "Miễn phí",
  bestTimeToVisit: "Tháng 3 - 8",
  facilities: ["Bãi đỗ xe", "Nhà vệ sinh", "Khu thay đồ", "Nhà hàng", "Cửa hàng lưu niệm", "WiFi miễn phí"],
  tags: ["biển", "gia đình", "thể thao", "check-in", "bình minh"],
  sources: [
    {
      type: "website",
      url: "https://danang.gov.vn",
      description: "Website chính thức thành phố Đà Nẵng"
    },
    {
      type: "social",
      url: "https://facebook.com/danangfantasticity",
      description: "Fanpage du lịch Đà Nẵng"
    }
  ],
  trustLevel: "partner",
  authorRole: "partner",
  authorName: "Sở Du lịch Đà Nẵng",
  createdAt: "2024-01-15",
  updatedAt: "2024-02-20", 
  stats: {
    views: 15420,
    likes: 892,
    saves: 234,
    reviews: 67
  }
}

const typeLabels = {
  bien: "Biển",
  nui: "Núi", 
  "van-hoa": "Văn hóa",
  "am-thuc": "Ẩm thực",
  "check-in": "Check-in"
}

const regionLabels = {
  "bac-bo": "Miền Bắc",
  "trung-bo": "Miền Trung", 
  "nam-bo": "Miền Nam"
}

// Generate metadata for SEO and social sharing
export async function generateMetadata({ params }: { params: Promise<{ slug: string[] }> }): Promise<Metadata> {
  const { slug } = await params;
  const compoundSlug = slug[0];
  
  // Parse compound URL to get actual place ID
  const allPlaceIds = await getAllPlaceIds();
  const placeId = parseCompoundUrl(compoundSlug, allPlaceIds);
  
  if (!placeId) {
    return {
      title: 'Địa điểm không tồn tại - VietExplore',
      description: 'Không tìm thấy địa điểm này trên VietExplore'
    };
  }
  
  const place = await getPlaceData(placeId);
  
  if (!place) {
    return {
      title: 'Địa điểm không tồn tại - VietExplore',
      description: 'Không tìm thấy địa điểm này trên VietExplore'
    };
  }

  // Generate canonical compound URL
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
    (process.env.NODE_ENV === 'production' ? 'https://www.dulichviet.tech' : 'http://localhost:9002');
  const canonicalUrl = getCanonicalPlaceUrl({
    id: place.id,
    name: place.name
  }, baseUrl);
  
  return {
    title: `${place.name} - ${place.province} | VietExplore`,
    description: place.shortDescription,
    alternates: {
      canonical: canonicalUrl
    },
    openGraph: {
      title: place.name,
      description: place.shortDescription,
      url: canonicalUrl,
      siteName: 'VietExplore',
      images: place.images.length > 0 ? [
        {
          url: place.images[0].url,
          width: 1200,
          height: 630,
          alt: place.name
        }
      ] : []
    },
    twitter: {
      card: 'summary_large_image',
      title: place.name,
      description: place.shortDescription,
      images: place.images.length > 0 ? [place.images[0].url] : []
    }
  };
}

export default async function PlaceDetailPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const compoundSlug = slug[0]; // First part of slug is the compound slug
  
  // Parse compound URL to get actual place ID
  const allPlaceIds = await getAllPlaceIds();
  const placeId = parseCompoundUrl(compoundSlug, allPlaceIds);
  
  if (!placeId) {
    notFound()
  }
  
  // Fetch real place data
  const place = await getPlaceData(placeId);
  
  if (!place) {
    notFound()
  }
  
  return <PlaceDetailContent place={place} />
}