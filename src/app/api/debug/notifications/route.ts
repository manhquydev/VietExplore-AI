import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthToken } from '@/lib/server/auth-middleware';
import { getRealtimeDb, getAdminDb } from '@/lib/server/firebaseAdmin';
import * as admin from 'firebase-admin';

/**
 * GET /api/debug/notifications
 * Debug endpoint to check notification system status
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAuthToken(request);
    
    if (!authResult.success) {
      return NextResponse.json({
        error: 'Unauthorized'
      }, { status: 403 });
    }

    const userId = authResult.user.id;
    const debugInfo: any = {
      timestamp: new Date().toISOString(),
      userId,
      userRole: authResult.user.role,
      checks: {}
    };

    // 1. Check Firebase Realtime Database connection
    try {
      const realtimeDb = getRealtimeDb();
      if (realtimeDb) {
        // Try to read user notifications
        const notificationsRef = realtimeDb.ref(`notifications/${userId}`);
        const snapshot = await notificationsRef.once('value');
        const notifications = snapshot.val() || {};
        
        debugInfo.checks.realtimeDatabase = {
          status: 'connected',
          notificationCount: Object.keys(notifications).length,
          notifications: Object.entries(notifications).map(([key, value]: [string, any]) => ({
            id: key,
            type: value.type,
            title: value.title,
            read: value.read,
            createdAt: value.createdAt
          }))
        };
      } else {
        debugInfo.checks.realtimeDatabase = {
          status: 'not_initialized',
          error: 'Realtime database not initialized'
        };
      }
    } catch (error) {
      debugInfo.checks.realtimeDatabase = {
        status: 'error',
        error: error.message
      };
    }

    // 2. Check Firestore connection
    try {
      const db = getAdminDb();
      const notificationsQuery = await db.collection('notifications')
        .where('userId', '==', userId)
        .limit(5)
        .get();
      
      debugInfo.checks.firestore = {
        status: 'connected',
        notificationCount: notificationsQuery.size,
        notifications: notificationsQuery.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
      };
    } catch (error) {
      debugInfo.checks.firestore = {
        status: 'error',
        error: error.message
      };
    }

    // 3. Check user presence
    try {
      const realtimeDb = getRealtimeDb();
      if (realtimeDb) {
        const presenceRef = realtimeDb.ref(`user_presence/${userId}`);
        const presenceSnapshot = await presenceRef.once('value');
        debugInfo.checks.userPresence = {
          status: 'found',
          data: presenceSnapshot.val()
        };
      }
    } catch (error) {
      debugInfo.checks.userPresence = {
        status: 'error',
        error: error.message
      };
    }

    // 4. Check admin dashboard if admin
    if (authResult.user.role === 'admin') {
      try {
        const realtimeDb = getRealtimeDb();
        if (realtimeDb) {
          const adminDashboardRef = realtimeDb.ref('admin_dashboard/notifications');
          const adminSnapshot = await adminDashboardRef.limitToLast(3).once('value');
          debugInfo.checks.adminDashboard = {
            status: 'accessible',
            recentNotifications: adminSnapshot.val()
          };
        }
      } catch (error) {
        debugInfo.checks.adminDashboard = {
          status: 'error',
          error: error.message
        };
      }
    }

    // 5. Test notification creation
    try {
      const realtimeDb = getRealtimeDb();
      if (realtimeDb) {
        const testNotificationRef = realtimeDb.ref(`notifications/${userId}`).push();
        await testNotificationRef.set({
          type: 'system_maintenance',
          title: '🧪 Debug Test Notification',
          message: 'This is a test notification created by debug endpoint',
          data: { debugMode: true },
          read: false,
          createdAt: new Date().toISOString(),
          priority: 'low',
          timestamp: admin.database.ServerValue.TIMESTAMP
        });
        
        debugInfo.checks.notificationCreation = {
          status: 'success',
          testNotificationId: testNotificationRef.key
        };
      }
    } catch (error) {
      debugInfo.checks.notificationCreation = {
        status: 'error',
        error: error.message
      };
    }

    return NextResponse.json({
      success: true,
      debug: debugInfo
    });

  } catch (error) {
    console.error('Error in debug notifications endpoint:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error.message
    }, { status: 500 });
  }
}

/**
 * POST /api/debug/notifications
 * Create test notifications for debugging
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyAuthToken(request);
    
    if (!authResult.success) {
      return NextResponse.json({
        error: 'Unauthorized'
      }, { status: 403 });
    }

    const body = await request.json();
    const { action, count = 1 } = body;
    const userId = authResult.user.id;

    const results: any[] = [];

    if (action === 'create_test_notifications') {
      const realtimeDb = getRealtimeDb();
      
      if (!realtimeDb) {
        return NextResponse.json({
          error: 'Realtime database not initialized'
        }, { status: 500 });
      }

      for (let i = 0; i < count; i++) {
        const testNotificationRef = realtimeDb.ref(`notifications/${userId}`).push();
        
        const testNotification = {
          type: i % 2 === 0 ? 'place_approved' : 'system_maintenance',
          title: `🧪 Test Notification ${i + 1}`,
          message: `This is test notification number ${i + 1} for debugging purposes`,
          data: { 
            debugMode: true,
            testNumber: i + 1,
            createdBy: 'debug_endpoint'
          },
          read: false,
          createdAt: new Date().toISOString(),
          priority: i === 0 ? 'high' : 'medium',
          timestamp: admin.database.ServerValue.TIMESTAMP
        };

        await testNotificationRef.set(testNotification);
        
        results.push({
          id: testNotificationRef.key,
          ...testNotification
        });
      }

      return NextResponse.json({
        success: true,
        message: `Created ${count} test notifications`,
        notifications: results
      });
    }

    if (action === 'clear_notifications') {
      const realtimeDb = getRealtimeDb();
      
      if (!realtimeDb) {
        return NextResponse.json({
          error: 'Realtime database not initialized'
        }, { status: 500 });
      }

      const notificationsRef = realtimeDb.ref(`notifications/${userId}`);
      await notificationsRef.remove();

      return NextResponse.json({
        success: true,
        message: 'All notifications cleared for user'
      });
    }

    return NextResponse.json({
      error: 'Invalid action. Use "create_test_notifications" or "clear_notifications"'
    }, { status: 400 });

  } catch (error) {
    console.error('Error in POST debug notifications endpoint:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error.message
    }, { status: 500 });
  }
}