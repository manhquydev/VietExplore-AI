import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/server/firebaseAdmin';

/**
 * CRON JOB: Auto-Archive Moderation Queue
 *
 * Schedule: Daily at 2:00 AM (Vietnam time)
 *
 * Purpose:
 * - Move approved/rejected entries > 30 days to moderation_archive
 * - Keep queue clean and performant
 * - Maintain audit trail in archive
 *
 * Benefits:
 * 1. Admins see recent decisions (30 days)
 * 2. Can rollback if needed
 * 3. Queue doesn't grow infinitely
 * 4. Historical data preserved
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron authorization
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('='.repeat(60));
    console.log('🗄️  CRON: Auto-Archive Moderation Queue');
    console.log('='.repeat(60));

    const adminDb = getAdminDb();
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgoISO = thirtyDaysAgo.toISOString();

    const results = {
      scanned: 0,
      archived: 0,
      errors: 0,
      errorDetails: [] as string[],
    };

    // Find approved/rejected entries older than 30 days
    const finalizedStatuses = ['approved', 'rejected'];

    for (const status of finalizedStatuses) {
      const query = adminDb
        .collection('moderation_queue')
        .where('status', '==', status)
        .where('reviewedAt', '<', thirtyDaysAgoISO);

      const snapshot = await query.get();
      results.scanned += snapshot.size;

      console.log(`Found ${snapshot.size} ${status} entries > 30 days old`);

      // Process each entry
      for (const doc of snapshot.docs) {
        try {
          const data = doc.data();

          // Create archive entry
          await adminDb.collection('moderation_archive').doc(doc.id).set({
            ...data,
            originalId: doc.id,
            archivedAt: now.toISOString(),
            archivedReason: 'auto_archive_30_days',
          });

          // Delete from queue
          await adminDb.collection('moderation_queue').doc(doc.id).delete();

          results.archived++;
          console.log(`✅ Archived ${doc.id} (${status})`);

        } catch (error: any) {
          results.errors++;
          const errorMsg = `Failed to archive ${doc.id}: ${error.message}`;
          results.errorDetails.push(errorMsg);
          console.error(`❌ ${errorMsg}`);
        }
      }
    }

    // Log archive action
    await adminDb.collection('admin_logs').add({
      type: 'moderation_queue_archive',
      timestamp: now.toISOString(),
      results,
    });

    console.log('');
    console.log('='.repeat(60));
    console.log('📊 ARCHIVE SUMMARY');
    console.log('='.repeat(60));
    console.log(`Scanned: ${results.scanned} entries`);
    console.log(`Archived: ${results.archived} entries`);
    console.log(`Errors: ${results.errors} entries`);

    if (results.errors > 0) {
      console.log('⚠️  Errors:', results.errorDetails.slice(0, 5));
    }

    // Optional: Auto-cleanup archive entries > 90 days
    try {
      const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      const ninetyDaysAgoISO = ninetyDaysAgo.toISOString();

      const oldArchiveSnapshot = await adminDb
        .collection('moderation_archive')
        .where('archivedAt', '<', ninetyDaysAgoISO)
        .get();

      if (oldArchiveSnapshot.size > 0) {
        console.log(`\n🗑️  Cleaning up ${oldArchiveSnapshot.size} archive entries > 90 days`);

        const deletePromises = oldArchiveSnapshot.docs.map(doc => doc.ref.delete());
        await Promise.all(deletePromises);

        console.log(`✅ Cleaned up ${oldArchiveSnapshot.size} old archive entries`);
      }
    } catch (cleanupError) {
      console.error('⚠️  Warning: Archive cleanup failed:', cleanupError);
      // Don't fail the whole job
    }

    console.log('\n✅ Archive cron job completed successfully');
    console.log('='.repeat(60));

    return NextResponse.json({
      success: true,
      message: 'Archive completed',
      data: results,
      timestamp: now.toISOString(),
    });

  } catch (error) {
    console.error('❌ Fatal error in archive cron:', error);
    return NextResponse.json(
      {
        error: 'Archive cron failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
