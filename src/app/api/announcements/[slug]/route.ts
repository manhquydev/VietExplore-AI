import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/server/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';
import { Announcement } from '@/lib/types/announcements';

/**
 * GET /api/announcements/[slug]
 * Public endpoint - Get announcement by slug with view tracking
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const adminDb = getAdminDb();
    const { slug } = await params;

    // Query by slug
    const snapshot = await adminDb
      .collection('announcements')
      .where('slug', '==', slug)
      .where('status', '==', 'published')
      .limit(1)
      .get();

    if (snapshot.empty) {
      return NextResponse.json(
        { success: false, error: 'Announcement not found' },
        { status: 404 }
      );
    }

    const doc = snapshot.docs[0];
    const data = doc.data() as Announcement;

    // Check if expired
    if (data.expiresAt) {
      const expiresAt = new Date(data.expiresAt);
      if (expiresAt < new Date()) {
        return NextResponse.json(
          { success: false, error: 'Announcement has expired' },
          { status: 404 }
        );
      }
    }

    // Increment view count asynchronously (fire and forget)
    doc.ref.update({
      viewCount: FieldValue.increment(1),
    }).catch((error) => {
      console.error('Failed to increment view count:', error);
    });

    // Get related announcements (same type, excluding current)
    const relatedSnapshot = await adminDb
      .collection('announcements')
      .where('type', '==', data.type)
      .where('status', '==', 'published')
      .orderBy('publishedAt', 'desc')
      .limit(4)
      .get();

    const relatedAnnouncements: Partial<Announcement>[] = [];
    relatedSnapshot.forEach((relatedDoc) => {
      if (relatedDoc.id !== doc.id) {
        const relatedData = relatedDoc.data();
        relatedAnnouncements.push({
          id: relatedDoc.id,
          title: relatedData.title,
          slug: relatedData.slug,
          excerpt: relatedData.excerpt,
          type: relatedData.type,
          publishedAt: relatedData.publishedAt,
          featuredImage: relatedData.featuredImage,
        });
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        id: doc.id,
        ...data,
        viewCount: data.viewCount + 1, // Return updated count to client
      } as Announcement,
      relatedAnnouncements: relatedAnnouncements.slice(0, 3),
    });
  } catch (error: any) {
    console.error('Error fetching announcement:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch announcement' },
      { status: 500 }
    );
  }
}
