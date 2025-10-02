import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/server/firebaseAdmin';
import { verifyAuthToken } from '@/lib/server/auth-middleware';
import {
  Announcement,
  UpdateAnnouncementInput,
  generateSlug,
  generateExcerpt,
} from '@/lib/types/announcements';

/**
 * GET /api/admin/announcements/[id]
 * Get single announcement by ID (admin view)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminDb = getAdminDb();
    const { id } = await params;

    // Verify authentication
    const auth = await verifyAuthToken(request);
    if (!auth.success || !auth.user || !['admin', 'moderator'].includes(auth.user.role)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const doc = await adminDb.collection('announcements').doc(id).get();

    if (!doc.exists) {
      return NextResponse.json(
        { success: false, error: 'Announcement not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: doc.id,
        ...doc.data(),
      } as Announcement,
    });
  } catch (error: any) {
    console.error('Error fetching announcement:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch announcement' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/announcements/[id]
 * Update announcement
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminDb = getAdminDb();
    const { id } = await params;

    // Verify authentication
    const auth = await verifyAuthToken(request);
    if (!auth.success || !auth.user || !['admin', 'moderator'].includes(auth.user.role)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const body: Partial<UpdateAnnouncementInput> = await request.json();

    // Validate scheduled status requires scheduledFor
    if (body.status === 'scheduled' && !body.scheduledFor) {
      return NextResponse.json(
        { success: false, error: 'scheduledFor is required when status is scheduled' },
        { status: 400 }
      );
    }

    // Validate scheduledFor is in the future
    if (body.scheduledFor) {
      const scheduledDate = new Date(body.scheduledFor);
      if (scheduledDate <= new Date()) {
        return NextResponse.json(
          { success: false, error: 'scheduledFor must be a future date/time' },
          { status: 400 }
        );
      }
    }

    // Get existing announcement
    const docRef = adminDb.collection('announcements').doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json(
        { success: false, error: 'Announcement not found' },
        { status: 404 }
      );
    }

    const existingData = doc.data() as Announcement;

    // Check permissions (author can only edit their own drafts)
    const canEdit =
      auth.user.role === 'admin' ||
      auth.user.role === 'moderator' ||
      (existingData.authorId === auth.user.id && existingData.status === 'draft');

    if (!canEdit) {
      return NextResponse.json(
        { success: false, error: 'You do not have permission to edit this announcement' },
        { status: 403 }
      );
    }

    // Prepare update data
    const updateData: Partial<Announcement> = {
      ...body,
      updatedAt: new Date().toISOString(),
      lastEditedBy: auth.user.id,
      lastEditedAt: new Date().toISOString(),
      version: (existingData.version || 1) + 1,
    };

    // Update slug if title changed
    if (body.title && body.title !== existingData.title) {
      let newSlug = generateSlug(body.title);

      // Check if slug already exists (excluding current doc)
      const existingSlug = await adminDb
        .collection('announcements')
        .where('slug', '==', newSlug)
        .limit(2)
        .get();

      if (existingSlug.size > 0 && existingSlug.docs[0].id !== id) {
        newSlug = `${newSlug}-${Date.now()}`;
      }

      updateData.slug = newSlug;
    }

    // Update excerpt if content changed
    if (body.content) {
      updateData.excerpt = body.excerpt || generateExcerpt(body.content, 200);
    }

    // Auto-publish if scheduled time has passed
    if (body.status === 'scheduled' && body.scheduledFor) {
      const scheduledDate = new Date(body.scheduledFor);
      if (scheduledDate <= new Date()) {
        updateData.status = 'published';
        updateData.publishedAt = new Date().toISOString();
      }
    }

    // Set publishedAt when publishing
    if (body.status === 'published' && existingData.status !== 'published') {
      updateData.publishedAt = new Date().toISOString();
    }

    // Remove undefined values
    Object.keys(updateData).forEach((key) => {
      if (updateData[key as keyof typeof updateData] === undefined) {
        delete updateData[key as keyof typeof updateData];
      }
    });

    // Update in Firestore
    await docRef.update(updateData);

    // Get updated document
    const updatedDoc = await docRef.get();

    return NextResponse.json({
      success: true,
      data: {
        id: updatedDoc.id,
        ...updatedDoc.data(),
      } as Announcement,
      message: 'Announcement updated successfully',
    });
  } catch (error: any) {
    console.error('Error updating announcement:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update announcement' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/announcements/[id]
 * Delete announcement (admin only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminDb = getAdminDb();
    const { id } = await params;

    // Verify admin authentication
    const auth = await verifyAuthToken(request);
    if (!auth.success || !auth.user || auth.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const docRef = adminDb.collection('announcements').doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json(
        { success: false, error: 'Announcement not found' },
        { status: 404 }
      );
    }

    // Soft delete by archiving
    await docRef.update({
      status: 'archived',
      updatedAt: new Date().toISOString(),
      lastEditedBy: auth.user.id,
      lastEditedAt: new Date().toISOString(),
    });

    // Or hard delete (uncomment to enable)
    // await docRef.delete();

    return NextResponse.json({
      success: true,
      message: 'Announcement deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting announcement:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete announcement' },
      { status: 500 }
    );
  }
}
