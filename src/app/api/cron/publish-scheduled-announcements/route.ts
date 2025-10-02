import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/server/firebaseAdmin';
import { Announcement, shouldAutoPublish } from '@/lib/types/announcements';

/**
 * Cron job để tự động xuất bản thông báo theo lịch
 *
 * Usage: POST /api/cron/publish-scheduled-announcements
 *
 * Sẽ được gọi bởi Vercel cron hoặc external scheduler mỗi 15 phút
 */

export async function POST(request: NextRequest) {
  try {
    // Verify cron authorization
    const authHeader = request.headers.get('Authorization');
    const expectedToken = process.env.CRON_SECRET_TOKEN;

    if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('=== CRON JOB: Publishing scheduled announcements ===');

    const adminDb = getAdminDb();
    const results = {
      processed: 0,
      published: 0,
      errors: [] as string[],
      publishedIds: [] as string[],
    };

    // Get all scheduled announcements
    const scheduledSnapshot = await adminDb
      .collection('announcements')
      .where('status', '==', 'scheduled')
      .get();

    console.log(`Found ${scheduledSnapshot.size} scheduled announcements`);

    // Process each scheduled announcement
    for (const doc of scheduledSnapshot.docs) {
      results.processed++;
      const announcement = { id: doc.id, ...doc.data() } as Announcement;

      try {
        // Check if it's time to publish
        if (shouldAutoPublish(announcement)) {
          const now = new Date().toISOString();

          // Update to published status
          await adminDb.collection('announcements').doc(doc.id).update({
            status: 'published',
            publishedAt: now,
            updatedAt: now,
          });

          results.published++;
          results.publishedIds.push(doc.id);

          console.log(`✅ Published announcement: ${announcement.title} (${doc.id})`);
        } else {
          console.log(`⏰ Not yet time to publish: ${announcement.title} (scheduled for ${announcement.scheduledFor})`);
        }
      } catch (error: any) {
        const errorMsg = `Failed to publish ${doc.id}: ${error.message}`;
        console.error(`❌ ${errorMsg}`);
        results.errors.push(errorMsg);
      }
    }

    console.log('=== CRON JOB COMPLETED ===', {
      processed: results.processed,
      published: results.published,
      errors: results.errors.length,
    });

    return NextResponse.json({
      success: true,
      message: `Published ${results.published} announcements`,
      results,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Fatal error in cron job:', error);
    return NextResponse.json(
      {
        error: 'Cron job failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Allow GET for health check
export async function GET() {
  return NextResponse.json({
    status: 'Cron job endpoint active',
    endpoint: 'POST /api/cron/publish-scheduled-announcements',
    description: 'Automatically publishes scheduled announcements when their time comes',
    schedule: 'Every 15 minutes (configured in vercel.json or external scheduler)'
  });
}
