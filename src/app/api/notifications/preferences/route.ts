/**
 * Notification Preferences API
 * GET: Get user notification preferences
 * PUT: Update user notification preferences
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthToken } from '@/lib/server/auth-middleware';
import { NotificationPreferenceService } from '@/lib/server/notification-preference-service';
import { NotificationPreferences } from '@/lib/types/notifications';

export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAuthToken(request);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    const { user } = authResult;
    const preferences = await NotificationPreferenceService.getUserPreferences(user.uid);

    return NextResponse.json({
      success: true,
      data: preferences
    });
  } catch (error) {
    console.error('Error getting notification preferences:', error);
    return NextResponse.json(
      { error: 'Failed to get notification preferences' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authResult = await verifyAuthToken(request);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    const { user } = authResult;
    const updates: Partial<NotificationPreferences> = await request.json();

    // Validate updates (basic validation)
    if (updates.userId && updates.userId !== user.uid) {
      return NextResponse.json(
        { error: 'Cannot update preferences for another user' },
        { status: 403 }
      );
    }

    const updatedPreferences = await NotificationPreferenceService.updateUserPreferences(
      user.uid,
      updates
    );

    return NextResponse.json({
      success: true,
      data: updatedPreferences,
      message: 'Notification preferences updated successfully'
    });
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    return NextResponse.json(
      { error: 'Failed to update notification preferences' },
      { status: 500 }
    );
  }
}