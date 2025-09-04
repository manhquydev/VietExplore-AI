"use client"

import { useEffect, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/components/auth/auth-provider'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card-custom'
import { BrandedLoading } from '@/components/ui/branded-loading'
import { AlertTriangle, Edit, Calendar, ArrowLeft, FileText } from 'lucide-react'
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
        const editableStatuses = ['draft', 'submitted', 'rejected', 'needs_revision'];
        
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
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      <Header />
      
      <main className="container py-8">
        <div className="max-w-5xl mx-auto">
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
            <div className="min-h-[400px] flex items-center justify-center">
              <BrandedLoading 
                variant="logo" 
                size="lg"
                text="Đang tải thông tin bản nháp..."
              />
            </div>
          )}

          {error && (
            <Card className="border-red-200 bg-red-50/50">
              <CardContent className="p-8">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-8 h-8 text-red-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-red-900">
                    Không thể tải bản nháp
                  </h3>
                  <p className="text-red-700 mb-6 max-w-md mx-auto">
                    {error}
                  </p>
                  <div className="flex gap-3 justify-center">
                    <Button variant="outline" onClick={() => router.back()} className="border-red-300 text-red-700 hover:bg-red-100">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Quay lại
                    </Button>
                    <Button onClick={() => router.push('/contribute/my-drafts')} className="bg-red-600 hover:bg-red-700">
                      <FileText className="w-4 h-4 mr-2" />
                      Về trang bản nháp
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {draft && !error && (
            <Card className="bg-white/80 backdrop-blur-sm shadow-2xl border-0">
              <CardHeader className="pb-6">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <div className="w-10 h-10 bg-gradient-to-br from-pink-100 to-purple-100 rounded-lg flex items-center justify-center">
                        <Edit className="w-5 h-5 text-pink-600" />
                      </div>
                      {draft.name || 'Bản nháp chưa có tên'}
                    </CardTitle>
                    <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Tạo: {new Date(draft.createdAt).toLocaleDateString('vi-VN')}
                      </div>
                      <div className="flex items-center gap-1">
                        <Edit className="w-4 h-4" />
                        Cập nhật: {new Date(draft.updatedAt).toLocaleDateString('vi-VN')}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {draft.status && (
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                        draft.status === 'draft' ? 'bg-gray-100 text-gray-700' :
                        draft.status === 'submitted' ? 'bg-blue-100 text-blue-700' :
                        draft.status === 'rejected' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {draft.status === 'draft' ? 'Bản nháp' :
                         draft.status === 'submitted' ? 'Đã gửi duyệt' :
                         draft.status === 'rejected' ? 'Bị từ chối' :
                         'Cần chỉnh sửa'}
                      </div>
                    )}
                  </div>
                </div>
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

                <div className="flex gap-3 pt-6 border-t">
                  <Button 
                    onClick={handleEditRedirect} 
                    className="flex-1 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Chỉnh sửa bản nháp
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => router.push('/contribute/my-drafts')}
                    className="px-6 border-gray-300 hover:bg-gray-50"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Danh sách bản nháp
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