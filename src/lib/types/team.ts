/**
 * Team Member Types & Interfaces
 * For managing team/founder profiles in the About page and admin panel
 */

import {
  ShieldCheck,
  LayoutDashboard,
  Cpu,
  Megaphone,
  Workflow,
  UsersRound,
  type LucideIcon
} from "lucide-react";

export type TeamMemberStatus = 'active' | 'inactive';

export type TeamMemberDepartment =
  | 'leadership'
  | 'product'
  | 'engineering'
  | 'marketing'
  | 'operations'
  | 'community';

export interface TeamMemberSocialLinks {
  linkedin?: string;
  twitter?: string;
  facebook?: string;
  github?: string;
  website?: string;
  email?: string;
}

export interface TeamMemberEducation {
  degree: string;
  institution: string;
  year?: string;
  description?: string;
}

export interface TeamMember {
  // Core Identity
  id: string;                         // Auto-generated Firestore doc ID
  slug: string;                       // URL-friendly identifier (e.g., "nguyen-minh-hoang")
  fullName: string;                   // Display name (e.g., "Nguyễn Minh Hoàng")
  title: string;                      // Job title (e.g., "Founder & Product Lead")

  // Visual Assets
  avatar: string;                     // Firebase Storage URL or external URL
  coverImage?: string;                // Header image for profile page (optional)

  // Professional Info
  bio: string;                        // Short description (150-200 chars) for About page
  longBio?: string;                   // Extended biography for individual profile page
  phone?: string;                     // Optional public contact number

  // Social & Contact Links
  socialLinks?: TeamMemberSocialLinks;

  // Achievements & Expertise
  expertise: string[];                // Skills/areas of expertise (e.g., ["Product Strategy", "UX Design"])
  achievements?: string[];            // Notable accomplishments (e.g., ["Founded 3 travel startups"])
  education?: TeamMemberEducation[];  // Educational background

  // Display Control
  status: TeamMemberStatus;           // Whether to show in public pages
  featured: boolean;                  // Highlight on About page hero section
  displayOrder: number;               // Sort order (0-999, lower = appears first)

  // Team Organization
  department?: TeamMemberDepartment;  // Team/department classification
  joinedDate?: string;                // ISO date string when joined the team

  // SEO & Metadata
  metaDescription?: string;           // Custom meta description for /team/[slug] page
  tags?: string[];                    // Keywords for filtering/search

  // System Fields
  createdAt: string;                  // ISO timestamp
  updatedAt: string;                  // ISO timestamp
  createdBy: string;                  // User ID who created this entry
  updatedBy: string;                  // User ID who last updated
}

/**
 * Form data structure for creating/editing team members in admin panel
 */
export interface TeamMemberFormData {
  fullName: string;
  title: string;
  slug: string;
  bio: string;
  longBio?: string;
  avatar: string;
  coverImage?: string;
  phone?: string;
  expertise: string[];
  achievements?: string[];
  education?: TeamMemberEducation[];
  socialLinks?: TeamMemberSocialLinks;
  status: TeamMemberStatus;
  featured: boolean;
  displayOrder: number;
  department?: TeamMemberDepartment;
  joinedDate?: string;
  metaDescription?: string;
  tags?: string[];
}

/**
 * Filter options for querying team members
 */
export interface TeamMemberFilters {
  status?: TeamMemberStatus;
  featured?: boolean;
  department?: TeamMemberDepartment;
  search?: string;                    // Search by name or title
  limit?: number;
  orderBy?: 'displayOrder' | 'createdAt' | 'fullName';
  orderDirection?: 'asc' | 'desc';
}

/**
 * API response structure for team member operations
 */
export interface TeamMemberResponse {
  success: boolean;
  data?: TeamMember;
  error?: string;
  message?: string;
}

export interface TeamMembersListResponse {
  success: boolean;
  data?: TeamMember[];
  total?: number;
  error?: string;
  message?: string;
}

/**
 * Image upload response
 */
export interface TeamAvatarUploadResponse {
  success: boolean;
  imageUrl?: string;
  error?: string;
  message?: string;
}

/**
 * Department configuration for UI display
 */
