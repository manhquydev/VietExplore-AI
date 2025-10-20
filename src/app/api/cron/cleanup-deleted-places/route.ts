import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/server/firebaseAdmin';

/**
 * CRON JOB: Auto-Cleanup Deleted Places
 *
 * Schedule: Daily at 3:00 AM (Vietnam time)
 *
 * Purpose:
 * - Permanently delete places that have been in trash for > 120 days
 * - Keep deleted_places collection clean and manageable
 * - Free up storage space
 *
 * Benefits:
 * 1. Automatic cleanup without manual intervention
 * 2. Respects 120-day restore window
 * 3. Maintains data retention policy
 * 4. Logs all permanent deletions for audit trail
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron authorization
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('='.repeat(60));
    console.log('🗑️  CRON: Auto-Cleanup Deleted Places');
    console.log('='.repeat(60));

    const adminDb = getAdminDb();
    const now = new Date();
    const nowISO = now.toISOString();

    const results = {
      scanned: 0,
      deleted: 0,
      errors: 0,
      errorDetails: [] as string[],
      deletedPlaces: [] as { id: string; name: string; deletedAt: string }[]
    };

    // Find deleted places where autoDeleteAt has passed
    const expiredQuery = await adminDb
      .collection('deleted_places')
      .where('autoDeleteAt', '<=', nowISO)
      .get();

    results.scanned = expiredQuery.size;
    console.log(`📊 Found ${results.scanned} places to permanently delete`);

    // Process each expired place
    for (const doc of expiredQuery.docs) {
      const place = doc.data();
      const placeId = doc.id;

      try {
        // Log before permanent deletion
        await adminDb.collection('moderation_logs').add({
          action: 'auto_permanent_delete_place',
          placeId: placeId,
          placeName: place.name || 'Unknown',
          performedBy: 'system_cron',
          performedAt: nowISO,
          reason: `Auto-deleted after 120 days in trash`,
          deletedAt: place.deletedAt,
          deletedBy: place.deletedBy,
          autoDeleteAt: place.autoDeleteAt
        });

        // Permanently delete from deleted_places
        await adminDb.collection('deleted_places').doc(placeId).delete();

        results.deleted++;
        results.deletedPlaces.push({
          id: placeId,
          name: place.name || 'Unknown',
          deletedAt: place.deletedAt
        });

        console.log(`✅ Permanently deleted: ${place.name} (ID: ${placeId})`);

      } catch (error) {
        results.errors++;
        const errorMsg = `Failed to delete ${placeId}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        results.errorDetails.push(errorMsg);
        console.error(`❌ ${errorMsg}`);
      }
    }

    console.log('='.repeat(60));
    console.log('📈 CLEANUP SUMMARY:');
    console.log(`   Scanned: ${results.scanned}`);
    console.log(`   Deleted: ${results.deleted}`);
    console.log(`   Errors: ${results.errors}`);
    console.log('='.repeat(60));

    return NextResponse.json({
      success: true,
      message: `Cleanup completed: ${results.deleted} places permanently deleted`,
      stats: {
        scanned: results.scanned,
        deleted: results.deleted,
        errors: results.errors
      },
      deletedPlaces: results.deletedPlaces,
      ...(results.errors > 0 && { errorDetails: results.errorDetails }),
      executedAt: nowISO
    });

  } catch (error) {
    console.error('❌ CRON ERROR:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Cron job failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
