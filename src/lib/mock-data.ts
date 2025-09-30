// Mock Data cho tất cả User Roles - Du Lịch Việt

export interface MockUser {
  id: string
  email: string
  password: string // For testing only
  fullName: string
  username: string
  avatar?: string
  role: "guest" | "traveler" | "contributor" | "partner" | "moderator" | "admin"
  verified: boolean
  createdAt: string
  profile?: {
    bio?: string
    location?: string
    website?: string
    socialLinks?: {
      facebook?: string
      instagram?: string
    }
  }
  stats?: {
    placesContributed: number
    itinerariesCreated: number
    helpfulVotes: number
  }
  permissions?: string[]
}

// Mock Users cho từng role để test đầy đủ tính năng
export const MOCK_USERS: MockUser[] = [
  // 1. GUEST (Khách vãng lai)
  {
    id: "guest_001",
    email: "guest@example.com",
    password: "password123",
    fullName: "Khách Vãng Lai",
    username: "guest_user",
    role: "guest",
    verified: false,
    createdAt: "2024-03-01T10:00:00Z",
    stats: {
      placesContributed: 0,
      itinerariesCreated: 0,
      helpfulVotes: 0
    }
  },

  // 2. TRAVELER (Người dùng đăng nhập)
  {
    id: "traveler_001",
    email: "traveler@example.com", 
    password: "password123",
    fullName: "Nguyễn Văn An",
    username: "nguyen_van_an",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
    role: "traveler",
    verified: false,
    createdAt: "2024-02-15T14:30:00Z",
    profile: {
      bio: "Yêu thích khám phá những địa điểm mới và chia sẻ trải nghiệm du lịch",
      location: "Hà Nội, Việt Nam",
      website: "https://travelblog.com"
    },
    stats: {
      placesContributed: 0,
      itinerariesCreated: 5,
      helpfulVotes: 23
    },
    permissions: ["create_itinerary", "save_places", "report_content"]
  },

  // 3. CONTRIBUTOR (Cộng tác viên xác minh)
  {
    id: "contributor_001",
    email: "contributor@example.com",
    password: "password123", 
    fullName: "Trần Thị Bình",
    username: "tran_thi_binh",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b332c5cd?w=100&h=100&fit=crop&crop=face",
    role: "contributor",
    verified: true,
    createdAt: "2024-01-10T09:15:00Z",
    profile: {
      bio: "Travel blogger với 5 năm kinh nghiệm khám phá Việt Nam. Chuyên về du lịch bụi và văn hóa địa phương.",
      location: "TP. Hồ Chí Minh, Việt Nam",
      website: "https://dulichvietnam.blog",
      socialLinks: {
        facebook: "https://facebook.com/dulichblog",
        instagram: "https://instagram.com/vietnam_explorer"
      }
    },
    stats: {
      placesContributed: 28,
      itinerariesCreated: 12,
      helpfulVotes: 156
    },
    permissions: ["create_place", "create_itinerary", "save_places", "report_content"]
  },

  // 4. COMMUNITY PARTNER (Đối tác cộng đồng)
  {
    id: "partner_001",
    email: "partner@danang.gov.vn",
    password: "password123",
    fullName: "Sở Du lịch Đà Nẵng",
    username: "danang_tourism",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    role: "partner",
    verified: true,
    createdAt: "2024-01-05T11:20:00Z",
    profile: {
      bio: "Cơ quan quản lý du lịch chính thức của thành phố Đà Nẵng. Cung cấp thông tin chính thống về các điểm tham quan, sự kiện và dịch vụ du lịch.",
      location: "Đà Nẵng, Việt Nam",
      website: "https://tourism.danang.vn"
    },
    stats: {
      placesContributed: 45,
      itinerariesCreated: 8,
      helpfulVotes: 289
    },
    permissions: ["create_place_priority", "create_itinerary", "partner_badge", "fast_review"]
  },

  // 5. MODERATOR (Kiểm duyệt viên)
  {
    id: "moderator_001",
    email: "moderator@dulichviet.com",
    password: "password123",
    fullName: "Lê Văn Cường",
    username: "le_van_cuong",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    role: "moderator",
    verified: true,
    createdAt: "2023-12-01T08:00:00Z",
    profile: {
      bio: "Kiểm duyệt viên với chuyên môn về du lịch và quản lý nội dung. Đảm bảo chất lượng thông tin trên nền tảng.",
      location: "Hà Nội, Việt Nam"
    },
    stats: {
      placesContributed: 12,
      itinerariesCreated: 3,
      helpfulVotes: 67
    },
    permissions: [
      "review_content", "approve_content", "reject_content", "hide_content",
      "handle_reports", "assign_tasks", "view_moderation_queue"
    ]
  },

  // 6. ADMIN (Quản trị viên)
  {
    id: "admin_001",
    email: "admin@dulichviet.com",
    password: "password123",
    fullName: "Phạm Thị Dung",
    username: "pham_thi_dung",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b332c5cd?w=100&h=100&fit=crop&crop=face",
    role: "admin",
    verified: true,
    createdAt: "2023-11-01T10:00:00Z",
    profile: {
      bio: "Quản trị viên hệ thống Du Lịch Việt. Phụ trách vận hành, phát triển tính năng và quản lý đội ngũ.",
      location: "Hà Nội, Việt Nam",
      website: "https://dulichviet.com"
    },
    stats: {
      placesContributed: 8,
      itinerariesCreated: 2,
      helpfulVotes: 45
    },
    permissions: [
      "all_moderation_permissions", "manage_users", "assign_roles", 
      "view_analytics", "emergency_actions", "system_settings"
    ]
  }
]

