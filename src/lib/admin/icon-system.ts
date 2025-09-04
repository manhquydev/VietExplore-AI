/**
 * VietExplore AI - Admin Icon System
 * Minimal, professional icon strategy to reduce visual noise
 * Each icon serves a specific functional purpose
 */

import { 
  // Core Navigation
  LayoutDashboard,
  Users, 
  FileCheck,
  BarChart3,
  Settings,
  
  // Primary Actions
  Eye,
  Edit,
  Trash2 as Trash,
  Plus,
  Save,
  
  // Secondary Actions
  Search,
  Filter,
  RefreshCw,
  Download,
  Upload,
  
  // Status Indicators (ESSENTIAL ONLY)
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  
  // System Icons
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  
  // Data Icons
  MapPin,
  Calendar,
  Mail,
  ExternalLink,
  
  // Feedback
  Bell,
  Info,
  
  type LucideIcon
} from 'lucide-react'

// === PROFESSIONAL ADMIN ICON SET ===

export const adminIcons = {
  // === PRIMARY NAVIGATION (5 max) ===
  navigation: {
    dashboard: LayoutDashboard,
    users: Users,
    moderation: FileCheck, 
    analytics: BarChart3,
    settings: Settings,
  },

  // === CORE ACTIONS (Essential only) ===
  actions: {
    view: Eye,
    edit: Edit,
    delete: Trash,
    add: Plus,
    save: Save,
    close: X,
  },

  // === UTILITY ACTIONS ===
  utility: {
    search: Search,
    filter: Filter,
    refresh: RefreshCw,
    download: Download,
    upload: Upload,
  },

  // === STATUS INDICATORS (4 states only) ===
  status: {
    success: CheckCircle,
    error: XCircle, 
    pending: Clock,
    warning: AlertTriangle,
  },

  // === SYSTEM NAVIGATION ===
  system: {
    menu: Menu,
    close: X,
    previous: ChevronLeft,
    next: ChevronRight,
    expand: ChevronDown,
    collapse: ChevronUp,
    refresh: RefreshCw,
  },

  // === CONTENT TYPES ===
  content: {
    location: MapPin,
    date: Calendar,
    email: Mail,
    external: ExternalLink,
  },

  // === NOTIFICATIONS ===
  feedback: {
    notification: Bell,
    info: Info,
  }
} as const

// === ICON SIZES ===
export const iconSizes = {
  xs: 'h-3 w-3',      // 12px - Badges, micro indicators
  sm: 'h-4 w-4',      // 16px - Default buttons, table cells
  base: 'h-5 w-5',    // 20px - Navigation, headers
  lg: 'h-6 w-6',      // 24px - Page headers, primary buttons
  xl: 'h-8 w-8',      // 32px - Hero elements, avatars
} as const

// === ICON COMPONENT WRAPPER ===
export interface AdminIconProps {
  icon: LucideIcon
  size?: keyof typeof iconSizes
  className?: string
  'aria-label'?: string
}

// Helper function instead of React component (since this is a utility file)
export const createAdminIcon = (
  Icon: LucideIcon, 
  size: keyof typeof iconSizes = 'sm', 
  className = ''
) => {
  return {
    component: Icon,
    className: `${iconSizes[size]} ${className}`,
  }
}

// === ICON USAGE GUIDELINES ===

export const iconGuidelines = {
  // Navigation: Use only essential top-level functions
  navigation: {
    maxItems: 5,
    purpose: 'Primary app navigation only',
    example: 'Dashboard, Users, Content, Analytics, Settings'
  },

  // Actions: Limit to CRUD operations + view
  actions: {
    maxPerContext: 5,
    purpose: 'Direct user actions on content',
    example: 'View, Edit, Delete, Create, Save'
  },

  // Status: Only 4 semantic states
  status: {
    states: ['success', 'error', 'pending', 'warning'],
    purpose: 'Communicate system state, not decoration',
    example: 'Processing status, validation results'
  },

  // Prohibited: Decorative or redundant icons
  prohibited: [
    'Multiple similar icons (e.g., different star variants)',
    'Decorative graphics that don\'t communicate function',
    'Icons that duplicate text labels unnecessarily',
    'Overly specific icons (use generic when possible)'
  ],

  // Context Rules
  contextRules: [
    'Never use more than 1 icon per button unless absolutely necessary',
    'Prefer text labels over icons for complex actions', 
    'Icons should be consistent across similar contexts',
    'Use icons to save space, not for decoration'
  ]
} as const

// === ICON CLEANUP UTILITIES ===

/**
 * Get appropriate icon for common admin contexts
 */
export const getContextIcon = (context: string): LucideIcon | null => {
  const contextMap: Record<string, LucideIcon> = {
    // Navigation contexts
    'overview': adminIcons.navigation.dashboard,
    'user-management': adminIcons.navigation.users,
    'content-moderation': adminIcons.navigation.moderation,
    'reports': adminIcons.navigation.analytics,
    'configuration': adminIcons.navigation.settings,
    
    // Action contexts  
    'view-details': adminIcons.actions.view,
    'edit-item': adminIcons.actions.edit,
    'remove-item': adminIcons.actions.delete,
    'create-new': adminIcons.actions.add,
    'save-changes': adminIcons.actions.save,
    
    // Status contexts
    'approved': adminIcons.status.success,
    'rejected': adminIcons.status.error,
    'processing': adminIcons.status.pending,
    'needs-attention': adminIcons.status.warning,
  }
  
  return contextMap[context] || null
}

/**
 * Validate icon usage in component
 */
export const validateIconUsage = (icons: LucideIcon[], context: string): string[] => {
  const warnings: string[] = []
  
  // Check icon count per context
  if (context === 'navigation' && icons.length > 5) {
    warnings.push(`Navigation has ${icons.length} icons. Consider reducing to 5 or fewer.`)
  }
  
  if (context === 'actions' && icons.length > 5) {
    warnings.push(`Action set has ${icons.length} icons. Consider grouping or reducing.`)
  }
  
  return warnings
}

// === TYPE EXPORTS ===
export type AdminIconName = keyof typeof adminIcons
export type AdminIconSize = keyof typeof iconSizes
export type IconContext = 'navigation' | 'actions' | 'status' | 'utility' | 'system' | 'content' | 'feedback'

// === MIGRATION HELPER ===
export const iconMigrationMap = {
  // Old icons → New admin icons (for gradual migration)
  'Shield': adminIcons.navigation.settings,
  'Activity': adminIcons.navigation.analytics,
  'UserCheck': adminIcons.navigation.users,
  'Play': adminIcons.actions.view,
  'Pencil': adminIcons.actions.edit,
  'Trash': adminIcons.actions.delete,
  'TrendingUp': adminIcons.status.success,
  'TrendingDown': adminIcons.status.error,
  'HelpCircle': adminIcons.feedback.info,
} as const