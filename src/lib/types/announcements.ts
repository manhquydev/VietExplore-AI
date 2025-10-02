/**
 * Community Announcements System
 * Data types and schemas for announcement management
 */

// Announcement Types
export type AnnouncementType =
  | 'announcement'  // General announcements
  | 'feature'       // New feature releases
  | 'guide'         // Guides and tutorials
  | 'community'     // Community updates
  | 'maintenance'   // System maintenance
  | 'event';        // Special events

// Announcement Status
export type AnnouncementStatus =
  | 'draft'         // Not published yet
  | 'scheduled'     // Scheduled for future publish
  | 'published'     // Live and visible to public
  | 'archived';     // Archived, no longer visible

// Priority Levels
export type AnnouncementPriority =
  | 'low'           // Normal announcement
  | 'medium'        // Important announcement
  | 'high'          // Critical announcement
  | 'urgent';       // Urgent system-wide alert

// Main Announcement Interface
export interface Announcement {
  id?: string;

  // Content
  title: string;
  slug: string;                    // URL-friendly identifier
  content: string;                 // Rich HTML content from Tiptap
  excerpt?: string;                // Short summary (auto-generated or manual)

  // Metadata
  type: AnnouncementType;
  status: AnnouncementStatus;
  priority: AnnouncementPriority;
  tags?: string[];                 // Optional tags for categorization

  // Featured Image
  featuredImage?: {
    url: string;
    alt: string;
    width?: number;
    height?: number;
  };

  // Author Information
  authorId: string;
  authorName: string;
  authorRole: string;

  // Publishing
  publishedAt?: string;            // ISO timestamp
  scheduledFor?: string;           // ISO timestamp for scheduled publish
  expiresAt?: string;              // Optional expiration date

  // Engagement
  viewCount: number;
  isPinned: boolean;               // Pin to top of list
  isFeatured: boolean;             // Featured on homepage

  // SEO
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
  };

  // Targeting (future enhancement)
  targetAudience?: {
    roles?: string[];              // Target specific user roles
    regions?: string[];            // Target specific regions
  };

  // Timestamps
  createdAt: string;
  updatedAt: string;

  // Version Control (optional)
  version?: number;
  lastEditedBy?: string;
  lastEditedAt?: string;
}

// Create Announcement Input (for forms)
export interface CreateAnnouncementInput {
  title: string;
  content: string;
  excerpt?: string;
  type: AnnouncementType;
  status?: AnnouncementStatus; // Optional status override
  priority: AnnouncementPriority;
  tags?: string[];
  featuredImage?: {
    url: string;
    alt: string;
  };
  scheduledFor?: string;
  expiresAt?: string;
  isPinned?: boolean;
  isFeatured?: boolean;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
  };
  targetAudience?: {
    roles?: string[];
    regions?: string[];
  };
}

// Update Announcement Input
export interface UpdateAnnouncementInput extends Partial<CreateAnnouncementInput> {
  id: string;
  status?: AnnouncementStatus;
}

// Announcement Filters (for listing/search)
export interface AnnouncementFilters {
  type?: AnnouncementType;
  status?: AnnouncementStatus;
  priority?: AnnouncementPriority;
  authorId?: string;
  tags?: string[];
  isPinned?: boolean;
  isFeatured?: boolean;
  search?: string;                 // Search in title/content
  dateFrom?: string;
  dateTo?: string;
}

// Announcement Statistics
export interface AnnouncementStats {
  total: number;
  byStatus: Record<AnnouncementStatus, number>;
  byType: Record<AnnouncementType, number>;
  totalViews: number;
  avgViewsPerAnnouncement: number;
  pinnedCount: number;
  featuredCount: number;
  scheduledCount: number;
}

// UI Type Configurations
export interface AnnouncementTypeConfig {
  label: string;
  icon: string;
  color: string;
  badgeVariant: 'default' | 'secondary' | 'success' | 'warning' | 'danger' | 'outline';
  description: string;
}

