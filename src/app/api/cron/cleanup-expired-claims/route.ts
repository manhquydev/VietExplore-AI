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
    let skippedCount = 0;
    let errorCount = 0;

    console.log(`[CRON] Found ${expiredClaimsQuery.size} potential expired claims to process`);

    // CRITICAL: Use Firestore Transactions to prevent race conditions
    // Release expired claims with atomic check-and-update
    const releasePromises = expiredClaimsQuery.docs.map(async (doc) => {
      try {
        const docRef = adminDb.collection('moderation_queue').doc(doc.id);

        // Use transaction to ensure atomicity and prevent race condition
        await adminDb.runTransaction(async (transaction) => {
          // CRITICAL: Re-fetch document INSIDE transaction to get latest state
          const freshDoc = await transaction.get(docRef);

          if (!freshDoc.exists) {
            console.log(`[CRON] ⚠️  Document ${doc.id} no longer exists, skipping`);
            skippedCount++;
            return;
          }

          const freshData = freshDoc.data()!;

          // CRITICAL: Recheck conditions INSIDE transaction
          // Ngăn chặn overwrite status nếu đã chuyển sang in_review/approved/rejected
          if (freshData.status !== 'claimed') {
            console.log(`[CRON] ⚠️  Document ${doc.id} status changed from 'claimed' to '${freshData.status}', skipping release`);
            skippedCount++;
            return;
          }

          // Recheck expiry time (có thể đã được extended)
          if (!freshData.claimExpiresAt || freshData.claimExpiresAt >= nowISOString) {
            console.log(`[CRON] ⚠️  Document ${doc.id} claim extended or removed, skipping`);
            skippedCount++;
            return;
          }

          // All checks passed - safe to release
          transaction.update(docRef, {
            status: 'pending',
            claimedBy: FieldValue.delete(),
            claimedAt: FieldValue.delete(),
            claimExpiresAt: FieldValue.delete(),
            updatedAt: nowISOString,
            autoReleasedAt: nowISOString,
            autoReleaseReason: 'Expired claim (2 hours timeout)'
          });

          cleanedCount++;
          console.log(`[CRON] ✅ Auto-released expired claim: ${doc.id}`);
        });

      } catch (error) {
        errorCount++;
        console.error(`[CRON] ❌ Failed to release expired claim ${doc.id}:`, error);
      }
    });

    await Promise.all(releasePromises);

    // Also cleanup expired preview sessions
    const expiredPreviewsQuery = await adminDb.collection('preview_sessions')
      .where('expiresAt', '<', nowISOString)
      .get();

    const previewCleanupPromises = expiredPreviewsQuery.docs.map(doc => doc.ref.delete());
    await Promise.all(previewCleanupPromises);

    // Enhanced logging with detailed stats
    console.log(`[CRON] ✅ Cleanup completed successfully`);
    console.log(`[CRON] 📊 Claims: ${cleanedCount} released, ${skippedCount} skipped, ${errorCount} errors (total found: ${expiredClaimsQuery.size})`);
    console.log(`[CRON] 🗑️  Preview sessions cleaned: ${expiredPreviewsQuery.size}`);
    console.log(`[CRON] ⏰ Processed at: ${nowISOString}`);

    return NextResponse.json({
      success: true,
      message: 'Cleanup completed',
      stats: {
        claims: {
          found: expiredClaimsQuery.size,
          released: cleanedCount,
          skipped: skippedCount,
          errors: errorCount
        },
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