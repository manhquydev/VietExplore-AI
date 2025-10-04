/**
 * View Tracker Service
 *
 * Handles unique view tracking with session-based deduplication.
 * Prevents view count inflation by tracking IP + User-Agent fingerprints.
 *
 * Architecture:
 * - Uses Firestore for persistent storage
 * - Implements 1-hour TTL cache for viewed items
 * - Atomic increments with FieldValue.increment()
 *
 * @see CLAUDE.md - View Count & Analytics Best Practices
 */

import { getAdminDb } from './firebaseAdmin';
import crypto from 'crypto';

const VIEW_CACHE_TTL = 60 * 60 * 1000; // 1 hour in milliseconds

export interface ViewFingerprint {
  ip: string;
  userAgent: string;
  sessionId?: string;
}

export interface ViewRecord {
  placeId: string;
  fingerprint: string;
  viewedAt: string;
  expiresAt: string;
  ip: string;
  userAgent: string;
}

/**
 * Generate unique fingerprint from IP + User-Agent
 * Uses SHA-256 hash for privacy and consistency
 */
export function generateFingerprint(data: ViewFingerprint): string {
  const rawString = `${data.ip}|${data.userAgent}|${data.sessionId || ''}`;
  return crypto
    .createHash('sha256')
    .update(rawString)
    .digest('hex')
    .substring(0, 32); // First 32 chars for shorter storage
}

/**
 * Check if this view should be counted (not in cache)
 * Returns true if view is unique (not seen in last hour)
 */
export async function isUniqueView(
  placeId: string,
  fingerprint: ViewFingerprint
): Promise<boolean> {
  try {
    const db = getAdminDb();
    const fingerprintHash = generateFingerprint(fingerprint);
    const now = new Date();

    // Check view_cache collection for existing view
    const cacheRef = db
      .collection('view_cache')
      .doc(`${placeId}_${fingerprintHash}`);

    const cacheDoc = await cacheRef.get();

    if (cacheDoc.exists) {
      const data = cacheDoc.data() as ViewRecord;
      const expiresAt = new Date(data.expiresAt);

      // If not expired, this is a duplicate view
      if (expiresAt > now) {
        console.log('[VIEW_TRACKER] Duplicate view blocked:', {
          placeId,
          fingerprint: fingerprintHash.substring(0, 8),
          expiresIn: Math.round((expiresAt.getTime() - now.getTime()) / 1000 / 60),
        });
        return false;
      }
    }

    // Unique view - record in cache
    const expiresAt = new Date(now.getTime() + VIEW_CACHE_TTL);

    await cacheRef.set({
      placeId,
      fingerprint: fingerprintHash,
      viewedAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      ip: fingerprint.ip,
      userAgent: fingerprint.userAgent.substring(0, 200), // Truncate UA
    });

    console.log('[VIEW_TRACKER] Unique view recorded:', {
      placeId,
      fingerprint: fingerprintHash.substring(0, 8),
      expiresAt: expiresAt.toISOString(),
    });

    return true;
  } catch (error) {
    console.error('[VIEW_TRACKER] Error checking unique view:', error);
    // On error, allow the view to be counted (fail-open)
    return true;
  }
}

/**
 * Track a view for a place with atomic increment
 * Only increments if view is unique (session-based)
 *
 * @returns Object with success status and new view count
 */
