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
  try {
    // Verify authentication and admin role
    const auth = await verifyAuthToken(request)
    if (!auth.success || !auth.user) {
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized' 
      }, { status: 401 })
    }

    // Check if user has admin role
    if (auth.user.role !== 'admin') {
      return NextResponse.json({ 
        success: false, 
        error: 'Admin access required' 
      }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const region = formData.get('region') as string

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
    const buffer = Buffer.from(await file.arrayBuffer())

    try {
      // Process image with Sharp - resize and optimize
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

      // Generate unique filename
      const fileExtension = 'jpg' // Always save as JPEG after processing
      const fileName = `homepage/regions/${region}/${uuidv4()}.${fileExtension}`

      // Upload to Firebase Storage
      const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'vietexplore-ai.firebasestorage.app'
      const bucket = adminStorage.bucket(bucketName)
      const fileRef = bucket.file(fileName)

      await fileRef.save(processedBuffer, {
        metadata: {
          contentType: 'image/jpeg',
          metadata: {
            originalName: file.name,
            uploadedBy: auth.user.uid,
            uploadedAt: new Date().toISOString(),
            region: region
          }
        }
      })

      // Make file publicly readable
      await fileRef.makePublic()

      // Get public URL
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`

      return NextResponse.json({
        success: true,
        data: {
          imageUrl: publicUrl,
          fileName: fileName,
          region: region
        },
        message: 'Image uploaded successfully'
      })

    } catch (imageError) {
      console.error('Image processing error:', imageError)
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to process image' 
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Error uploading region image:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}