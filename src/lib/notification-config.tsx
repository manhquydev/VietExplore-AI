/**
 * Centralized Notification Configuration
 * Professional icon mapping using Lucide icons instead of emojis
 */

import * as React from "react";
import {
  // Place Moderation
  Inbox,
  Eye,
  CheckCircle,
  XCircle,
  Edit,
  RotateCcw,
  FileEdit,
  // System & Infrastructure
  AlertTriangle,
  Server,
  Shield,
  Zap,
  Database,
  HardDrive,
  Wifi,
  Lock,
  Key,
  Wrench,
  // User Interactions
  Heart,
  Bookmark,
  Star,
  MessageCircle,
  Trophy,
  Sparkles,
  TrendingUp,
  // Admin & Moderation
  ShieldAlert,
  Users,
  Activity,
  Clock,
  Bell,
  Archive,
  // General
  Mail,
  Info,
  type LucideIcon
} from "lucide-react";

export type NotificationCategory = 'place' | 'system' | 'user' | 'admin' | 'general';

export interface NotificationIconConfig {
  icon: LucideIcon;
  category: NotificationCategory;
  colorClass: string;
  bgClass: string;
}

/**
 * Professional icon mapping with semantic categories and colors
 */
export const notificationIconMap: Record<string, NotificationIconConfig> = {
  // ============================================================================
  // PLACE MODERATION (Green/Emerald Theme)
  // ============================================================================
  place_received: {
    icon: Inbox,
    category: 'place',
    colorClass: 'text-emerald-600',
    bgClass: 'bg-emerald-50'
  },
  place_claimed: {
    icon: Eye,
    category: 'place',
    colorClass: 'text-blue-600',
    bgClass: 'bg-blue-50'
  },
  place_in_review: {
    icon: Eye,
    category: 'place',
    colorClass: 'text-indigo-600',
    bgClass: 'bg-indigo-50'
  },
  place_approved: {
    icon: CheckCircle,
    category: 'place',
    colorClass: 'text-green-600',
    bgClass: 'bg-green-50'
  },
  place_rejected: {
    icon: XCircle,
    category: 'place',
    colorClass: 'text-red-600',
    bgClass: 'bg-red-50'
  },
  place_needs_edit: {
    icon: Edit,
    category: 'place',
    colorClass: 'text-amber-600',
    bgClass: 'bg-amber-50'
  },
  revision_requested: {
    icon: RotateCcw,
    category: 'place',
    colorClass: 'text-orange-600',
    bgClass: 'bg-orange-50'
  },
  edit_approved: {
    icon: CheckCircle,
    category: 'place',
    colorClass: 'text-green-600',
    bgClass: 'bg-green-50'
  },
  edit_rejected: {
    icon: XCircle,
    category: 'place',
    colorClass: 'text-red-600',
    bgClass: 'bg-red-50'
  },
  edit_request_approved: {
    icon: FileEdit,
    category: 'place',
    colorClass: 'text-green-600',
    bgClass: 'bg-green-50'
  },
  edit_request_rejected: {
    icon: FileEdit,
    category: 'place',
    colorClass: 'text-red-600',
    bgClass: 'bg-red-50'
  },

  // ============================================================================
  // USER INTERACTIONS (Gold/Yellow Theme)
  // ============================================================================
  place_liked: {
    icon: Heart,
    category: 'user',
    colorClass: 'text-rose-600',
    bgClass: 'bg-rose-50'
  },
  place_saved: {
    icon: Bookmark,
    category: 'user',
    colorClass: 'text-amber-600',
    bgClass: 'bg-amber-50'
  },
  place_review_posted: {
    icon: Star,
    category: 'user',
    colorClass: 'text-yellow-600',
    bgClass: 'bg-yellow-50'
  },
  place_comment_reply: {
    icon: MessageCircle,
    category: 'user',
    colorClass: 'text-blue-600',
    bgClass: 'bg-blue-50'
  },
  place_published: {
    icon: Sparkles,
    category: 'user',
    colorClass: 'text-purple-600',
    bgClass: 'bg-purple-50'
  },
  place_featured: {
    icon: Star,
    category: 'user',
    colorClass: 'text-amber-600',
    bgClass: 'bg-amber-50'
  },
  place_milestone: {
    icon: Trophy,
    category: 'user',
    colorClass: 'text-yellow-600',
    bgClass: 'bg-yellow-50'
  },

  // ============================================================================
  // ADMIN/MODERATOR WORKFLOW (Purple Theme)
  // ============================================================================
  new_moderation_item: {
    icon: Bell,
    category: 'admin',
    colorClass: 'text-purple-600',
    bgClass: 'bg-purple-50'
  },
  moderation_claimed: {
    icon: Users,
    category: 'admin',
    colorClass: 'text-indigo-600',
    bgClass: 'bg-indigo-50'
  },
  moderation_escalated: {
    icon: ShieldAlert,
    category: 'admin',
    colorClass: 'text-red-600',
    bgClass: 'bg-red-50'
  },
  reports_threshold_reached: {
    icon: AlertTriangle,
    category: 'admin',
    colorClass: 'text-orange-600',
    bgClass: 'bg-orange-50'
  },
  moderation_handoff_received: {
    icon: Users,
    category: 'admin',
    colorClass: 'text-blue-600',
    bgClass: 'bg-blue-50'
  },
  moderation_sla_warning: {
    icon: Clock,
    category: 'admin',
    colorClass: 'text-amber-600',
    bgClass: 'bg-amber-50'
  },
  moderation_queue_stuck: {
    icon: AlertTriangle,
    category: 'admin',
    colorClass: 'text-red-600',
    bgClass: 'bg-red-50'
  },
  moderation_queue_overload: {
    icon: Activity,
    category: 'admin',
    colorClass: 'text-orange-600',
    bgClass: 'bg-orange-50'
  },
  content_pattern_detected: {
    icon: Eye,
    category: 'admin',
    colorClass: 'text-purple-600',
    bgClass: 'bg-purple-50'
  },

  // ============================================================================
  // SYSTEM & INFRASTRUCTURE (Blue/Cyan Theme)
  // ============================================================================
  system_maintenance: {
    icon: Wrench,
    category: 'system',
    colorClass: 'text-blue-600',
    bgClass: 'bg-blue-50'
  },
  security_alert: {
    icon: ShieldAlert,
    category: 'system',
    colorClass: 'text-red-600',
    bgClass: 'bg-red-50'
  },
  feature_update: {
    icon: Sparkles,
    category: 'system',
    colorClass: 'text-cyan-600',
    bgClass: 'bg-cyan-50'
  },
  weekly_summary: {
    icon: TrendingUp,
    category: 'system',
    colorClass: 'text-indigo-600',
    bgClass: 'bg-indigo-50'
  },
  system_performance_degraded: {
    icon: AlertTriangle,
    category: 'system',
    colorClass: 'text-red-600',
    bgClass: 'bg-red-50'
  },
  database_connection_issues: {
    icon: Database,
    category: 'system',
    colorClass: 'text-red-600',
    bgClass: 'bg-red-50'
  },
  api_rate_limit_exceeded: {
    icon: Zap,
    category: 'system',
    colorClass: 'text-orange-600',
    bgClass: 'bg-orange-50'
  },
  storage_quota_warning: {
    icon: HardDrive,
    category: 'system',
    colorClass: 'text-amber-600',
    bgClass: 'bg-amber-50'
  },
  cdn_failure_detected: {
    icon: Wifi,
    category: 'system',
    colorClass: 'text-red-600',
    bgClass: 'bg-red-50'
  },
  suspicious_login_patterns: {
    icon: ShieldAlert,
    category: 'system',
    colorClass: 'text-orange-600',
    bgClass: 'bg-orange-50'
  },
  multiple_failed_login_attempts: {
    icon: Lock,
    category: 'system',
    colorClass: 'text-red-600',
    bgClass: 'bg-red-50'
  },
  data_export_request: {
    icon: Archive,
    category: 'system',
    colorClass: 'text-blue-600',
    bgClass: 'bg-blue-50'
  },
  gdpr_deletion_request: {
    icon: Shield,
    category: 'system',
    colorClass: 'text-purple-600',
    bgClass: 'bg-purple-50'
  },
  admin_privilege_escalation: {
    icon: Key,
    category: 'system',
    colorClass: 'text-red-600',
    bgClass: 'bg-red-50'
  },
  content_volume_spike: {
    icon: TrendingUp,
    category: 'system',
    colorClass: 'text-green-600',
    bgClass: 'bg-green-50'
  },
  user_registration_anomaly: {
    icon: Users,
    category: 'system',
    colorClass: 'text-orange-600',
    bgClass: 'bg-orange-50'
  },
  spam_detection_threshold: {
    icon: Shield,
    category: 'system',
    colorClass: 'text-red-600',
    bgClass: 'bg-red-50'
  },
  server_memory_critical: {
    icon: Server,
    category: 'system',
    colorClass: 'text-red-600',
    bgClass: 'bg-red-50'
  },
  disk_space_warning: {
    icon: HardDrive,
    category: 'system',
    colorClass: 'text-amber-600',
    bgClass: 'bg-amber-50'
  },
  backup_failure: {
    icon: Database,
    category: 'system',
    colorClass: 'text-red-600',
    bgClass: 'bg-red-50'
  },
  ssl_certificate_expiring: {
    icon: Lock,
    category: 'system',
    colorClass: 'text-amber-600',
    bgClass: 'bg-amber-50'
  },
  third_party_service_down: {
    icon: AlertTriangle,
    category: 'system',
    colorClass: 'text-red-600',
    bgClass: 'bg-red-50'
  }
};

