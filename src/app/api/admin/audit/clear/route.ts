import { NextRequest, NextResponse } from 'next/server'
import { verifyAuthToken } from '@/lib/server/auth-middleware'
import { getDatabase } from 'firebase-admin/database'

export async function DELETE(request: NextRequest) {
  try {
    const { user, error } = await verifyAuthToken(request)
    
    if (error || !user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Only admin can clear audit data
    if (user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      )
    }

    const realtimeDb = getDatabase()
    
    // Clear all audit logs
    const auditLogsRef = realtimeDb.ref('audit_logs')
    await auditLogsRef.remove()
    
    // Clear audit stats
    const auditStatsRef = realtimeDb.ref('audit_stats')
    await auditStatsRef.remove()
    
    console.log('Old audit data cleared by admin:', user.email)
    
    return NextResponse.json({
      success: true,
      message: 'Đã xóa tất cả dữ liệu audit cũ'
    })
    
  } catch (error: any) {
    console.error('Error clearing audit data:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}