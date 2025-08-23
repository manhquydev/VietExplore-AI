// functions/src/admin/analytics.ts - Admin Analytics Functions
import * as admin from 'firebase-admin';
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import { requireAdminRole, requireEmailVerified } from '../middleware/rbac';

// Get dashboard statistics for admin
export const getDashboardStats = onCall({
  region: 'asia-southeast1'
}, async (req) => {
  try {
    requireEmailVerified(req.auth);
    requireAdminRole(req.auth);

    const db = admin.firestore();
    
    // Get users count by role
    const usersSnapshot = await db.collection('users').get();
    const usersByRole: { [key: string]: number } = {};
    let totalUsers = 0;
    
    usersSnapshot.docs.forEach(doc => {
      const userData = doc.data();
      const role = userData.role || 'traveler';
      usersByRole[role] = (usersByRole[role] || 0) + 1;
      totalUsers++;
    });

    // Get pending reviews count
    const pendingReviewsSnapshot = await db.collection('moderation_queue')
      .where('status', '==', 'pending')
      .get();
    const pendingReviews = pendingReviewsSnapshot.size;

    // Get content reports count
    const reportsSnapshot = await db.collection('reports')
      .where('status', '==', 'open')
      .get();
    const contentReports = reportsSnapshot.size;

    // Get system alerts count (from recent error logs)
    const systemAlertsSnapshot = await db.collection('system_logs')
      .where('level', '==', 'error')
      .where('timestamp', '>=', new Date(Date.now() - 24 * 60 * 60 * 1000)) // Last 24 hours
      .get();
    const systemAlerts = systemAlertsSnapshot.size;

    return {
      totalUsers,
      pendingReviews,
      contentReports,
      systemAlerts,
      usersByRole
    };
  } catch (error) {
    logger.error('Error getting dashboard stats:', error);
    throw new HttpsError('internal', 'Lỗi khi lấy thống kê dashboard');
  }
});

// Get recent activities for admin dashboard
export const getRecentActivities = onCall({
  region: 'asia-southeast1'
}, async (req) => {
  try {
    requireEmailVerified(req.auth);
    requireAdminRole(req.auth);

    const { limit = 10 } = req.data;
    const db = admin.firestore();
    
    // Get recent audit logs
    const activitiesSnapshot = await db.collection('audit_logs')
      .orderBy('timestamp', 'desc')
      .limit(limit)
      .get();

    const activities = activitiesSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        type: data.type,
        description: data.description || getDescriptionFromType(data.type, data),
        timestamp: data.timestamp?.toDate?.()?.toISOString() || new Date().toISOString(),
        severity: getSeverityFromType(data.type),
        userId: data.userId,
        targetId: data.targetId
      };
    });

    return { activities };
  } catch (error) {
    logger.error('Error getting recent activities:', error);
    throw new HttpsError('internal', 'Lỗi khi lấy hoạt động gần đây');
  }
});

// Helper function to generate description from activity type
function getDescriptionFromType(type: string, data: any): string {
  switch (type) {
    case 'user_registered':
      return `Người dùng mới đăng ký: ${data.email || 'Unknown'}`;
    case 'user_role_updated':
      return `Người dùng được cập nhật vai trò: ${data.oldRole} → ${data.newRole}`;
    case 'content_submitted':
      return `Nội dung mới được gửi: ${data.title || 'Địa điểm mới'}`;
    case 'content_approved':
      return `Nội dung được phê duyệt: ${data.title || 'Địa điểm'}`;
    case 'content_rejected':
      return `Nội dung bị từ chối: ${data.title || 'Địa điểm'}`;
    case 'content_reported':
      return `Báo cáo vi phạm: ${data.reason || 'Nội dung không phù hợp'}`;
    case 'user_status_change':
      return `Tài khoản được ${data.action}: ${data.email || 'User'}`;
    case 'system_error':
      return `Lỗi hệ thống: ${data.error || 'Lỗi không xác định'}`;
    case 'moderation_action':
      return `Hành động kiểm duyệt: ${data.action} bởi ${data.moderatorEmail}`;
    default:
      return `Hoạt động: ${type}`;
  }
}

// Helper function to get severity from activity type
function getSeverityFromType(type: string): 'info' | 'success' | 'warning' | 'error' {
  switch (type) {
    case 'user_registered':
    case 'content_submitted':
      return 'info';
    case 'content_approved':
    case 'user_role_updated':
      return 'success';
    case 'content_reported':
    case 'user_status_change':
      return 'warning';
    case 'system_error':
    case 'content_rejected':
      return 'error';
    default:
      return 'info';
  }
}

// Get platform analytics for admin
export const getPlatformAnalytics = onCall({
  region: 'asia-southeast1'
}, async (req) => {
  try {
    requireEmailVerified(req.auth);
    requireAdminRole(req.auth);

    const db = admin.firestore();
    
    // Get places statistics
    const placesSnapshot = await db.collection('places').get();
    let publishedPlaces = 0;
    let pendingPlaces = 0;
    let hiddenPlaces = 0;
    const trustBadgeStats = {
      verified: 0,
      partner: 0,
      contributor: 0,
      community: 0
    };

    placesSnapshot.docs.forEach(doc => {
      const data = doc.data();
      const status = data.status || 'published';
      const trustBadge = data.trustBadge || 'community';
      
      switch (status) {
        case 'published':
          publishedPlaces++;
          break;
        case 'pending':
          pendingPlaces++;
          break;
        case 'hidden':
          hiddenPlaces++;
          break;
      }
      
      if (trustBadgeStats.hasOwnProperty(trustBadge)) {
        trustBadgeStats[trustBadge as keyof typeof trustBadgeStats]++;
      }
    });

    // Get user growth data (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const newUsersSnapshot = await db.collection('users')
      .where('createdAt', '>=', thirtyDaysAgo)
      .get();
    const newUsersThisMonth = newUsersSnapshot.size;

    // Get active users (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const activeUsersSnapshot = await db.collection('users')
      .where('lastActiveAt', '>=', sevenDaysAgo)
      .get();
    const activeUsers = activeUsersSnapshot.size;

    return {
      totalPlaces: placesSnapshot.size,
      publishedPlaces,
      pendingPlaces,
      hiddenPlaces,
      trustBadgeStats,
      newUsersThisMonth,
      activeUsers
    };
  } catch (error) {
    logger.error('Error getting platform analytics:', error);
    throw new HttpsError('internal', 'Lỗi khi lấy thống kê nền tảng');
  }
});