// Mock Places Data với different trust levels
export const MOCK_PLACES = [
  // Community content
  {
    id: "place_community_001",
    slug: "bai-bien-quy-nhon",
    name: "Bãi biển Quy Nhon",
    shortDescription: "Bãi biển hoang sơ với cát vàng và nước biển trong xanh",
    description: "Bãi biển Quy Nhon nằm ở thành phố Quy Nhon, tỉnh Bình Định...",
    region: "trung-bo",
    province: "Bình Định",
    type: "bien",
    trustLabel: "verified",
    status: "published",
    createdBy: "traveler_001",
    images: ["https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop"],
    rating: { average: 4.5, count: 89 },
    tags: ["biển", "hoang sơ", "bình định"]
  },
  
  // Contributor content
  {
    id: "place_contributor_001", 
    slug: "doi-che-moc-chau",
    name: "Đồi chè Mộc Châu",
    shortDescription: "Cảnh quan đồi chè bạt ngàn với không khí trong lành",
    description: "Mộc Châu nổi tiếng với những đồi chè xanh mướt...",
    region: "bac-bo",
    province: "Sơn La",
    type: "nui",
    trustLabel: "contributor",
    status: "published",
    createdBy: "contributor_001",
    images: ["https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop"],
    rating: { average: 4.7, count: 124 },
    tags: ["núi", "chè", "sơn la"]
  },

  // Partner content
  {
    id: "place_partner_001",
    slug: "bai-bien-my-khe",
    name: "Bãi biển Mỹ Khê", 
    shortDescription: "Bãi biển đẹp nhất Đà Nẵng với cát trắng mịn",
    description: "Bãi biển Mỹ Khê được Forbes bình chọn...",
    region: "trung-bo",
    province: "Đà Nẵng",
    type: "bien",
    trustLabel: "partner",
    status: "published",
    createdBy: "partner_001",
    images: ["https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop"],
    rating: { average: 4.8, count: 1250 },
    tags: ["biển", "đà nẵng", "forbes"]
  },

  // Verified content
  {
    id: "place_verified_001",
    slug: "vinh-ha-long",
    name: "Vịnh Hạ Long",
    shortDescription: "Di sản thiên nhiên thế giới UNESCO",
    description: "Vịnh Hạ Long với hàng nghìn đảo đá vôi...",
    region: "bac-bo", 
    province: "Quảng Ninh",
    type: "bien",
    trustLabel: "verified",
    status: "published",
    createdBy: "admin_001",
    images: ["https://images.unsplash.com/photo-1528127269322-539801943592?w=800&h=600&fit=crop"],
    rating: { average: 4.9, count: 3200 },
    tags: ["biển", "unesco", "di sản"]
  }
]

// Mock Itineraries
export const MOCK_ITINERARIES = [
  {
    id: "itinerary_traveler_001",
    slug: "ha-noi-3-ngay",
    title: "Khám phá Hà Nội 3 ngày 2 đêm",
    description: "Lịch trình chi tiết khám phá thủ đô ngàn năm văn hiến",
    duration: 3,
    createdBy: "traveler_001",
    isPublic: true,
    places: [
      { day: 1, name: "Hồ Gươm", duration: 120 },
      { day: 1, name: "Phố cổ Hà Nội", duration: 180 },
      { day: 2, name: "Văn Miếu", duration: 90 },
      { day: 2, name: "Lăng Bác", duration: 60 }
    ],
    stats: { views: 245, likes: 18, copies: 5 }
  },
  
  {
    id: "itinerary_contributor_001",
    slug: "sapa-trekking-5-ngay", 
    title: "Sa Pa trekking 5 ngày chuyên sâu",
    description: "Hành trình khám phá Sa Pa dành cho người yêu thích trekking",
    duration: 5,
    createdBy: "contributor_001", 
    isPublic: true,
    places: [
      { day: 1, name: "Thị trấn Sa Pa", duration: 240 },
      { day: 2, name: "Bản Cát Cát", duration: 300 },
      { day: 3, name: "Fansipan", duration: 480 }
    ],
    stats: { views: 892, likes: 67, copies: 23 }
  }
]

