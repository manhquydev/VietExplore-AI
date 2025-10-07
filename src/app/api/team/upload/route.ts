import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthToken } from '@/lib/server/auth-middleware';
import { getAdminStorage } from '@/lib/server/firebaseAdmin';
import sharp from 'sharp';

const adminStorage = getAdminStorage();

/**
 * POST /api/team/upload
 * Upload team member avatar or cover image
 * Admin only
 */
export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const { user } = await verifyAuthToken(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    console.log('[TEAM-UPLOAD] Upload request from admin:', user.id);

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const imageType = formData.get('type') as string; // 'avatar' or 'cover'

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Chỉ hỗ trợ định dạng JPG, PNG, WebP'
        },
        { status: 400 }
      );
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        {
          success: false,
          error: 'Kích thước file tối đa 5MB'
        },
        { status: 400 }
      );
    }

    // Read file buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Process image based on type
    let processedBuffer: Buffer;
    let width: number;
    let height: number;

    if (imageType === 'avatar') {
      // Avatar: square crop, 400x400
      width = 400;
      height = 400;
      processedBuffer = await sharp(buffer)
        .resize(width, height, {
          fit: 'cover',
          position: 'center'
        })
        .jpeg({ quality: 90 })
        .toBuffer();
    } else if (imageType === 'cover') {
      // Cover: wide format, 1200x400
      width = 1200;
      height = 400;
      processedBuffer = await sharp(buffer)
        .resize(width, height, {
          fit: 'cover',
          position: 'center'
        })
        .jpeg({ quality: 85 })
        .toBuffer();
    } else {
      // Default: standard processing
      width = 800;
      height = 800;
      processedBuffer = await sharp(buffer)
        .resize(width, height, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({ quality: 85 })
        .toBuffer();
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const filename = `team/${imageType || 'image'}_${timestamp}_${randomString}.jpg`;

    // Upload to Firebase Storage
    const bucket = adminStorage.bucket();
    const fileRef = bucket.file(filename);

    await fileRef.save(processedBuffer, {
      metadata: {
        contentType: 'image/jpeg',
        metadata: {
          uploadedBy: user.id,
          uploadedAt: new Date().toISOString(),
          imageType: imageType || 'default'
        }
      }
    });

    // Make file publicly accessible
    await fileRef.makePublic();

    // Get public URL
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`;

    console.log(`[TEAM-UPLOAD] Uploaded ${imageType}: ${publicUrl}`);

    return NextResponse.json({
      success: true,
      imageUrl: publicUrl,
      message: 'Tải ảnh lên thành công'
    });
  } catch (error: any) {
    console.error('[TEAM-UPLOAD] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to upload image'
      },
      { status: 500 }
    );
  }
}
