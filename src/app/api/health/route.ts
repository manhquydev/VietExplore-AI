/**
 * Health Check API Endpoint
 *
 * Used by:
 * - Docker HEALTHCHECK directive
 * - Load balancers (Kubernetes, AWS ELB, etc.)
 * - Monitoring systems (Datadog, New Relic, etc.)
 * - Uptime monitors (Pingdom, UptimeRobot, etc.)
 *
 * Returns 200 OK if service is healthy, 503 Service Unavailable otherwise
 */

import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/server/firebaseAdmin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic'; // Always execute (no caching)

/**
 * GET /api/health
 *
 * Performs comprehensive health checks:
 * 1. Application is running (if this executes, server is responding)
 * 2. Firebase Firestore connectivity (critical dependency)
 * 3. Environment variables loaded (basic config check)
 *
 * @returns {Response} 200 OK with health status, or 503 Service Unavailable
 */
export async function GET() {
  const startTime = Date.now();
  const checks: Record<string, { status: 'ok' | 'error'; message?: string; latency?: number }> = {};

  try {
    // ============================================
    // Check 1: Application Status
    // ============================================
    checks.application = {
      status: 'ok',
      message: 'Next.js server is running',
    };

    // ============================================
    // Check 2: Environment Variables
    // ============================================
    const requiredEnvVars = [
      'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
      'FIREBASE_PROJECT_ID',
    ];

    const missingEnvVars = requiredEnvVars.filter(
      (varName) => !process.env[varName]
    );

    if (missingEnvVars.length > 0) {
      checks.environment = {
        status: 'error',
        message: `Missing environment variables: ${missingEnvVars.join(', ')}`,
      };
    } else {
      checks.environment = {
        status: 'ok',
        message: 'All critical environment variables loaded',
      };
    }

    // ============================================
    // Check 3: Firebase Firestore Connectivity
    // ============================================
    try {
      const firestoreStartTime = Date.now();

      // Simple read operation to test connectivity
      // Uses minimal read (single document from users collection)
      await adminDb.collection('users').limit(1).get();

      const firestoreLatency = Date.now() - firestoreStartTime;

      checks.firestore = {
        status: 'ok',
        message: 'Firebase Firestore connection successful',
        latency: firestoreLatency,
      };
    } catch (firestoreError) {
      checks.firestore = {
        status: 'error',
        message: `Firestore connection failed: ${firestoreError instanceof Error ? firestoreError.message : 'Unknown error'}`,
      };
    }

    // ============================================
    // Determine Overall Health Status
    // ============================================
    const allChecksOk = Object.values(checks).every(
      (check) => check.status === 'ok'
    );

    const totalLatency = Date.now() - startTime;

    // If any critical check fails, return 503
    if (!allChecksOk) {
      return NextResponse.json(
        {
          status: 'unhealthy',
          timestamp: new Date().toISOString(),
          checks,
          latency: totalLatency,
          version: process.env.npm_package_version || '3.0.0',
        },
        { status: 503 } // Service Unavailable
      );
    }

    // All checks passed - return 200 OK
    return NextResponse.json(
      {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        checks,
        latency: totalLatency,
        version: process.env.npm_package_version || '3.0.0',
        uptime: process.uptime(),
        memory: {
          usage: process.memoryUsage(),
          heapUsed: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB`,
          heapTotal: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)} MB`,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    // Unexpected error during health check
    console.error('[HEALTH CHECK] Unexpected error:', error);

    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
        checks,
        latency: Date.now() - startTime,
      },
      { status: 503 }
    );
  }
}

/**
 * HEAD /api/health
 *
 * Lightweight health check for load balancers
 * Returns only status code, no body
 *
 * @returns {Response} 200 OK or 503 Service Unavailable
 */
export async function HEAD() {
  try {
    // Quick check - just verify server is responding
    // No database checks for performance
    return new NextResponse(null, { status: 200 });
  } catch {
    return new NextResponse(null, { status: 503 });
  }
}

/**
 * Usage Examples:
 *
 * 1. Docker Healthcheck:
 *    HEALTHCHECK CMD curl -f http://localhost:3000/api/health || exit 1
 *
 * 2. Kubernetes Liveness Probe:
 *    livenessProbe:
 *      httpGet:
 *        path: /api/health
 *        port: 3000
 *      initialDelaySeconds: 10
 *      periodSeconds: 30
 *
 * 3. Kubernetes Readiness Probe:
 *    readinessProbe:
 *      httpGet:
 *        path: /api/health
 *        port: 3000
 *      initialDelaySeconds: 5
 *      periodSeconds: 10
 *
 * 4. Load Balancer (AWS ALB):
 *    Health Check Path: /api/health
 *    Success Codes: 200
 *    Timeout: 5 seconds
 *    Interval: 30 seconds
 *
 * 5. Uptime Monitor (Pingdom):
 *    URL: https://your-domain.com/api/health
 *    Check Interval: 1 minute
 *    Expected Response: 200 OK
 */
