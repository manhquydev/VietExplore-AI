import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/server/auth';
import { adminDb } from '@/lib/server/firebaseAdmin';
import { DecodedIdToken } from 'firebase-admin/auth';
import * as admin from 'firebase-admin';

interface ReportData {
  targetType: 'place' | 'itinerary' | 'user' | 'comment';
  targetId: string;
  reason: string;
  description?: string;
}

const createReportHandler = async (
  request: NextRequest,
  context: { user: DecodedIdToken }
) => {
  const { user } = context;
  const { targetType, targetId, reason, description }: ReportData = await request.json();

  if (!targetType || !targetId || !reason) {
    return NextResponse.json({ error: 'Missing required report data.' }, { status: 400 });
  }

  const validTargetTypes = ['place', 'itinerary', 'user', 'comment'];
  if (!validTargetTypes.includes(targetType)) {
    return NextResponse.json({ error: 'Invalid target type for report.' }, { status: 400 });
  }

  try {
    const reportsRef = adminDb.collection('reports');

    // Check for duplicate reports from the same user
    const existingReportQuery = reportsRef
      .where('reportedBy', '==', user.uid)
      .where('targetType', '==', targetType)
      .where('targetId', '==', targetId)
      .limit(1);

    const existingReportSnapshot = await existingReportQuery.get();
    if (!existingReportSnapshot.empty) {
        return NextResponse.json({ error: 'You have already reported this content.' }, { status: 409 });
    }

    // Create the report document
    const reportData = {
        targetType,
        targetId,
        reason,
        description: description || '',
        reportedBy: user.uid,
        reporterInfo: {
            email: user.email,
            role: user.role || 'traveler'
        },
        status: 'received', // 'received' is the initial status for the queue
        priority: 'medium',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const reportRef = await reportsRef.add(reportData);

    console.log(`Report ${reportRef.id} created by user ${user.uid} for ${targetType}:${targetId}`);
    return NextResponse.json({
      success: true,
      message: 'Your report has been submitted successfully.',
      reportId: reportRef.id,
    });

  } catch (error: any) {
    console.error(`Error creating report by user ${user.uid}:`, error);
    return NextResponse.json(
      { success: false, error: 'An internal server error occurred.' },
      { status: 500 }
    );
  }
};

export const POST = withAuth(createReportHandler);
