import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/server/auth';
import { getFirebaseAdmin } from '@/lib/server/firebaseAdmin';
import { DecodedIdToken } from 'firebase-admin/auth';

const getStatsHandler = async (
  request: NextRequest,
  context: { user: DecodedIdToken }
) => {
  try {
    const { adminDb } = getFirebaseAdmin();
    const moderationItemsRef = adminDb.collection('moderation/requests/items');

    // Get counts by status
    const statuses = ['queued', 'in_review', 'approved', 'rejected', 'returned'];
    const statusPromises = statuses.map(status =>
        moderationItemsRef.where('status', '==', status).count().get()
    );
    const statusSnapshots = await Promise.all(statusPromises);
    const statusCounts = Object.fromEntries(
        statuses.map((status, i) => [status, statusSnapshots[i].data().count])
    );

    // Urgent count
    const urgentSnapshot = await moderationItemsRef.where('priority', '==', 'urgent').count().get();
    statusCounts.urgent = urgentSnapshot.data().count;

    // Total count
    const totalSnapshot = await moderationItemsRef.count().get();
    statusCounts.total = totalSnapshot.data().count;

    return NextResponse.json({
      success: true,
      stats: statusCounts,
    });
  } catch (error: any) {
    console.error('Error fetching moderation stats:', error);
    return NextResponse.json(
      { success: false, error: 'An internal server error occurred.' },
      { status: 500 }
    );
  }
};

export const GET = withAuth(getStatsHandler, ['moderator', 'admin']);
