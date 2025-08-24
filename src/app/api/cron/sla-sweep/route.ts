import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/server/firebaseAdmin';
import * as admin from 'firebase-admin';

export async function GET(request: NextRequest) {
  // --- Security Check ---
  // This is a simple secret-based authentication for the cron job.
  // In Vercel, set an environment variable `CRON_SECRET` and configure
  // the cron job to send it in the Authorization header.
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  // --- SLA Sweep Logic ---
  const now = admin.firestore.Timestamp.now();
  console.log('Starting hourly SLA sweep...');

  try {
    const overdueQuery = adminDb
      .collection('moderation/requests/items')
      .where('status', 'in', ['queued', 'in_review'])
      .where('dueAt', '<', now);

    const overdueSnapshot = await overdueQuery.get();

    if (overdueSnapshot.empty) {
      console.log('No overdue moderation requests found.');
      return NextResponse.json({
        success: true,
        message: 'No overdue items.',
        processedCount: 0,
      });
    }

    const batch = adminDb.batch();
    let escalatedCount = 0;

    overdueSnapshot.forEach((doc) => {
      const requestData = doc.data();
      const currentLevel = requestData.escalation?.level ?? 0;

      // Don't escalate past a certain point if not needed
      if(currentLevel >= 3) return;

      const newLevel = currentLevel + 1;

      batch.update(doc.ref, {
        priority: 'high',
        'escalation.level': newLevel,
        'escalation.lastNotifiedAt': admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      escalatedCount++;
    });

    if (escalatedCount > 0) {
      await batch.commit();

      // Audit Log
       const auditRef = adminDb.collection('audits').doc();
       await auditRef.set({
        actor: { uid: 'system', role: 'cron' },
        action: 'sla_sweep',
        target: { collection: 'moderation/requests/items' },
        metadata: { escalatedCount },
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }

    console.log(`SLA sweep completed. Escalated ${escalatedCount} requests.`);
    return NextResponse.json({
      success: true,
      message: `SLA sweep completed. Escalated ${escalatedCount} requests.`,
      processedCount: escalatedCount,
    });
  } catch (error: any) {
    console.error('Error during SLA sweep:', error);
    return NextResponse.json(
      { success: false, error: 'An internal server error occurred.' },
      { status: 500 }
    );
  }
}
