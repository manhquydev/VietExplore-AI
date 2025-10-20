import { NextRequest, NextResponse } from 'next/server'
import { verifyAuthToken } from '@/lib/server/auth-middleware'
import { adminDb } from '@/lib/firebase-admin'

const ADMIN_SETTINGS_DOC = 'admin_settings'

// Default homepage settings
const defaultHomepageSettings = {
  regions: {
    "bac-bo": {
      name: "Miền Bắc",
      description: "Khám phá văn hóa lịch sử và cảnh quan hùng vĩ",
      imageUrl: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=400&h=250&fit=crop",
      href: "/places/regions/bac-bo"
    },
    "trung-bo": {
      name: "Miền Trung", 
      description: "Di sản văn hóa và bãi biển tuyệt đẹp",
      imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=250&fit=crop",
      href: "/places/regions/trung-bo"
    },
    "nam-bo": {
      name: "Miền Nam",
      description: "Đồng bằng sông Cửu Long và thành phố năng động", 
      imageUrl: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=250&fit=crop",
      href: "/places/regions/nam-bo"
    }
  }
}

// GET - Lấy cấu hình homepage (public access)
export async function GET(request: NextRequest) {
  try {
    // Allow public access for homepage settings
    // Only restrict write operations to admin

    // Get homepage settings from Firestore
    const settingsDoc = await adminDb.collection('admin_settings').doc(ADMIN_SETTINGS_DOC).get()

    if (!settingsDoc.exists) {
      // Return default settings if no custom settings exist
      return NextResponse.json({
        success: true,
        data: { homepage: defaultHomepageSettings }
      })
    }

    const settings = settingsDoc.data()
    
    return NextResponse.json({
      success: true,
      data: {
        homepage: settings?.homepage || defaultHomepageSettings
      }
    })

  } catch (error) {
    console.error('Error fetching homepage settings:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

// PUT - Cập nhật cấu hình homepage
export async function PUT(request: NextRequest) {
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

    const body = await request.json()
    const { homepage } = body

    if (!homepage || !homepage.regions) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid homepage settings format' 
      }, { status: 400 })
    }

    // Validate regions structure
    const requiredRegions = ['bac-bo', 'trung-bo', 'nam-bo']
    for (const region of requiredRegions) {
      if (!homepage.regions[region]) {
        return NextResponse.json({ 
          success: false, 
          error: `Missing region configuration: ${region}` 
        }, { status: 400 })
      }

      const regionData = homepage.regions[region]
      if (!regionData.name || !regionData.description || !regionData.imageUrl) {
        return NextResponse.json({ 
          success: false, 
          error: `Incomplete region configuration for: ${region}` 
        }, { status: 400 })
      }
    }

    // Update settings in Firestore
    const settingsRef = adminDb.collection('admin_settings').doc(ADMIN_SETTINGS_DOC)

    const updateData = {
      homepage,
      updatedAt: new Date().toISOString(),
      updatedBy: auth.user.id || auth.user.uid // Use id (from auth middleware) or uid as fallback
    }

    await settingsRef.set(updateData, { merge: true })

    console.log('[API] Homepage settings saved to Firestore:', {
      regions: Object.keys(homepage.regions),
      updatedBy: auth.user.uid,
      timestamp: updateData.updatedAt
    })

    // Return updated data to ensure client has latest version
    return NextResponse.json({
      success: true,
      message: 'Homepage settings updated successfully',
      data: {
        homepage,
        updatedAt: updateData.updatedAt
      }
    })

  } catch (error) {
    console.error('Error updating homepage settings:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}