export const ANNOUNCEMENT_TYPE_CONFIG: Record<AnnouncementType, AnnouncementTypeConfig> = {
  announcement: {
    label: 'Thông báo',
    icon: 'megaphone',
    color: 'blue',
    badgeVariant: 'default',
    description: 'Thông báo chung từ hệ thống'
  },
  feature: {
    label: 'Tính năng mới',
    icon: 'sparkles',
    color: 'green',
    badgeVariant: 'success',
    description: 'Giới thiệu tính năng và cập nhật mới'
  },
  guide: {
    label: 'Hướng dẫn',
    icon: 'book-open',
    color: 'amber',
    badgeVariant: 'warning',
    description: 'Hướng dẫn sử dụng và tips'
  },
  community: {
    label: 'Cộng đồng',
    icon: 'users',
    color: 'purple',
    badgeVariant: 'secondary',
    description: 'Tin tức và sự kiện cộng đồng'
  },
  maintenance: {
    label: 'Bảo trì',
    icon: 'wrench',
    color: 'orange',
    badgeVariant: 'warning',
    description: 'Thông báo bảo trì hệ thống'
  },
  event: {
    label: 'Sự kiện',
    icon: 'calendar',
    color: 'pink',
    badgeVariant: 'secondary',
    description: 'Sự kiện đặc biệt'
  }
};

// Priority Configurations
export interface AnnouncementPriorityConfig {
  label: string;
  icon: string;
  color: string;
  description: string;
}

export const ANNOUNCEMENT_PRIORITY_CONFIG: Record<AnnouncementPriority, AnnouncementPriorityConfig> = {
  low: {
    label: 'Thấp',
    icon: 'info',
    color: 'gray',
    description: 'Thông tin bổ sung, không cấp thiết'
  },
  medium: {
    label: 'Trung bình',
    icon: 'alert-circle',
    color: 'blue',
    description: 'Thông tin quan trọng, nên đọc'
  },
  high: {
    label: 'Cao',
    icon: 'alert-triangle',
    color: 'orange',
    description: 'Thông tin rất quan trọng, cần chú ý'
  },
  urgent: {
    label: 'Khẩn cấp',
    icon: 'alert-octagon',
    color: 'red',
    description: 'Cảnh báo khẩn cấp, yêu cầu hành động ngay'
  }
};

// Helper Functions

/**
 * Generate URL-friendly slug from title
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens
    .replace(/^-|-$/g, '') // Trim hyphens
    .substring(0, 100); // Limit length
}

/**
 * Generate excerpt from HTML content
 */
export function generateExcerpt(htmlContent: string, maxLength: number = 200): string {
  // Strip HTML tags
  const text = htmlContent.replace(/<[^>]*>/g, '');
  // Truncate and add ellipsis
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
}

/**
 * Check if announcement is active/visible
 */
export function isAnnouncementActive(announcement: Announcement): boolean {
  if (announcement.status !== 'published') return false;

  const now = new Date();

  // Check if published
  if (announcement.publishedAt && new Date(announcement.publishedAt) > now) {
    return false;
  }

  // Check if expired
  if (announcement.expiresAt && new Date(announcement.expiresAt) < now) {
    return false;
  }

  return true;
}

/**
 * Check if announcement should be auto-published
 */
export function shouldAutoPublish(announcement: Announcement): boolean {
  if (announcement.status !== 'scheduled') return false;
  if (!announcement.scheduledFor) return false;

  return new Date(announcement.scheduledFor) <= new Date();
}

/**
 * Validate announcement data
 */
export function validateAnnouncement(data: Partial<Announcement>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.title || data.title.trim().length === 0) {
    errors.push('Title is required');
  }

  if (!data.content || data.content.trim().length === 0) {
    errors.push('Content is required');
  }

  if (data.title && data.title.length > 200) {
    errors.push('Title must be less than 200 characters');
  }

  if (data.scheduledFor && new Date(data.scheduledFor) < new Date()) {
    errors.push('Scheduled date must be in the future');
  }

  if (data.expiresAt && data.publishedAt && new Date(data.expiresAt) <= new Date(data.publishedAt)) {
    errors.push('Expiration date must be after publish date');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

// Default values for new announcements
export const DEFAULT_ANNOUNCEMENT: Partial<Announcement> = {
  type: 'announcement',
  status: 'draft',
  priority: 'medium',
  viewCount: 0,
  isPinned: false,
  isFeatured: false,
  tags: [],
  version: 1
};
