/**
 * User Notification Preferences System
 * Phase 1: User interaction notifications and preference management
 */

export interface NotificationPreferences {
  id?: string;
  userId: string;
  
  // Channel preferences
  channels: {
    inApp: boolean;           // In-app notifications
    push: boolean;            // Browser push notifications  
    email: boolean;           // Email notifications
    sms: boolean;             // SMS notifications (future)
  };
  
  // Frequency settings
  frequency: 'realtime' | 'hourly' | 'daily' | 'weekly';
  
  // Category preferences
  categories: {
    // Place-related notifications
    places: {
      enabled: boolean;
      types: {
        approved: boolean;      // When place is approved
        rejected: boolean;      // When place is rejected  
        published: boolean;     // When place is published
        featured: boolean;      // When place gets featured
        milestone: boolean;     // View/like milestones
      };
    };
    
    // Interaction notifications
    interactions: {
      enabled: boolean;
      types: {
        liked: boolean;         // Someone likes your place
        saved: boolean;         // Someone saves your place
        reviewed: boolean;      // Someone reviews your place
        commented: boolean;     // Someone replies to your comment
      };
    };
    
    // System notifications
    system: {
      enabled: boolean;
      types: {
        maintenance: boolean;   // System maintenance alerts
        security: boolean;      // Security alerts
        features: boolean;      // New feature announcements
        weekly: boolean;        // Weekly summary digest
      };
    };
    
    // Moderation notifications (for moderators/admins)
    moderation?: {
      enabled: boolean;
      types: {
        newItems: boolean;      // New moderation items
        escalated: boolean;     // Escalated items
        slaWarning: boolean;    // SLA warnings
        queueOverload: boolean; // Queue overload alerts
      };
    };
  };
  
  // Quiet hours
  quietHours: {
    enabled: boolean;
    start: string;              // "22:00"
    end: string;                // "08:00"
    timezone: string;           // "Asia/Ho_Chi_Minh"
  };
  
  // Digest settings
  digest: {
    enabled: boolean;
    frequency: 'daily' | 'weekly';
    time: string;               // "09:00"
    includedTypes: string[];    // Which notification types to include
  };
  
  // Advanced settings
  advanced: {
    batchSimilar: boolean;      // Batch similar notifications
    smartTiming: boolean;       // Use AI for optimal delivery timing
    limitFrequency: boolean;    // Respect frequency limits per category
    priorityFiltering: boolean; // Only high priority during busy times
  };
  
  createdAt: string;
  updatedAt: string;
}

export interface NotificationDigest {
  id?: string;
  userId: string;
  period: 'daily' | 'weekly';
  startDate: string;
  endDate: string;
  
  summary: {
    totalNotifications: number;
    unreadCount: number;
    topCategories: {
      category: string;
      count: number;
    }[];
  };
  
  notifications: {
    category: string;
    type: string;
    count: number;
    lastExample: {
      title: string;
      message: string;
      createdAt: string;
    };
  }[];
  
  createdAt: string;
  sent: boolean;
  sentAt?: string;
}

export interface NotificationBatch {
  id?: string;
  userId: string;
  batchType: 'similar' | 'category' | 'time_based';
  
  notifications: {
    id: string;
    type: string;
    title: string;
    message: string;
    data: Record<string, any>;
    createdAt: string;
  }[];
  
  combinedTitle: string;
  combinedMessage: string;
  priority: 'low' | 'medium' | 'high';
  
  scheduledFor: string;
  createdAt: string;
  processed: boolean;
  processedAt?: string;
}

export interface NotificationTemplate {
  id: string;
  type: string;
  title: string;
  message: string;
  variables: string[];          // Variables that can be replaced
  priority: 'low' | 'medium' | 'high';
  category: string;
  
  // A/B testing
  variants?: {
    id: string;
    title: string;
    message: string;
    weight: number;             // 0-100, used for A/B testing
  }[];
  
  // Personalization rules
  personalization?: {
    timeOfDay?: {
      morning: string;          // Alternative message for morning
      afternoon: string;        // Alternative message for afternoon  
      evening: string;          // Alternative message for evening
    };
    userSegment?: {
      newUser: string;          // Alternative for new users
      activeUser: string;       // Alternative for active users
      vip: string;              // Alternative for VIP users
    };
  };
  
  createdAt: string;
  updatedAt: string;
  active: boolean;
}

// Default preferences for new users
export const DEFAULT_NOTIFICATION_PREFERENCES: Omit<NotificationPreferences, 'id' | 'userId' | 'createdAt' | 'updatedAt'> = {
  channels: {
    inApp: true,
    push: true,
    email: true,
    sms: false
  },
  frequency: 'realtime',
  categories: {
    places: {
      enabled: true,
      types: {
        approved: true,
        rejected: true,
        published: true,
        featured: true,
        milestone: true
      }
    },
    interactions: {
      enabled: true,
      types: {
        liked: true,
        saved: true,
        reviewed: true,
        commented: true
      }
    },
    system: {
      enabled: true,
      types: {
        maintenance: true,
        security: true,
        features: true,
        weekly: false
      }
    }
  },
  quietHours: {
    enabled: false,
    start: "22:00",
    end: "08:00",
    timezone: "Asia/Ho_Chi_Minh"
  },
  digest: {
    enabled: false,
    frequency: 'daily',
    time: "09:00",
    includedTypes: ['place_liked', 'place_saved', 'place_review_posted']
  },
  advanced: {
    batchSimilar: true,
    smartTiming: false,
    limitFrequency: true,
    priorityFiltering: false
  }
};

// Helper types
export type NotificationChannel = keyof NotificationPreferences['channels'];
export type NotificationFrequency = NotificationPreferences['frequency'];
export type NotificationCategory = keyof NotificationPreferences['categories'];