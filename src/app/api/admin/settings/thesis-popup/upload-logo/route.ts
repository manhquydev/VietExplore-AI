import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb, getAdminStorage } from '@/lib/server/firebaseAdmin';
import { verifyAuthToken } from '@/lib/server/auth-middleware';

const SETTINGS_DOC_ID = 'thesis_popup';

/**
 * POST /api/admin/settings/thesis-popup/upload-logo
 * Upload university logo for thesis popup (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const adminDb = getAdminDb();
    const storage = getAdminStorage();

    // Verify admin authentication
    const auth = await verifyAuthToken(request);
    if (!auth.success || !auth.user || auth.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('logo') as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Only JPG, PNG, WebP, SVG allowed' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: 'File too large. Maximum size is 5MB' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const fileName = `thesis-popup/university-logo-${timestamp}.${fileExtension}`;

    // Upload to Firebase Storage
    const bucket = storage.bucket();
    const fileRef = bucket.file(fileName);

    await fileRef.save(buffer, {
      metadata: {
        contentType: file.type,
        metadata: {
          uploadedBy: auth.user.id,
          uploadedAt: new Date().toISOString(),
          originalName: file.name,
        },
      },
    });

    // Make file publicly accessible
    await fileRef.makePublic();

    // Get public URL
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;

    // Update thesis popup settings with new logo URL
    const settingsRef = adminDb.collection('system_settings').doc(SETTINGS_DOC_ID);
    await settingsRef.set(
      {
        universityLogoUrl: publicUrl,
        updatedAt: new Date().toISOString(),
        lastEditedBy: auth.user.id,
      },
      { merge: true }
    );

    console.log('[ThesisPopup] Logo uploaded:', publicUrl, 'by:', auth.user.email);

    return NextResponse.json({
      success: true,
      data: {
        logoUrl: publicUrl,
        fileName,
      },
      message: 'Logo uploaded successfully',
    });
  } catch (error: any) {
    console.error('[ThesisPopup] Error uploading logo:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to upload logo' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/settings/thesis-popup/upload-logo
 * Delete university logo (admin only)
 */
export async function DELETE(request: NextRequest) {
  try {
    const adminDb = getAdminDb();

    // Verify admin authentication
    const auth = await verifyAuthToken(request);
    if (!auth.success || !auth.user || auth.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    // Remove logo URL from settings
    const settingsRef = adminDb.collection('system_settings').doc(SETTINGS_DOC_ID);
    await settingsRef.update({
      universityLogoUrl: null,
      updatedAt: new Date().toISOString(),
      lastEditedBy: auth.user.id,
    });

    console.log('[ThesisPopup] Logo removed by:', auth.user.email);

    return NextResponse.json({
      success: true,
      message: 'Logo removed successfully',
    });
  } catch (error: any) {
    console.error('[ThesisPopup] Error deleting logo:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete logo' },
      { status: 500 }
    );
  }
}