/**
 * Get icon configuration for notification type
 */
export function getNotificationIcon(type: string): NotificationIconConfig {
  return notificationIconMap[type] || {
    icon: Mail,
    category: 'general',
    colorClass: 'text-slate-600',
    bgClass: 'bg-slate-50'
  };
}

/**
 * Category display config
 */
export const categoryConfig = {
  place: {
    label: 'Địa điểm',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50'
  },
  user: {
    label: 'Tương tác',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50'
  },
  admin: {
    label: 'Quản trị',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50'
  },
  system: {
    label: 'Hệ thống',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50'
  },
  general: {
    label: 'Chung',
    color: 'text-slate-600',
    bgColor: 'bg-slate-50'
  }
};

/**
 * Priority config with subtle indicators
 */
export const priorityConfig = {
  high: {
    label: 'Cao',
    dotClass: 'bg-red-500',
    textClass: 'text-red-600',
    bgClass: 'bg-red-50'
  },
  medium: {
    label: 'Trung bình',
    dotClass: 'bg-amber-500',
    textClass: 'text-amber-600',
    bgClass: 'bg-amber-50'
  },
  low: {
    label: 'Thấp',
    dotClass: 'bg-slate-400',
    textClass: 'text-slate-600',
    bgClass: 'bg-slate-50'
  }
};
