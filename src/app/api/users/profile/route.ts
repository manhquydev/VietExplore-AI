import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthToken } from '@/lib/server/auth-middleware';
import { getAdminDb, getAdminAuth } from '@/lib/server/firebaseAdmin';
import { z } from 'zod';
import validator from 'validator';

// Validation schema using Zod
const profileUpdateSchema = z.object({
  fullName: z.string().min(2, 'Họ tên phải có ít nhất 2 ký tự').max(100, 'Họ tên không được vượt quá 100 ký tự').optional().or(z.literal('')),
  profile: z.object({
    bio: z.string().max(500, 'Giới thiệu không được vượt quá 500 ký tự').optional().or(z.literal('')),
    location: z.string().max(100, 'Địa điểm không được vượt quá 100 ký tự').optional().or(z.literal('')),
    website: z.string().refine(
      (val) => !val || val === '' || validator.isURL(val, { require_protocol: true }),
      { message: 'Website phải là URL hợp lệ (bắt đầu với http:// hoặc https://)' }
    ).optional().or(z.literal('')),
    socialLinks: z.object({
      facebook: z.string().optional(),
      instagram: z.string().optional(),
    }).optional()
  }).optional()
});

// Rate limiting: Track requests per user
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 10; // 10 requests
const RATE_WINDOW = 60 * 1000; // per 60 seconds

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const userLimit = rateLimitMap.get(userId);

  if (!userLimit || now > userLimit.resetTime) {
    // Reset or create new limit
    rateLimitMap.set(userId, { count: 1, resetTime: now + RATE_WINDOW });
    return true;
  }

  if (userLimit.count >= RATE_LIMIT) {
    return false;
  }

  userLimit.count++;
  return true;
}

export async function PATCH(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await verifyAuthToken(request);

    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        {
          success: false,
          error: authResult.error || 'Không có quyền truy cập'
        },
        { status: 401 }
      );
    }

    const userId = authResult.user.id;

    // Check rate limit
    if (!checkRateLimit(userId)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Quá nhiều yêu cầu. Vui lòng thử lại sau.'
        },
        { status: 429 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = profileUpdateSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Dữ liệu không hợp lệ',
          details: validationResult.error.errors.map(e => e.message)
        },
        { status: 400 }
      );
    }

    const { fullName, profile } = validationResult.data;

    // Prepare update data
    const updateData: any = {
      updatedAt: new Date().toISOString()
    };

    if (fullName !== undefined) {
      updateData.fullName = fullName;
      updateData.displayName = fullName; // Sync with displayName
    }

    if (profile !== undefined) {
      // Merge with existing profile data
      updateData.profile = profile;
    }

    // Update Firestore
    const adminDb = getAdminDb();
    await adminDb.collection('users').doc(userId).update(updateData);

    // Update Firebase Auth profile if fullName changed
    if (fullName !== undefined) {
      try {
        const adminAuth = getAdminAuth();
        await adminAuth.updateUser(userId, {
          displayName: fullName
        });
      } catch (authError) {
        console.error('Error updating Firebase Auth profile:', authError);
        // Don't fail the request if auth update fails
      }
    }

    // Get updated user data
    const userDoc = await adminDb.collection('users').doc(userId).get();
    const userData = userDoc.data();

    return NextResponse.json({
      success: true,
      message: 'Cập nhật profile thành công',
      user: {
        id: userId,
        ...userData
      }
    });

  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Không thể cập nhật profile'
      },
      { status: 500 }
    );
  }
}