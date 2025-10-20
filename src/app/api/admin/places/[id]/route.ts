import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/server/firebaseAdmin';
import { verifyAuthToken } from '@/lib/server/auth-middleware';

// DELETE /api/admin/places/[id] - Soft delete (move to trash) or permanent delete
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin access
    const authResult = await verifyAuthToken(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { success: false, error: 'Bạn cần đăng nhập để truy cập chức năng này' },
        { status: 401 }
      );
    }

    const user = authResult.user;
    if (user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Chỉ admin mới có quyền xóa địa điểm' },
        { status: 403 }
      );
    }

    const { id: placeId } = await params;
    const adminDb = getAdminDb();

    // Check if permanent deletion is requested
    const { searchParams } = new URL(request.url);
    const permanent = searchParams.get('permanent') === 'true';

    // Get place info for logging
    const placeDoc = await adminDb.collection('places').doc(placeId).get();
    if (!placeDoc.exists) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy địa điểm' },
        { status: 404 }
      );
    }

    const place = placeDoc.data();
    const now = new Date().toISOString();

    if (permanent) {
      // PERMANENT DELETE - Remove completely
      await adminDb.collection('places').doc(placeId).delete();

      // Also delete from moderation queue if exists
      const moderationQuery = await adminDb.collection('moderation_queue')
        .where('contentId', '==', placeId)
        .get();

      const batch = adminDb.batch();
      moderationQuery.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      await batch.commit();

      // Log permanent deletion
      await adminDb.collection('moderation_logs').add({
        action: 'permanent_delete_place',
        placeId,
        placeName: place?.name || 'Unknown',
        performedBy: user.id,
        performedAt: now,
        reason: 'Admin permanent deletion'
      });

      return NextResponse.json({
        success: true,
        message: `Đã xóa vĩnh viễn địa điểm "${place?.name}"`,
        deletionType: 'permanent'
      });
    } else {
      // SOFT DELETE - Move to trash (deleted_places collection)
      const autoDeleteAt = new Date();
      autoDeleteAt.setDate(autoDeleteAt.getDate() + 120); // 120 days from now

      const deletedPlace = {
        ...place,
        originalId: placeId,
        deletedAt: now,
        deletedBy: user.id,
        deletedByInfo: {
          id: user.id,
          name: user.fullName,
          email: user.email,
          role: user.role
        },
        autoDeleteAt: autoDeleteAt.toISOString(),
        canRestore: true,
        previousStatus: place.status
      };

      // Add to deleted_places collection
      await adminDb.collection('deleted_places').doc(placeId).set(deletedPlace);

      // Remove from active places collection
      await adminDb.collection('places').doc(placeId).delete();

      // Remove from moderation queue if exists
      const moderationQuery = await adminDb.collection('moderation_queue')
        .where('contentId', '==', placeId)
        .get();

      const batch = adminDb.batch();
      moderationQuery.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      await batch.commit();

      // Log soft deletion
      await adminDb.collection('moderation_logs').add({
        action: 'soft_delete_place',
        placeId,
        placeName: place?.name || 'Unknown',
        performedBy: user.id,
        performedAt: now,
        reason: `Moved to trash - can restore within 120 days`,
        autoDeleteAt: autoDeleteAt.toISOString()
      });

      return NextResponse.json({
        success: true,
        message: `Đã xóa địa điểm "${place?.name}" vào thùng rác`,
        deletionType: 'soft',
        restorableUntil: autoDeleteAt.toISOString(),
        canRestore: true
      });
    }

  } catch (error) {
    console.error('Error deleting place:', error);
    return NextResponse.json(
      { success: false, error: 'Không thể xóa địa điểm' },
      { status: 500 }
    );
  }
}

// GET /api/admin/places/[id] - Get single place with admin details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin/moderator access
    const authResult = await verifyAuthToken(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = authResult.user;
    if (!['admin', 'moderator'].includes(user.role)) {
      return NextResponse.json(
        { success: false, error: 'Admin or Moderator role required' },
        { status: 403 }
      );
    }

    const { id: placeId } = await params;
    const adminDb = getAdminDb();

    // Get place with full details
    const placeDoc = await adminDb.collection('places').doc(placeId).get();
    if (!placeDoc.exists) {
      return NextResponse.json(
        { success: false, error: 'Place not found' },
        { status: 404 }
      );
    }

    const place = {
      id: placeDoc.id,
      ...placeDoc.data()
    };

    // Get moderation history
    const moderationActions = await adminDb.collection('moderation_actions')
      .where('placeId', '==', placeId)
      .orderBy('createdAt', 'desc')
      .limit(10)
      .get();

    const actions = moderationActions.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({
      success: true,
      data: {
        place,
        moderationActions: actions,
        adminAccess: true
      }
    });

  } catch (error) {
    console.error('Error fetching place details:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/admin/places/[id]?action=restore - Restore from trash
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin access
    const authResult = await verifyAuthToken(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = authResult.user;
    if (user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Admin role required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action !== 'restore') {
      return NextResponse.json(
        { success: false, error: 'Invalid action' },
        { status: 400 }
      );
    }

    const { id: placeId } = await params;
    const adminDb = getAdminDb();
    const now = new Date().toISOString();

    // Get from deleted_places
    const deletedDoc = await adminDb.collection('deleted_places').doc(placeId).get();
    if (!deletedDoc.exists) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy địa điểm trong thùng rác' },
        { status: 404 }
      );
    }

    const deletedPlace = deletedDoc.data();

    // Check if still within restore window
    const autoDeleteAt = new Date(deletedPlace.autoDeleteAt);
    if (new Date() > autoDeleteAt) {
      return NextResponse.json(
        { success: false, error: 'Địa điểm đã quá thời hạn khôi phục (120 ngày)' },
        { status: 410 }
      );
    }

    // Restore to places collection
    const restoredPlace = {
      ...deletedPlace,
      status: deletedPlace.previousStatus || 'draft',
      updatedAt: now,
      restoredAt: now,
      restoredBy: user.id
    };

    // Remove restoration metadata
    delete restoredPlace.originalId;
    delete restoredPlace.deletedAt;
    delete restoredPlace.deletedBy;
    delete restoredPlace.deletedByInfo;
    delete restoredPlace.autoDeleteAt;
    delete restoredPlace.canRestore;
    delete restoredPlace.previousStatus;

    // Restore to places
    await adminDb.collection('places').doc(placeId).set(restoredPlace);

    // Remove from deleted_places
    await adminDb.collection('deleted_places').doc(placeId).delete();

    // Log restoration
    await adminDb.collection('moderation_logs').add({
      action: 'restore_place',
      placeId,
      placeName: deletedPlace?.name || 'Unknown',
      performedBy: user.id,
      performedAt: now,
      reason: 'Restored from trash'
    });

    return NextResponse.json({
      success: true,
      message: `Đã khôi phục địa điểm "${deletedPlace?.name}"`,
      data: {
        place: restoredPlace,
        restoredAt: now
      }
    });

  } catch (error) {
    console.error('Error restoring place:', error);
    return NextResponse.json(
      { success: false, error: 'Cannot restore place' },
      { status: 500 }
    );
  }
}