import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/server/firebaseAdmin';
import { verifyAuthToken } from '@/lib/server/auth-middleware';
import { ThesisPopupSettings, DEFAULT_THESIS_POPUP_SETTINGS } from '@/lib/types/thesis-popup';

const SETTINGS_DOC_ID = 'thesis_popup';

/**
 * GET /api/admin/settings/thesis-popup
 * Get thesis popup settings (public endpoint for client-side)
 */
export async function GET(request: NextRequest) {
  try {
    const adminDb = getAdminDb();

    // Get settings from Firestore
    const settingsDoc = await adminDb
      .collection('system_settings')
      .doc(SETTINGS_DOC_ID)
      .get();

    if (!settingsDoc.exists) {
      // Return default settings if not yet configured
      return NextResponse.json({
        success: true,
        data: DEFAULT_THESIS_POPUP_SETTINGS,
      });
    }

    const settings = settingsDoc.data() as ThesisPopupSettings;

    return NextResponse.json({
      success: true,
      data: settings,
    });
  } catch (error: any) {
    console.error('[ThesisPopup] Error fetching settings:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch thesis popup settings' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/settings/thesis-popup
 * Update thesis popup settings (admin only)
 */
export async function PATCH(request: NextRequest) {
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

    const body: Partial<ThesisPopupSettings> = await request.json();

    // Validate required fields if updating specific properties
    if (body.title !== undefined && !body.title.trim()) {
      return NextResponse.json(
        { success: false, error: 'Title is required' },
        { status: 400 }
      );
    }

    if (body.studentName !== undefined && !body.studentName.trim()) {
      return NextResponse.json(
        { success: false, error: 'Student name is required' },
        { status: 400 }
      );
    }

    // Get current settings
    const settingsRef = adminDb.collection('system_settings').doc(SETTINGS_DOC_ID);
    const currentDoc = await settingsRef.get();

    const currentSettings = currentDoc.exists
      ? (currentDoc.data() as ThesisPopupSettings)
      : DEFAULT_THESIS_POPUP_SETTINGS;

    // Merge with updates
    const updatedSettings: ThesisPopupSettings = {
      ...currentSettings,
      ...body,
      updatedAt: new Date().toISOString(),
      lastEditedBy: auth.user.id,
    };

    // Save to Firestore
    await settingsRef.set(updatedSettings, { merge: true });

    console.log('[ThesisPopup] Settings updated by:', auth.user.email);

    return NextResponse.json({
      success: true,
      data: updatedSettings,
      message: 'Thesis popup settings updated successfully',
    });
  } catch (error: any) {
    console.error('[ThesisPopup] Error updating settings:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update thesis popup settings' },
      { status: 500 }
    );
  }
}
