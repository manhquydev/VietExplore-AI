import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/server/firebaseAdmin';
import { PreviewService } from '@/lib/server/preview-service';

/**
 * GET /api/drafts/[id]/preview - Get draft for preview
 * Section 2.3.1: "Vercel Preview URL cho draft version (chỉ authorized users)"
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminDb = getAdminDb();
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Preview token is required' },
        { status: 401 }
      );
    }

    // Verify preview token
    const tokenVerification = PreviewService.verifyPreviewToken(token);
    
    if (!tokenVerification.valid) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired preview token' },
        { status: 401 }
      );
    }

    const { draftId, userId } = tokenVerification;

    const { id } = await params;
    
    // Ensure the requested draft matches the token
    if (draftId !== id) {
      return NextResponse.json(
        { success: false, error: 'Token does not match requested draft' },
        { status: 403 }
      );
    }

    try {
      // Get draft using PreviewService
      const draft = await PreviewService.getDraftForPreview(id, userId!);

      return NextResponse.json({
        success: true,
        data: draft,
        previewInfo: {
          isPreview: true,
          viewedBy: userId,
          viewedAt: new Date().toISOString()
        }
      });

    } catch (authError) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized to view this draft' },
        { status: 403 }
      );
    }

  } catch (error) {
    console.error('Error loading draft preview:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to load draft preview' },
      { status: 500 }
    );
  }
}