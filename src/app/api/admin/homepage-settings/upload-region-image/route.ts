import { NextRequest, NextResponse } from 'next/server'
import { verifyAuthToken } from '@/lib/server/auth-middleware'
import { adminStorage } from '@/lib/firebase-admin'
import { v4 as uuidv4 } from 'uuid'
import sharp from 'sharp'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const TARGET_WIDTH = 800
const TARGET_HEIGHT = 500

// POST - Upload ảnh cho region
export async function POST(request: NextRequest) {
  console.log('[API Upload] Starting upload request...')

  try {
    // Verify authentication and admin role
    console.log('[API Upload] Verifying authentication...')
    const auth = await verifyAuthToken(request)
    if (!auth.success || !auth.user) {
      console.error('[API Upload] Authentication failed')
      return NextResponse.json({
        success: false,
        error: 'Unauthorized'
      }, { status: 401 })
    }

    // Check if user has admin role
    if (auth.user.role !== 'admin') {
      console.error('[API Upload] User is not admin:', auth.user.role)
      return NextResponse.json({
        success: false,
        error: 'Admin access required'
      }, { status: 403 })
    }

    console.log('[API Upload] Parsing FormData...')
    const formData = await request.formData()
    const file = formData.get('file') as File
    const region = formData.get('region') as string

    console.log('[API Upload] Received file:', file?.name, 'size:', file?.size, 'type:', file?.type)
    console.log('[API Upload] Region:', region)

    // Validate inputs
    if (!file) {
      return NextResponse.json({ 
        success: false, 
        error: 'No file provided' 
      }, { status: 400 })
    }

    if (!region || !['bac-bo', 'trung-bo', 'nam-bo'].includes(region)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid region specified' 
      }, { status: 400 })
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed' 
      }, { status: 400 })
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ 
        success: false, 
        error: 'File too large. Maximum size is 5MB' 
      }, { status: 400 })
    }

    // Convert file to buffer
    console.log('[API Upload] Converting file to buffer...')
    const buffer = Buffer.from(await file.arrayBuffer())
    console.log('[API Upload] Buffer size:', buffer.length)

    try {
      // Process image with Sharp - resize and optimize
      console.log('[API Upload] Processing image with Sharp...')
      const processedBuffer = await sharp(buffer)
        .resize(TARGET_WIDTH, TARGET_HEIGHT, {
          fit: 'cover',
          position: 'center'
        })
        .jpeg({
          quality: 85,
          progressive: true
        })
        .toBuffer()

      console.log('[API Upload] Image processed, new size:', processedBuffer.length)

      // Generate unique filename
      const fileExtension = 'jpg' // Always save as JPEG after processing
      const fileName = `homepage/regions/${region}/${uuidv4()}.${fileExtension}`
      console.log('[API Upload] Generated filename:', fileName)

      // Upload to Firebase Storage
      const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'vietexplore-ai.firebasestorage.app'
      console.log('[API Upload] Uploading to bucket:', bucketName)

      const bucket = adminStorage.bucket(bucketName)
      const fileRef = bucket.file(fileName)

      console.log('[API Upload] Saving file to Firebase Storage...')
      await fileRef.save(processedBuffer, {
        metadata: {
          contentType: 'image/jpeg',
          metadata: {
            originalName: file.name,
            uploadedBy: auth.user.id || auth.user.uid, // Use id (from auth middleware) or uid as fallback
            uploadedAt: new Date().toISOString(),
            region: region
          }
        }
      })

      console.log('[API Upload] Making file public...')
      // Make file publicly readable
      await fileRef.makePublic()

      // Get public URL
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`
      console.log('[API Upload] Upload successful! Public URL:', publicUrl)

      return NextResponse.json({
        success: true,
        data: {
          imageUrl: publicUrl,
          fileName: fileName,
          region: region
        },
        message: 'Image uploaded successfully'
      })

    } catch (imageError: any) {
      console.error('[API Upload] Image processing error:', imageError)
      console.error('[API Upload] Error details:', {
        message: imageError?.message,
        code: imageError?.code,
        stack: imageError?.stack
      })
      return NextResponse.json({
        success: false,
        error: `Failed to process image: ${imageError?.message || 'Unknown error'}`
      }, { status: 500 })
    }

  } catch (error: any) {
    console.error('[API Upload] Fatal error:', error)
    console.error('[API Upload] Error details:', {
      message: error?.message,
      code: error?.code,
      stack: error?.stack
    })
    return NextResponse.json({
      success: false,
      error: `Internal server error: ${error?.message || 'Unknown error'}`
    }, { status: 500 })
  }
}