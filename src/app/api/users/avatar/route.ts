import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthToken } from '@/lib/server/auth-middleware';
import { getAdminDb, getAdminAuth, getAdminStorage } from '@/lib/server/firebaseAdmin';
import sharp from 'sharp';

// Constants
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const AVATAR_SIZE = 400; // 400x400px

// Rate limiting
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 5; // 5 uploads
const RATE_WINDOW = 60 * 1000; // per 60 seconds

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const userLimit = rateLimitMap.get(userId);

  if (!userLimit || now > userLimit.resetTime) {
    rateLimitMap.set(userId, { count: 1, resetTime: now + RATE_WINDOW });
    return true;
  }

  if (userLimit.count >= RATE_LIMIT) {
    return false;
  }

  userLimit.count++;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    console.log('[Avatar Upload] Starting upload process...');

    // Verify authentication
    const authResult = await verifyAuthToken(request);

    if (!authResult.success || !authResult.user) {
      console.error('[Avatar Upload] Auth failed:', authResult.error);
      return NextResponse.json(
        {
          success: false,
          error: authResult.error || 'Không có quyền truy cập'
        },
        { status: 401 }
      );
    }

    const userId = authResult.user.id;
    console.log('[Avatar Upload] User authenticated:', userId);

    // Check rate limit
    if (!checkRateLimit(userId)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Quá nhiều yêu cầu tải ảnh. Vui lòng thử lại sau.'
        },
        { status: 429 }
      );
    }

    // Parse FormData
    const formData = await request.formData();
    const file = formData.get('avatar') as File;

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          error: 'Không tìm thấy file ảnh'
        },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Chỉ hỗ trợ file JPG, PNG và WebP'
        },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error: 'Kích thước file không được vượt quá 5MB'
        },
        { status: 400 }
      );
    }

    // Convert file to buffer
    console.log('[Avatar Upload] Converting file to buffer...');
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    console.log('[Avatar Upload] Buffer size:', buffer.length);

    // Resize and compress image using Sharp
    console.log('[Avatar Upload] Starting Sharp processing...');
    let processedImage: Buffer;
    try {
      processedImage = await sharp(buffer)
        .resize(AVATAR_SIZE, AVATAR_SIZE, {
          fit: 'cover',
          position: 'center'
        })
        .jpeg({ quality: 85 }) // Convert to JPEG with 85% quality
        .toBuffer();
      console.log('[Avatar Upload] Sharp processing completed. Size:', processedImage.length);
    } catch (sharpError: any) {
      console.error('[Avatar Upload] Sharp error:', sharpError);
      throw new Error(`Image processing failed: ${sharpError.message}`);
    }

    // Generate unique filename
    const timestamp = Date.now();
    const filename = `avatar-${timestamp}.jpg`;
    const storagePath = `users/${userId}/profile/${filename}`;

    // Get Admin Storage
    console.log('[Avatar Upload] Getting Firebase Storage bucket...');
    let bucket;
    try {
      bucket = getAdminStorage().bucket();
      console.log('[Avatar Upload] Bucket name:', bucket.name);
    } catch (storageError: any) {
      console.error('[Avatar Upload] Storage error:', storageError);
      throw new Error(`Storage initialization failed: ${storageError.message}`);
    }

    // Delete old avatar if exists
    const adminDb = getAdminDb();
    const userDoc = await adminDb.collection('users').doc(userId).get();
    const userData = userDoc.data();

    if (userData?.avatar) {
      try {
        // Extract path from URL
        const oldPath = decodeURIComponent(userData.avatar.split('/o/')[1]?.split('?')[0]);
        if (oldPath && oldPath.startsWith(`users/${userId}/profile/`)) {
          await bucket.file(oldPath).delete();
          console.log('Deleted old avatar:', oldPath);
        }
      } catch (deleteError) {
        console.error('Error deleting old avatar:', deleteError);
        // Don't fail if old avatar deletion fails
      }
    }

    // Upload new avatar
    const file_bucket = bucket.file(storagePath);
    await file_bucket.save(processedImage, {
      metadata: {
        contentType: 'image/jpeg',
        metadata: {
          uploadedBy: userId,
          uploadedAt: new Date().toISOString()
        }
      }
    });

    // Make file publicly accessible
    await file_bucket.makePublic();

    // Get public URL
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${storagePath}`;

    // Update Firestore
    await adminDb.collection('users').doc(userId).update({
      avatar: publicUrl,
      photoURL: publicUrl,
      updatedAt: new Date().toISOString()
    });

    // Update Firebase Auth
    try {
      const adminAuth = getAdminAuth();
      await adminAuth.updateUser(userId, {
        photoURL: publicUrl
      });
    } catch (authError) {
      console.error('Error updating Firebase Auth photoURL:', authError);
      // Don't fail the request if auth update fails
    }

    return NextResponse.json({
      success: true,
      message: 'Cập nhật ảnh đại diện thành công',
      avatarUrl: publicUrl
    });

  } catch (error: any) {
    console.error('[Avatar Upload] ERROR:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });

    // Handle specific Sharp errors
    if (error.message?.includes('Input file') || error.message?.includes('unsupported') || error.message?.includes('Image processing failed')) {
      return NextResponse.json(
        {
          success: false,
          error: `File ảnh không hợp lệ: ${error.message}`
        },
        { status: 400 }
      );
    }

    // Handle storage errors
    if (error.message?.includes('Storage initialization failed')) {
      return NextResponse.json(
        {
          success: false,
          error: `Lỗi kết nối Firebase Storage: ${error.message}`
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: `Không thể tải lên ảnh đại diện: ${error.message}`
      },
      { status: 500 }
    );
  }
}