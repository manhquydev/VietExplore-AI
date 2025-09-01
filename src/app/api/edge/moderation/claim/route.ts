import { NextRequest, NextResponse } from 'next/server';

// Vercel Edge Function configuration (Section 2.2.1)
export const runtime = 'edge';
export const regions = ['sin1', 'hkg1']; // Gần Việt Nam

/**
 * Edge Function for moderation claim actions - Section 2.2.1
 * "Claim action qua Edge Function để respond nhanh hơn"
 */
export async function POST(request: NextRequest) {
  try {
    const { action, itemId, moderatorId } = await request.json();

    // Quick validation at edge
    if (!action || !itemId || !moderatorId) {
      return NextResponse.json(
        { success: false, error: 'Thiếu thông tin bắt buộc' },
        { status: 400 }
      );
    }

    if (!['claim', 'release'].includes(action)) {
      return NextResponse.json(
        { success: false, error: 'Hành động không hợp lệ' },
        { status: 400 }
      );
    }

    // For edge function, we validate and forward to main API
    // This provides faster initial response while main API handles complex logic
    const mainApiUrl = `${request.nextUrl.origin}/api/moderation/queue/${itemId}`;
    
    try {
      // Forward to main API with validated data
      const response = await fetch(mainApiUrl, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': request.headers.get('Authorization') || '',
          'X-Edge-Validated': 'true' // Mark as edge-validated
        },
        body: JSON.stringify({ action })
      });

      if (!response.ok) {
        const errorData = await response.json();
        return NextResponse.json(errorData, { status: response.status });
      }

      const data = await response.json();
      
      // Add edge processing info
      return NextResponse.json({
        ...data,
        edgeProcessed: true,
        edgeLocation: request.geo?.city || 'unknown',
        processedAt: new Date().toISOString()
      });

    } catch (apiError) {
      console.error('Error calling main API:', apiError);
      return NextResponse.json(
        { success: false, error: 'Lỗi xử lý claim action' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Edge claim error:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi xử lý yêu cầu' },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint for checking claim status quickly
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const itemId = searchParams.get('itemId');
  
  if (!itemId) {
    return NextResponse.json(
      { success: false, error: 'itemId is required' },
      { status: 400 }
    );
  }

  // Quick status check - forward to main API
  const mainApiUrl = `${request.nextUrl.origin}/api/moderation/queue/${itemId}`;
  
  try {
    const response = await fetch(mainApiUrl, {
      method: 'GET',
      headers: {
        'Authorization': request.headers.get('Authorization') || '',
        'X-Edge-Request': 'true'
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    
    // Return minimal claim status info for speed
    return NextResponse.json({
      success: true,
      itemId,
      claimStatus: {
        claimed: !!data.data?.claimedBy,
        claimedBy: data.data?.claimedBy,
        claimedAt: data.data?.claimedAt,
        expiresAt: data.data?.claimExpiresAt
      },
      edgeLocation: request.geo?.city || 'unknown'
    });

  } catch (error) {
    console.error('Edge claim status error:', error);
    return NextResponse.json(
      { success: false, error: 'Không thể kiểm tra trạng thái claim' },
      { status: 500 }
    );
  }
}