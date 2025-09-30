import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    // Test Sharp
    const sharp = require('sharp');
    const sharpVersion = sharp.versions;

    // Test Firebase Admin
    const { getAdminStorage } = await import('@/lib/server/firebaseAdmin');
    const storage = getAdminStorage();
    const bucket = storage.bucket();
    const bucketName = bucket.name;

    return NextResponse.json({
      success: true,
      sharp: {
        available: true,
        versions: sharpVersion
      },
      firebase: {
        bucketName,
        bucketExists: true
      }
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}