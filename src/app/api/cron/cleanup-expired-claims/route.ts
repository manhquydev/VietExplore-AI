import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/server/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

/**
 * Cron job to cleanup expired claims
 * Runs every 30 minutes as configured in vercel.json
 */
export async function GET(request: NextRequest) {
  try {
    // Verify this is a legitimate cron request
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminDb = getAdminDb();
    const now = new Date();
    const nowISOString = now.toISOString();

    // Find expired claims
    const expiredClaimsQuery = await adminDb.collection('moderation_queue')
      .where('status', '==', 'claimed')
      .where('claimExpiresAt', '<', nowISOString)
      .get();

    let cleanedCount = 0;

    // Release expired claims
    const releasePromises = expiredClaimsQuery.docs.map(async (doc) => {
      try {
        await adminDb.collection('moderation_queue').doc(doc.id).update({
          status: 'pending',
          claimedBy: FieldValue.delete(),
          claimedAt: FieldValue.delete(),
          claimExpiresAt: FieldValue.delete(),
          updatedAt: nowISOString,
          autoReleasedAt: nowISOString,
          autoReleaseReason: 'Expired claim (2 hours timeout)'
        });
        
        cleanedCount++;
        console.log(`Auto-released expired claim: ${doc.id}`);
      } catch (error) {
        console.error(`Failed to release expired claim ${doc.id}:`, error);
      }
    });

    await Promise.all(releasePromises);

    // Also cleanup expired preview sessions
    const expiredPreviewsQuery = await adminDb.collection('preview_sessions')
      .where('expiresAt', '<', nowISOString)
      .get();

    const previewCleanupPromises = expiredPreviewsQuery.docs.map(doc => doc.ref.delete());
    await Promise.all(previewCleanupPromises);

    console.log(`Cron cleanup completed: ${cleanedCount} claims released, ${expiredPreviewsQuery.size} preview sessions cleaned`);

    return NextResponse.json({
      success: true,
      message: 'Cleanup completed',
      stats: {
        expiredClaimsReleased: cleanedCount,
        expiredPreviewsCleaned: expiredPreviewsQuery.size,
        processedAt: nowISOString
      }
    });

  } catch (error) {
    console.error('Cron cleanup error:', error);
    return NextResponse.json(
      { success: false, error: 'Cleanup failed' },
      { status: 500 }
    );
  }
}