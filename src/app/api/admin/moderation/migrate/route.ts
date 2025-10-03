import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthToken } from '@/lib/server/auth-middleware';
import { getAdminDb } from '@/lib/server/firebaseAdmin';

/**
 * POST /api/admin/moderation/migrate - Migration API để fix stuck approved places
 *
 * QUAN TRỌNG: Chỉ chạy ONE-TIME sau khi deploy fix
 *
 * Tự động cleanup các địa điểm đã approved/rejected nhưng vẫn còn trong moderation_queue
 */
export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const authResult = await verifyAuthToken(request);
    if (!authResult.success || !authResult.user || authResult.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only admins can run migrations' },
        { status: 403 }
      );
    }

    const { action, confirmToken } = await request.json();

    // Safety check: Require confirm token để prevent accidental runs
    if (confirmToken !== 'CLEANUP_APPROVED_PLACES_2025') {
      return NextResponse.json(
        {
          error: 'Invalid confirm token',
          message: 'Use confirmToken: "CLEANUP_APPROVED_PLACES_2025" to proceed',
        },
        { status: 400 }
      );
    }

    if (action !== 'cleanup_finalized') {
      return NextResponse.json(
        { error: 'Invalid action. Use: cleanup_finalized' },
        { status: 400 }
      );
    }

    console.log('='.repeat(60));
    console.log('🔧 MIGRATION: Cleanup Finalized Moderation Entries');
    console.log(`Triggered by: ${authResult.user.email} (${authResult.user.id})`);
    console.log('='.repeat(60));

    const adminDb = getAdminDb();

    // Step 1: Scan for finalized entries
    console.log('\n📊 Step 1: Scanning moderation_queue...');

    const finalizedStatuses = ['approved', 'rejected', 'deleted'];
    const allEntriesSnapshot = await adminDb.collection('moderation_queue').get();

    const finalizedEntries: Array<{
      id: string;
      contentId: string;
      queueStatus: string;
      placeStatus: string;
    }> = [];

    // Analyze each entry
    for (const doc of allEntriesSnapshot.docs) {
      const data = doc.data();

      if (finalizedStatuses.includes(data.status)) {
        const contentId = data.contentId || data.itemId;

        // Verify place status
        let placeStatus = 'unknown';
        try {
          const placeDoc = await adminDb.collection('places').doc(contentId).get();
          if (placeDoc.exists) {
            placeStatus = placeDoc.data()?.status || 'unknown';
          }
        } catch (error) {
          console.error(`Error checking place ${contentId}:`, error);
        }

        finalizedEntries.push({
          id: doc.id,
          contentId: contentId,
          queueStatus: data.status,
          placeStatus: placeStatus,
        });
      }
    }

    console.log(`Found ${finalizedEntries.length} finalized entries to cleanup`);

    if (finalizedEntries.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No finalized entries found. Queue is already clean!',
        data: {
          scanned: allEntriesSnapshot.size,
          finalized: 0,
          cleaned: 0,
        },
      });
    }

    // Step 2: Delete finalized entries
    console.log('\n🧹 Step 2: Deleting finalized entries...');

    let successCount = 0;
    let errorCount = 0;
    const errors: Array<{ entryId: string; error: string }> = [];

    // Process in batches
    const batchSize = 10;
    for (let i = 0; i < finalizedEntries.length; i += batchSize) {
      const batch = finalizedEntries.slice(i, i + batchSize);

      await Promise.all(
        batch.map(async (entry) => {
          try {
            await adminDb.collection('moderation_queue').doc(entry.id).delete();
            successCount++;
            console.log(`✅ Deleted: ${entry.id} (${successCount}/${finalizedEntries.length})`);
          } catch (error: any) {
            errorCount++;
            errors.push({ entryId: entry.id, error: error.message });
            console.error(`❌ Error deleting ${entry.id}:`, error);
          }
        })
      );
    }

    // Step 3: Log migration action
    await adminDb.collection('admin_audit_log').add({
      action: 'migration_cleanup_finalized_moderation',
      adminId: authResult.user.id,
      adminEmail: authResult.user.email,
      timestamp: new Date().toISOString(),
      result: {
        totalScanned: allEntriesSnapshot.size,
        finalizedFound: finalizedEntries.length,
        successfullyDeleted: successCount,
        errors: errorCount,
        errorDetails: errors.slice(0, 10), // First 10 errors only
      },
    });

    console.log('\n✅ Migration completed!');
    console.log(`Successfully deleted: ${successCount} entries`);
    console.log(`Errors: ${errorCount} entries`);

    return NextResponse.json({
      success: true,
      message: `Migration completed. Cleaned up ${successCount} finalized entries.`,
      data: {
        scanned: allEntriesSnapshot.size,
        finalizedFound: finalizedEntries.length,
        successfullyDeleted: successCount,
        errors: errorCount,
        errorDetails: errors.slice(0, 10),
        sampleCleaned: finalizedEntries.slice(0, 5), // Show first 5
      },
    });
  } catch (error) {
    console.error('Error in migration:', error);
    return NextResponse.json(
      {
        error: 'Migration failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/moderation/migrate - Preview migration
 * Check how many entries would be cleaned without actually deleting
 */
export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const authResult = await verifyAuthToken(request);
    if (!authResult.success || !authResult.user || authResult.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only admins can preview migrations' },
        { status: 403 }
      );
    }

    console.log('🔍 PREVIEW: Scanning for finalized entries...');

    const adminDb = getAdminDb();
    const finalizedStatuses = ['approved', 'rejected', 'deleted'];
    const allEntriesSnapshot = await adminDb.collection('moderation_queue').get();

    const finalizedEntries: Array<{
      id: string;
      contentId: string;
      queueStatus: string;
      placeStatus: string;
      submittedAt: string;
      reviewedAt?: string;
    }> = [];

    // Analyze each entry
    for (const doc of allEntriesSnapshot.docs) {
      const data = doc.data();

      if (finalizedStatuses.includes(data.status)) {
        const contentId = data.contentId || data.itemId;

        // Verify place status
        let placeStatus = 'unknown';
        try {
          const placeDoc = await adminDb.collection('places').doc(contentId).get();
          if (placeDoc.exists) {
            placeStatus = placeDoc.data()?.status || 'unknown';
          }
        } catch (error) {
          console.error(`Error checking place ${contentId}:`, error);
        }

        finalizedEntries.push({
          id: doc.id,
          contentId: contentId,
          queueStatus: data.status,
          placeStatus: placeStatus,
          submittedAt: data.submittedAt || 'unknown',
          reviewedAt: data.reviewedAt,
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Preview completed',
      data: {
        totalEntries: allEntriesSnapshot.size,
        finalizedCount: finalizedEntries.length,
        wouldBeDeleted: finalizedEntries.length,
        preview: finalizedEntries.slice(0, 20), // First 20
        instructions: {
          step1: 'Review the preview above',
          step2: 'To proceed with cleanup, send POST request with:',
          step3: '{ "action": "cleanup_finalized", "confirmToken": "CLEANUP_APPROVED_PLACES_2025" }',
        },
      },
    });
  } catch (error) {
    console.error('Error in preview:', error);
    return NextResponse.json(
      {
        error: 'Preview failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
