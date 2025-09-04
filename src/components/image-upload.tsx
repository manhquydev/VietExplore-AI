"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Camera, Upload, X, Loader2, Link as LinkIcon } from "lucide-react"
import { BrandedLoading, LoadingButton } from "@/components/ui/branded-loading"
import { uploadImage, validateImageFile, resizeImage } from "@/lib/client/firebase-storage"
import { useAuth } from "@/components/auth/auth-provider"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

export interface ImageData {
  id: string
  url: string
  alt: string
  caption?: string
  isPrimary?: boolean
  storagePath?: string // Track Firebase Storage path for deletion
}

interface ImageUploadProps {
  images: ImageData[]
  onChange: (images: ImageData[]) => void
  maxImages?: number
  className?: string
}

export function ImageUpload({ 
  images, 
  onChange, 
  maxImages = 10,
  className 
}: ImageUploadProps) {
  const { user } = useAuth()
  const { success, error, info } = useToast()
  const [uploading, setUploading] = React.useState<string | null>(null)
  const [uploadMethod, setUploadMethod] = React.useState<'file' | 'url'>('file')
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const addImage = () => {
    const newImage: ImageData = {
      id: Date.now().toString(),
      url: '',
      alt: '',
      caption: '',
      isPrimary: images.length === 0
    }
    onChange([...images, newImage])
  }

  const removeImage = (imageId: string) => {
    onChange(images.filter(img => img.id !== imageId))
  }

  const updateImage = (imageId: string, updates: Partial<ImageData>) => {
    onChange(images.map(img => 
      img.id === imageId ? { ...img, ...updates } : img
    ))
  }

  const handleFileUpload = async (file: File, imageId: string) => {
    // Validate file
    const validation = validateImageFile(file)
    if (!validation.valid) {
      error({
        title: "File không hợp lệ",
        description: validation.error || "Vui lòng chọn file ảnh phù hợp (JPG, PNG, WebP, tối đa 5MB)"
      })
      return
    }

    setUploading(imageId)

    // Show info notification about starting upload
    info({
      title: "Đang xử lý ảnh",
      description: "Đang tối ưu hóa và tải lên ảnh, vui lòng chờ trong giây lát..."
    })

    try {
      // Resize image before upload
      const resizedFile = await resizeImage(file, 1200, 800, 0.8)
      
      // Upload to Firebase Storage
      const result = await uploadImage(
        resizedFile,
        'places/images',
        user?.id
      )

      // Update image data
      updateImage(imageId, {
        url: result.url,
        storagePath: result.path,
        alt: file.name.split('.')[0] // Use filename as default alt text
      })

      success({
        title: "Tải lên thành công!",
        description: "Hình ảnh đã được tải lên và xử lý thành công"
      })

    } catch (error: any) {
      console.error('Upload failed:', error)
      error({
        title: "Lỗi tải lên",
        description: error.message || "Không thể tải lên hình ảnh. Vui lòng kiểm tra kết nối và thử lại"
      })
    } finally {
      setUploading(null)
    }
  }

  const triggerFileSelect = (imageId: string) => {
    if (fileInputRef.current) {
      fileInputRef.current.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0]
        if (file) {
          handleFileUpload(file, imageId)
        }
      }
      fileInputRef.current.click()
    }
  }

  const setPrimaryImage = (imageId: string) => {
    onChange(images.map(img => ({
      ...img,
      isPrimary: img.id === imageId
    })))
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <Label>Hình ảnh *</Label>
        {images.length < maxImages && (
          <Button variant="outline" size="sm" onClick={addImage}>
            <Upload className="w-4 h-4 mr-2" />
            Thêm ảnh
          </Button>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
      />

      {images.length === 0 ? (
        <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
          <Camera className="w-12 h-12 text-muted mx-auto mb-4" />
          <p className="text-muted mb-4">Chưa có hình ảnh nào</p>
          <Button variant="outline" onClick={addImage}>
            Thêm hình ảnh đầu tiên
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {images.map((image, index) => (
            <div key={image.id} className="border border-border rounded-lg p-4">
              <div className="flex items-start gap-4">
                {/* Image Preview */}
                <div className="w-24 h-18 bg-surface rounded border flex items-center justify-center flex-shrink-0 relative">
                  {uploading === image.id ? (
                    <BrandedLoading variant="spinner" size="sm" showText={false} />
                  ) : image.url ? (
                    <img 
                      src={image.url} 
                      alt={image.alt || `Ảnh ${index + 1}`}
                      className="w-full h-full object-cover rounded"
                    />
                  ) : (
                    <Camera className="w-8 h-8 text-muted" />
                  )}
                </div>
                
                {/* Image Controls */}
                <div className="flex-1 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Ảnh {index + 1}</span>
                      {image.isPrimary && (
                        <Badge variant="default" className="text-xs">Ảnh chính</Badge>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {!image.isPrimary && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPrimaryImage(image.id)}
                        >
                          Đặt làm ảnh chính
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeImage(image.id)}
                        className="text-danger hover:text-danger"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Upload Method Toggle */}
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={uploadMethod === 'file' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setUploadMethod('file')}
                    >
                      <Upload className="w-4 h-4 mr-1" />
                      Tải file
                    </Button>
                    <Button
                      type="button"
                      variant={uploadMethod === 'url' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setUploadMethod('url')}
                    >
                      <LinkIcon className="w-4 h-4 mr-1" />
                      URL
                    </Button>
                  </div>

                  {/* Upload Interface */}
                  {uploadMethod === 'file' ? (
                    <div>
                      <LoadingButton
                        type="button"
                        variant="secondary"
                        onClick={() => triggerFileSelect(image.id)}
                        isLoading={uploading === image.id}
                        loadingText="Đang tải lên..."
                        className="w-full text-sm py-2"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Chọn file từ máy tính
                      </LoadingButton>
                      {image.url && (
                        <p className="text-xs text-success mt-2">✓ Đã tải lên thành công</p>
                      )}
                    </div>
                  ) : (
                    <div>
                      <Label className="text-xs">URL hình ảnh</Label>
                      <Input
                        placeholder="https://example.com/image.jpg"
                        value={image.url}
                        onChange={(e) => updateImage(image.id, { url: e.target.value })}
                      />
                    </div>
                  )}
                  
                  {/* Image Metadata */}
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">Mô tả ảnh *</Label>
                      <Input
                        placeholder="Mô tả ngắn về hình ảnh"
                        value={image.alt}
                        onChange={(e) => updateImage(image.id, { alt: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Chú thích (tuỳ chọn)</Label>
                      <Input
                        placeholder="Chú thích chi tiết cho hình ảnh"
                        value={image.caption || ''}
                        onChange={(e) => updateImage(image.id, { caption: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {images.length >= maxImages && (
        <p className="text-xs text-muted">
          Tối đa {maxImages} hình ảnh. Xóa ảnh cũ để thêm ảnh mới.
        </p>
      )}
    </div>
  )
}