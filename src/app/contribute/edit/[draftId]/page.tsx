"use client"

import { useEffect, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/components/auth/auth-provider'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card-custom'
import { apiClient } from '@/lib/client/api'
import { PlaceFormData } from '@/lib/types/places'

export default function EditDraftPage() {
  const { draftId } = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, isAuthenticated } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const [draft, setDraft] = useState<any>(null)
  
  // Check if this is editing a published place
  const editingPublishedId = searchParams.get('editing')

  useEffect(() => {
    if (!isAuthenticated) {
      router.push(`/auth/login?redirect=/contribute/edit/${draftId}`)
      return
    }

    loadDraft()
  }, [isAuthenticated, draftId])

  const loadDraft = async () => {
    try {
      setLoading(true)
      setError('')
      
      // Get the draft by ID using the dedicated drafts endpoint
      const result = await apiClient.places.drafts.getById(draftId as string)
      
      if (result.success && result.data) {
        // Check if it can be edited and belongs to current user
        const editableStatuses = ['draft', 'submitted', 'rejected'];
        
        // Special handling for edit drafts from published places
        const isEditingPublished = result.data.isEditingPublished || editingPublishedId
        
        if (!isEditingPublished && !editableStatuses.includes(result.data.status)) {
          setError('Không thể chỉnh sửa địa điểm đang được duyệt hoặc đã xuất bản')
          return
        }
        
        if (result.data.createdBy !== user?.id) {
          setError('Bạn không có quyền chỉnh sửa bản nháp này')
          return
        }
        
        setDraft(result.data)
      } else {
        setError('Không tìm thấy bản nháp hoặc bạn không có quyền truy cập')
      }
    } catch (err: any) {
      setError('Có lỗi xảy ra khi tải bản nháp: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleEditRedirect = () => {
    // Redirect to the main contribute page with draft data pre-filled
    // We'll pass the draft ID as a query parameter so the form can load it
    router.push(`/contribute/new-place?editDraft=${draftId}`)
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-4">Đang chuyển hướng...</h1>
          <p className="text-muted-foreground">
            Vui lòng đăng nhập để tiếp tục
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            {editingPublishedId || draft?.isEditingPublished ? (
              <>
                <h1 className="text-3xl font-bold mb-2">Chỉnh sửa địa điểm đã xuất bản</h1>
                <p className="text-muted-foreground">
                  Chỉnh sửa địa điểm đã xuất bản. Sau khi hoàn thành, bản chỉnh sửa sẽ được gửi để kiểm duyệt.
                </p>
                {editingPublishedId && (
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2 text-blue-800">
                      <span className="text-lg">ℹ️</span>
                      <p className="font-medium">
                        Bạn đang chỉnh sửa địa điểm đã xuất bản. Nội dung gốc vẫn hiển thị công khai cho đến khi bản chỉnh sửa được duyệt.
                      </p>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                <h1 className="text-3xl font-bold mb-2">Chỉnh sửa bản nháp</h1>
                <p className="text-muted-foreground">
                  Tiếp tục chỉnh sửa bản nháp địa điểm của bạn
                </p>
              </>
            )}
          </div>

          {loading && (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">⏳</div>
              <h3 className="text-xl font-semibold mb-2">Đang tải...</h3>
              <p className="text-muted-foreground">
                Vui lòng chờ trong giây lát
              </p>
            </div>
          )}

          {error && (
            <Card>
              <CardContent className="p-8">
                <div className="text-center">
                  <div className="text-6xl mb-4">⚠️</div>
                  <h3 className="text-xl font-semibold mb-2 text-destructive">
                    Có lỗi xảy ra
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    {error}
                  </p>
                  <div className="flex gap-4 justify-center">
                    <Button variant="outline" onClick={() => router.back()}>
                      Quay lại
                    </Button>
                    <Button onClick={() => router.push('/contribute/my-drafts')}>
                      Về trang bản nháp
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {draft && !error && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  📝 {draft.name || 'Bản nháp chưa có tên'}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Tạo lúc: {new Date(draft.createdAt).toLocaleString('vi-VN')} • 
                  Cập nhật: {new Date(draft.updatedAt).toLocaleString('vi-VN')}
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-2">Thông tin cơ bản</h4>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Tên:</span> {draft.name || 'Chưa nhập'}</p>
                      <p><span className="font-medium">Loại:</span> {draft.type || 'Chưa chọn'}</p>
                      <p><span className="font-medium">Vùng:</span> {draft.region || 'Chưa chọn'}</p>
                      <p><span className="font-medium">Tỉnh/thành:</span> {draft.province || 'Chưa chọn'}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Mô tả</h4>
                    <p className="text-sm text-muted-foreground">
                      {draft.shortDescription || 'Chưa có mô tả ngắn'}
                    </p>
                    {draft.description && (
                      <p className="text-sm text-muted-foreground mt-2">
                        {draft.description.length > 100 
                          ? draft.description.substring(0, 100) + '...' 
                          : draft.description
                        }
                      </p>
                    )}
                  </div>
                </div>

                {draft.images && draft.images.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Hình ảnh ({draft.images.length})</h4>
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                      {draft.images.slice(0, 6).map((image: string, index: number) => (
                        <div key={index} className="aspect-square rounded-md bg-muted overflow-hidden">
                          <img 
                            src={image} 
                            alt={`Image ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-4 pt-4">
                  <Button onClick={handleEditRedirect} className="flex-1">
                    📝 Chỉnh sửa bản nháp
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => router.push('/contribute/my-drafts')}
                  >
                    🔙 Quay lại danh sách
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  )
}