// Mock Moderation Queue
export const MOCK_MODERATION_QUEUE = [
  {
    id: "mod_pending_001",
    type: "place",
    targetId: "place_draft_001",
    title: "Chùa Bái Đính - Ninh Bình",
    description: "Quần thể chùa lớn nhất Việt Nam",
    status: "pending",
    priority: "medium",
    submittedBy: "contributor_001",
    submittedAt: "2024-03-15T10:30:00Z",
    category: "văn hóa"
  },
  
  {
    id: "mod_report_001",
    type: "report", 
    targetId: "place_partner_001",
    title: "Báo cáo: Thông tin giờ mở cửa sai",
    description: "Địa điểm này không mở cửa 24/7 như ghi",
    status: "pending",
    priority: "high",
    submittedBy: "traveler_001",
    submittedAt: "2024-03-15T08:15:00Z",
    reportReason: "Thông tin sai lệch"
  },

  {
    id: "mod_approved_001",
    type: "place",
    targetId: "place_contributor_001",
    title: "Đồi chè Mộc Châu", 
    description: "Cảnh quan đồi chè tuyệt đẹp",
    status: "approved",
    priority: "low",
    submittedBy: "contributor_001",
    submittedAt: "2024-03-14T16:45:00Z",
    moderatorNotes: "Thông tin đầy đủ và chính xác. Đã duyệt.",
    reviewedBy: "moderator_001",
    reviewedAt: "2024-03-15T09:20:00Z"
  }
]

// Test Credentials cho từng role
export const TEST_CREDENTIALS = {
  guest: {
    note: "Không cần đăng nhập - truy cập trực tiếp",
    features: ["Xem địa điểm công khai", "Xem lịch trình chia sẻ", "AI demo", "Tìm kiếm cơ bản"]
  },
  
  traveler: {
    email: "traveler@example.com",
    password: "password123", 
    features: [
      "Tạo & quản lý lịch trình cá nhân",
      "Lưu địa điểm yêu thích", 
      "Đề xuất địa điểm mới",
      "Báo cáo vi phạm",
      "AI trợ lý đầy đủ"
    ]
  },

  contributor: {
    email: "contributor@example.com", 
    password: "password123",
    features: [
      "Tất cả tính năng Traveler",
      "Tạo địa điểm mới (form 3 bước)",
      "Quản lý bản nháp",
      "Theo dõi trạng thái duyệt",
      "Huy hiệu Verified Contributor"
    ]
  },

  partner: {
    email: "partner@danang.gov.vn",
    password: "password123", 
    features: [
      "Tất cả tính năng Contributor",
      "Gắn nhãn Partner",
      "Luồng duyệt nhanh",
      "Hồ sơ đối tác chính thức",
      "Quyền ưu tiên hiển thị"
    ]
  },

  moderator: {
    email: "moderator@dulichviet.com",
    password: "password123",
    features: [
      "Tất cả tính năng Contributor", 
      "Truy cập Moderation Dashboard",
      "Duyệt/từ chối nội dung",
      "Xử lý báo cáo vi phạm", 
      "Diff Viewer",
      "Quản lý hàng đợi duyệt"
    ]
  },

  admin: {
    email: "admin@dulichviet.com",
    password: "password123",
    features: [
      "Tất cả tính năng Moderator",
      "Quản lý phân quyền người dùng",
      "Gán nhãn Verified",
      "Xem analytics & SLA",
      "Gỡ khẩn cấp nội dung",
      "Cài đặt hệ thống"
    ]
  }
}

// Helper function để switch user role trong development
export function switchToRole(role: keyof typeof TEST_CREDENTIALS): MockUser | null {
  if (role === 'guest') return null
  
  return MOCK_USERS.find(user => user.role === role) || null
}

// Role permissions mapping
export const ROLE_PERMISSIONS = {
  guest: [],
  traveler: ["create_itinerary", "save_places", "report_content"],
  contributor: ["create_place", "create_itinerary", "save_places", "report_content", "manage_drafts"],
  partner: ["create_place_priority", "create_itinerary", "save_places", "report_content", "partner_badge", "fast_review"],
  moderator: ["review_content", "approve_content", "reject_content", "hide_content", "handle_reports", "view_moderation_queue"],
  admin: ["all_permissions"]
} as const

// Function to check if user has permission
export function hasPermission(user: MockUser | null, permission: string): boolean {
  if (!user) return false
  if (user.role === 'admin') return true
  
  const rolePermissions = ROLE_PERMISSIONS[user.role] || []
  return rolePermissions.includes(permission as any)
}