export async function trackPlaceView(
  placeId: string,
  fingerprint: ViewFingerprint
): Promise<{ success: boolean; viewCount: number; isUnique: boolean }> {
  try {
    const db = getAdminDb();

    // Check if view is unique
    const isUnique = await isUniqueView(placeId, fingerprint);

    if (!isUnique) {
      // Get current view count without incrementing
      const placeDoc = await db.collection('places').doc(placeId).get();

      if (!placeDoc.exists) {
        return { success: false, viewCount: 0, isUnique: false };
      }

      const placeData = placeDoc.data();
      return {
        success: true,
        viewCount: placeData?.viewCount || 0,
        isUnique: false,
      };
    }

    // Unique view - increment atomically
    // Using FieldValue.increment() for thread-safe atomic operation
    const FieldValue = await import('firebase-admin').then(
      (m) => m.firestore.FieldValue
    );

    await db
      .collection('places')
      .doc(placeId)
      .update({
        viewCount: FieldValue.increment(1),
        lastViewedAt: new Date().toISOString(),
      });

    // Sync to Realtime Database (non-blocking)
    syncToRealtimeDB(placeId, 1).catch((error) => {
      console.warn('[VIEW_TRACKER] Realtime DB sync failed:', error);
    });

    // Get updated view count
    const updatedDoc = await db.collection('places').doc(placeId).get();
    const updatedData = updatedDoc.data();

    console.log('[VIEW_TRACKER] View counted successfully:', {
      placeId,
      newViewCount: updatedData?.viewCount || 0,
    });

    return {
      success: true,
      viewCount: updatedData?.viewCount || 1,
      isUnique: true,
    };
  } catch (error) {
    console.error('[VIEW_TRACKER] Error tracking view:', error);
    return { success: false, viewCount: 0, isUnique: false };
  }
}

/**
 * Sync view count to Realtime Database for real-time updates
 * This is async and non-blocking
 */
async function syncToRealtimeDB(placeId: string, increment: number): Promise<void> {
  try {
    const { RealtimeService } = await import('@/lib/firebase/realtime');
    await RealtimeService.updatePlaceStats(placeId, 'views', increment);
  } catch (error) {
    console.error('[VIEW_TRACKER] Realtime DB sync error:', error);
    throw error;
  }
}

/**
 * Clean up expired view cache entries
 * Should be called periodically (e.g., via cron job)
 */
export async function cleanupExpiredViewCache(): Promise<number> {
  try {
    const db = getAdminDb();
    const now = new Date().toISOString();

    const expiredDocs = await db
      .collection('view_cache')
      .where('expiresAt', '<', now)
      .limit(500) // Process in batches to avoid timeout
      .get();

    if (expiredDocs.empty) {
      return 0;
    }

    // Delete expired entries in batch
    const batch = db.batch();
    expiredDocs.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();

    console.log('[VIEW_TRACKER] Cleaned up expired cache:', {
      deleted: expiredDocs.size,
    });

    return expiredDocs.size;
  } catch (error) {
    console.error('[VIEW_TRACKER] Error cleaning up cache:', error);
    return 0;
  }
}

/**
 * Get view statistics for a place
 * Includes total views and unique views (last 24h)
 */
export async function getViewStats(placeId: string): Promise<{
  totalViews: number;
  uniqueViewsLast24h: number;
}> {
  try {
    const db = getAdminDb();

    // Get total views from place document
    const placeDoc = await db.collection('places').doc(placeId).get();
    const totalViews = placeDoc.data()?.viewCount || 0;

    // Count unique views in last 24 hours
    const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const recentViews = await db
      .collection('view_cache')
      .where('placeId', '==', placeId)
      .where('viewedAt', '>=', last24h)
      .count()
      .get();

    return {
      totalViews,
      uniqueViewsLast24h: recentViews.data().count,
    };
  } catch (error) {
    console.error('[VIEW_TRACKER] Error getting view stats:', error);
    return {
      totalViews: 0,
      uniqueViewsLast24h: 0,
    };
  }
}

/**
 * Extract IP address from Next.js request headers
 * Handles various proxy configurations
 */
export function getClientIP(headers: Headers): string {
  // Try various headers in order of preference
  const forwardedFor = headers.get('x-forwarded-for');
  if (forwardedFor) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return forwardedFor.split(',')[0].trim();
  }

  const realIP = headers.get('x-real-ip');
  if (realIP) {
    return realIP.trim();
  }

  const cfConnectingIP = headers.get('cf-connecting-ip'); // Cloudflare
  if (cfConnectingIP) {
    return cfConnectingIP.trim();
  }

  // Fallback to unknown
  return 'unknown';
}

/**
 * Extract User-Agent from Next.js request headers
 */
export function getUserAgent(headers: Headers): string {
  return headers.get('user-agent') || 'unknown';
}
