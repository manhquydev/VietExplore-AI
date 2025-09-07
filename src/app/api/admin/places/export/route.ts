import { NextRequest, NextResponse } from 'next/server'
import { verifyAuthToken } from '@/lib/server/auth-middleware'
import { getAdminDb } from '@/lib/server/firebaseAdmin'
import { Place } from '@/lib/types/places'
import * as XLSX from 'xlsx'

interface ExportRequest {
  placeIds?: string[]
  format?: 'xlsx' | 'csv'
  includeDetails?: boolean
}

export async function POST(request: NextRequest) {
  try {
    // Verify admin/moderator permissions
    const authResult = await verifyAuthToken(request)
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = authResult.user
    if (!['admin', 'moderator'].includes(user.role)) {
      return NextResponse.json(
        { success: false, error: 'Admin or Moderator role required' },
        { status: 403 }
      )
    }

    const body: ExportRequest = await request.json()
    const format = body.format || 'xlsx'
    const includeDetails = body.includeDetails !== false

    const adminDb = getAdminDb()
    let places: Place[] = []

    // Fetch places data
    if (body.placeIds && body.placeIds.length > 0) {
      // Export specific places
      if (body.placeIds.length > 1000) {
        return NextResponse.json(
          { success: false, error: 'Maximum 1000 places can be exported at once' },
          { status: 400 }
        )
      }

      // Batch get places (Firestore limit is 10 per batch)
      const batches = []
      for (let i = 0; i < body.placeIds.length; i += 10) {
        const batch = body.placeIds.slice(i, i + 10)
        batches.push(batch)
      }

      for (const batch of batches) {
        const promises = batch.map(id => adminDb.collection('places').doc(id).get())
        const docs = await Promise.all(promises)
        
        docs.forEach(doc => {
          if (doc.exists) {
            places.push({
              id: doc.id,
              ...doc.data()
            } as Place)
          }
        })
      }
    } else {
      // Export all places
      const snapshot = await adminDb.collection('places')
        .orderBy('createdAt', 'desc')
        .limit(5000) // Reasonable limit
        .get()
      
      snapshot.forEach(doc => {
        places.push({
          id: doc.id,
          ...doc.data()
        } as Place)
      })
    }

    if (places.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No places found to export' },
        { status: 404 }
      )
    }

    // Prepare export data
    const exportData = places.map(place => {
      const basicData = {
        'ID': place.id,
        'Tên địa điểm': place.name,
        'Mô tả ngắn': place.shortDescription || '',
        'Tỉnh/Thành': place.province,
        'Vùng miền': getRegionLabel(place.region),
        'Loại địa điểm': getTypeLabel(place.type),
        'Trạng thái': getStatusLabel(place.status),
        'Nổi bật': place.featured ? 'Có' : 'Không',
        'Lượt xem': place.viewCount || 0,
        'Lượt thích': place.likeCount || 0,
        'Báo cáo': place.reportCount || 0,
        'Người tạo': place.createdBy,
        'Ngày tạo': formatDate(place.createdAt),
        'Cập nhật cuối': formatDate(place.updatedAt)
      }

      if (includeDetails) {
        return {
          ...basicData,
          'Mô tả chi tiết': place.description || '',
          'Tags': (place.tags || []).join(', '),
          'Địa chỉ': place.address || '',
          'Kinh độ': place.coordinates?.lng || '',
          'Vĩ độ': place.coordinates?.lat || '',
          'Người kiểm duyệt': place.moderatedBy || '',
          'Ngày xuất bản': place.publishedAt ? formatDate(place.publishedAt) : '',
          'Lý do từ chối': place.rejectionReason || '',
          'Đình chỉ từ': place.suspendedAt ? formatDate(place.suspendedAt) : '',
          'Lý do đình chỉ': place.suspensionReason || '',
          'Hết đình chỉ': place.suspensionExpiresAt ? formatDate(place.suspensionExpiresAt) : '',
          'Số ảnh': place.images ? place.images.length : 0,
          'Có video': place.video ? 'Có' : 'Không'
        }
      }

      return basicData
    })

    // Create workbook
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(exportData)

    // Set column widths
    const colWidths = [
      { wch: 25 }, // ID
      { wch: 40 }, // Tên địa điểm
      { wch: 60 }, // Mô tả ngắn
      { wch: 20 }, // Tỉnh/Thành
      { wch: 15 }, // Vùng miền
      { wch: 15 }, // Loại
      { wch: 15 }, // Trạng thái
      { wch: 10 }, // Nổi bật
      { wch: 10 }, // Lượt xem
      { wch: 10 }, // Lượt thích
      { wch: 10 }, // Báo cáo
      { wch: 25 }, // Người tạo
      { wch: 20 }, // Ngày tạo
      { wch: 20 }  // Cập nhật cuối
    ]

    if (includeDetails) {
      colWidths.push(
        { wch: 80 }, // Mô tả chi tiết
        { wch: 30 }, // Tags
        { wch: 50 }, // Địa chỉ
        { wch: 15 }, // Kinh độ
        { wch: 15 }, // Vĩ độ
        { wch: 25 }, // Người kiểm duyệt
        { wch: 20 }, // Ngày xuất bản
        { wch: 50 }, // Lý do từ chối
        { wch: 20 }, // Đình chỉ từ
        { wch: 50 }, // Lý do đình chỉ
        { wch: 20 }, // Hết đình chỉ
        { wch: 10 }, // Số ảnh
        { wch: 10 }  // Có video
      )
    }

    ws['!cols'] = colWidths

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Địa điểm')

    // Add summary sheet
    const summaryData = [
      { 'Thông tin': 'Tổng số địa điểm', 'Giá trị': places.length },
      { 'Thông tin': 'Ngày xuất', 'Giá trị': formatDate(new Date().toISOString()) },
      { 'Thông tin': 'Người xuất', 'Giá trị': user.fullName || user.uid },
      { 'Thông tin': 'Bao gồm chi tiết', 'Giá trị': includeDetails ? 'Có' : 'Không' },
      { 'Thông tin': '', 'Giá trị': '' },
      { 'Thông tin': 'THỐNG KÊ THEO TRẠNG THÁI', 'Giá trị': '' }
    ]

    // Add status statistics
    const statusCounts: Record<string, number> = {}
    places.forEach(place => {
      statusCounts[place.status] = (statusCounts[place.status] || 0) + 1
    })

    Object.entries(statusCounts).forEach(([status, count]) => {
      summaryData.push({
        'Thông tin': `- ${getStatusLabel(status)}`,
        'Giá trị': count
      })
    })

    summaryData.push({ 'Thông tin': '', 'Giá trị': '' })
    summaryData.push({ 'Thông tin': 'THỐNG KÊ THEO LOẠI', 'Giá trị': '' })

    // Add type statistics
    const typeCounts: Record<string, number> = {}
    places.forEach(place => {
      typeCounts[place.type] = (typeCounts[place.type] || 0) + 1
    })

    Object.entries(typeCounts).forEach(([type, count]) => {
      summaryData.push({
        'Thông tin': `- ${getTypeLabel(type)}`,
        'Giá trị': count
      })
    })

    const summaryWs = XLSX.utils.json_to_sheet(summaryData)
    summaryWs['!cols'] = [{ wch: 30 }, { wch: 20 }]
    XLSX.utils.book_append_sheet(wb, summaryWs, 'Tổng quan')

    // Generate file buffer
    let fileBuffer: Buffer
    let mimeType: string
    let filename: string

    if (format === 'csv') {
      const csvData = XLSX.utils.sheet_to_csv(ws)
      fileBuffer = Buffer.from(csvData, 'utf8')
      mimeType = 'text/csv'
      filename = `places-export-${new Date().toISOString().split('T')[0]}.csv`
    } else {
      fileBuffer = Buffer.from(XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }))
      mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      filename = `places-export-${new Date().toISOString().split('T')[0]}.xlsx`
    }

    // Log export action
    await adminDb.collection('admin_actions').add({
      adminId: user.uid,
      adminName: user.fullName,
      action: 'export_places',
      targetType: 'place',
      details: {
        format: format,
        placesCount: places.length,
        includeDetails: includeDetails,
        specificIds: body.placeIds ? true : false
      },
      timestamp: new Date().toISOString(),
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown'
    })

    // Return file
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': mimeType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': fileBuffer.length.toString()
      }
    })

  } catch (error) {
    console.error('Error exporting places:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper functions
function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function getRegionLabel(region: string): string {
  const labels = {
    'bac-bo': 'Bắc Bộ',
    'trung-bo': 'Trung Bộ',
    'nam-bo': 'Nam Bộ'
  }
  return labels[region as keyof typeof labels] || region
}

function getTypeLabel(type: string): string {
  const labels = {
    'bien': 'Biển',
    'nui': 'Núi',
    'van-hoa': 'Văn hóa',
    'am-thuc': 'Ẩm thực',
    'check-in': 'Check-in'
  }
  return labels[type as keyof typeof labels] || type
}

function getStatusLabel(status: string): string {
  const labels = {
    'draft': 'Bản nháp',
    'submitted': 'Đã gửi',
    'in_review': 'Đang duyệt',
    'published': 'Đã xuất bản',
    'hidden': 'Ẩn',
    'temporarily_suspended': 'Đình chỉ tạm thời',
    'rejected': 'Từ chối',
    'deleted': 'Đã xóa'
  }
  return labels[status as keyof typeof labels] || status
}