export const DEPARTMENT_CONFIG: Record<TeamMemberDepartment, {
  label: string;
  color: string;
  initials: string;
  icon: LucideIcon;
  badge: {
    subtle: string;
    solid: string;
  };
}> = {
  leadership: {
    label: 'Ban Lãnh Đạo',
    color: 'from-purple-500 to-pink-500',
    initials: 'LD',
    icon: ShieldCheck,
    badge: {
      subtle: 'bg-purple-50 text-purple-700 border border-purple-200',
      solid: 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-sm border-transparent'
    }
  },
  product: {
    label: 'Sản Phẩm',
    color: 'from-blue-500 to-cyan-500',
    initials: 'SP',
    icon: LayoutDashboard,
    badge: {
      subtle: 'bg-blue-50 text-blue-700 border border-blue-200',
      solid: 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-sm border-transparent'
    }
  },
  engineering: {
    label: 'Kỹ Thuật',
    color: 'from-emerald-500 to-teal-500',
    initials: 'KT',
    icon: Cpu,
    badge: {
      subtle: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
      solid: 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm border-transparent'
    }
  },
  marketing: {
    label: 'Marketing',
    color: 'from-amber-500 to-orange-500',
    initials: 'MK',
    icon: Megaphone,
    badge: {
      subtle: 'bg-amber-50 text-amber-700 border border-amber-200',
      solid: 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-sm border-transparent'
    }
  },
  operations: {
    label: 'Vận Hành',
    color: 'from-slate-500 to-gray-500',
    initials: 'VH',
    icon: Workflow,
    badge: {
      subtle: 'bg-slate-50 text-slate-700 border border-slate-200',
      solid: 'bg-gradient-to-r from-slate-600 to-gray-600 text-white shadow-sm border-transparent'
    }
  },
  community: {
    label: 'Cộng Đồng',
    color: 'from-rose-500 to-pink-500',
    initials: 'CD',
    icon: UsersRound,
    badge: {
      subtle: 'bg-rose-50 text-rose-700 border border-rose-200',
      solid: 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-sm border-transparent'
    }
  }
};

/**
 * Helper function to generate slug from full name
 */
export function generateSlugFromName(fullName: string): string {
  return fullName
    .toLowerCase()
    .normalize('NFD')                           // Decompose Vietnamese characters
    .replace(/[\u0300-\u036f]/g, '')            // Remove diacritics
    .replace(/đ/g, 'd')                         // Replace đ with d
    .replace(/[^a-z0-9\s-]/g, '')               // Remove special characters
    .trim()
    .replace(/\s+/g, '-')                       // Replace spaces with hyphens
    .replace(/-+/g, '-');                       // Remove consecutive hyphens
}

/**
 * Helper function to validate team member form data
 */
export function validateTeamMemberForm(data: Partial<TeamMemberFormData>): {
  valid: boolean;
  errors: Record<string, string>;
} {
  const errors: Record<string, string> = {};

  if (!data.fullName?.trim()) {
    errors.fullName = 'Tên đầy đủ là bắt buộc';
  }

  if (!data.title?.trim()) {
    errors.title = 'Chức vụ là bắt buộc';
  }

  if (!data.slug?.trim()) {
    errors.slug = 'Slug là bắt buộc';
  } else if (!/^[a-z0-9-]+$/.test(data.slug)) {
    errors.slug = 'Slug chỉ được chứa chữ thường, số và dấu gạch ngang';
  }

  if (!data.bio?.trim()) {
    errors.bio = 'Mô tả ngắn là bắt buộc';
  } else if (data.bio.length > 250) {
    errors.bio = 'Mô tả ngắn không được quá 250 ký tự';
  }

  if (!data.avatar?.trim()) {
    errors.avatar = 'Ảnh đại diện là bắt buộc';
  }

  if (data.expertise && data.expertise.length === 0) {
    errors.expertise = 'Vui lòng thêm ít nhất một lĩnh vực chuyên môn';
  }

  if (typeof data.displayOrder !== 'number' || data.displayOrder < 0) {
    errors.displayOrder = 'Thứ tự hiển thị phải là số không âm';
  }

  // Validate social links format
  if (data.socialLinks) {
    const urlRegex = /^https?:\/\/.+/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (data.socialLinks.linkedin && !urlRegex.test(data.socialLinks.linkedin)) {
      errors['socialLinks.linkedin'] = 'LinkedIn URL không hợp lệ';
    }
    if (data.socialLinks.twitter && !urlRegex.test(data.socialLinks.twitter)) {
      errors['socialLinks.twitter'] = 'Twitter URL không hợp lệ';
    }
    if (data.socialLinks.facebook && !urlRegex.test(data.socialLinks.facebook)) {
      errors['socialLinks.facebook'] = 'Facebook URL không hợp lệ';
    }
    if (data.socialLinks.github && !urlRegex.test(data.socialLinks.github)) {
      errors['socialLinks.github'] = 'GitHub URL không hợp lệ';
    }
    if (data.socialLinks.website && !urlRegex.test(data.socialLinks.website)) {
      errors['socialLinks.website'] = 'Website URL không hợp lệ';
    }
    if (data.socialLinks.email && !emailRegex.test(data.socialLinks.email)) {
      errors['socialLinks.email'] = 'Email không hợp lệ';
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}
