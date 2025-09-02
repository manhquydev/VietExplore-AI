import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/server/firebaseAdmin';
import { verifyAuthToken } from '@/lib/server/auth-middleware';

/**
 * Admin Bypass Authority Audit Log API
 * GET /api/admin/bypass-audit - View all admin bypass actions
 * 
 * Provides comprehensive audit trail for admin bypass authority usage
 * Section 2.1.2 compliance - Track all bypassed moderation
 */

export async function GET(request: NextRequest) {
  try {
    const adminDb = getAdminDb();
    
    // Verify admin authentication
    const authResult = await verifyAuthToken(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const user = authResult.user;
    if (user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const adminId = searchParams.get('adminId');
    const action = searchParams.get('action');
    const fromDate = searchParams.get('fromDate');
    const toDate = searchParams.get('toDate');

    // Build query
    let query: FirebaseFirestore.Query = adminDb.collection('admin_audit_log');

    // Apply filters
    if (adminId) {
      query = query.where('adminId', '==', adminId);
    }
    
    if (action) {
      query = query.where('action', '==', action);
    }
    
    if (fromDate) {
      query = query.where('timestamp', '>=', fromDate);
    }
    
    if (toDate) {
      query = query.where('timestamp', '<=', toDate);
    }

    // Order by timestamp descending
    query = query.orderBy('timestamp', 'desc');

    // Pagination
    const offset = (page - 1) * limit;
    if (offset > 0) {
      // For pagination, we would need to implement cursor-based pagination
      // For now, simple limit
      query = query.limit(limit);
    } else {
      query = query.limit(limit);
    }

    const snapshot = await query.get();
    const auditLogs: any[] = [];

    snapshot.forEach(doc => {
      auditLogs.push({
        id: doc.id,
        ...doc.data()
      });
    });

    // Get admin statistics
    const statsQuery = await adminDb.collection('admin_audit_log')
      .where('action', '==', 'admin_bypass_place_creation')
      .get();

    const adminStats = new Map();
    const actionStats = new Map();
    const dailyStats = new Map();

    statsQuery.forEach(doc => {
      const data = doc.data();
      const adminId = data.adminId;
      const action = data.action;
      const date = data.timestamp.split('T')[0]; // Get date part

      // Admin stats
      if (!adminStats.has(adminId)) {
        adminStats.set(adminId, {
          adminId: adminId,
          adminEmail: data.adminEmail,
          count: 0,
          actions: new Set()
        });
      }
      const adminStat = adminStats.get(adminId);
      adminStat.count++;
      adminStat.actions.add(action);

      // Action stats
      actionStats.set(action, (actionStats.get(action) || 0) + 1);

      // Daily stats
      if (!dailyStats.has(date)) {
        dailyStats.set(date, 0);
      }
      dailyStats.set(date, dailyStats.get(date) + 1);
    });

    // Convert maps to arrays
    const adminStatsArray = Array.from(adminStats.values()).map(stat => ({
      ...stat,
      actions: Array.from(stat.actions)
    }));

    const actionStatsArray = Array.from(actionStats.entries()).map(([action, count]) => ({
      action,
      count
    }));

    const dailyStatsArray = Array.from(dailyStats.entries()).map(([date, count]) => ({
      date,
      count
    })).sort((a, b) => b.date.localeCompare(a.date));

    return NextResponse.json({
      success: true,
      data: {
        auditLogs,
        pagination: {
          page,
          limit,
          total: snapshot.size,
          hasMore: snapshot.size === limit
        },
        statistics: {
          totalBypassActions: statsQuery.size,
          adminStats: adminStatsArray,
          actionStats: actionStatsArray,
          dailyStats: dailyStatsArray.slice(0, 30), // Last 30 days
          summary: {
            totalAdmins: adminStats.size,
            totalActions: actionStats.size,
            averagePerDay: dailyStatsArray.length > 0 
              ? Math.round(statsQuery.size / dailyStatsArray.length * 10) / 10
              : 0
          }
        },
        filters: {
          adminId,
          action,
          fromDate,
          toDate
        }
      }
    });

  } catch (error) {
    console.error('Error fetching admin bypass audit:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch audit logs' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/bypass-audit - Create manual audit entry
 * For tracking manual admin actions
 */
export async function POST(request: NextRequest) {
  try {
    const adminDb = getAdminDb();
    
    // Verify admin authentication
    const authResult = await verifyAuthToken(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const user = authResult.user;
    if (user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    const auditData = await request.json();
    
    // Validate required fields
    const requiredFields = ['action', 'contentType', 'contentId', 'bypassReason'];
    for (const field of requiredFields) {
      if (!auditData[field]) {
        return NextResponse.json(
          { success: false, error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Create audit entry
    const auditEntry = {
      action: auditData.action,
      adminId: user.id,
      adminEmail: user.email,
      contentType: auditData.contentType,
      contentId: auditData.contentId,
      contentDetails: auditData.contentDetails || {},
      bypassReason: auditData.bypassReason,
      timestamp: new Date().toISOString(),
      metadata: {
        ...auditData.metadata,
        manualEntry: true,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    };

    const docRef = await adminDb.collection('admin_audit_log').add(auditEntry);

    return NextResponse.json({
      success: true,
      data: {
        id: docRef.id,
        ...auditEntry
      },
      message: 'Manual audit entry created successfully'
    });

  } catch (error) {
    console.error('Error creating manual audit entry:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create audit entry' },
      { status: 500 }
    );
  }
}