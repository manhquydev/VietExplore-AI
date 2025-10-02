"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, X, Link as LinkIcon, Image as ImageIcon } from "lucide-react"
import { BrandedLoading, LoadingButton } from "@/components/ui/branded-loading"
import { uploadImage, validateImageFile, resizeImage } from "@/lib/client/firebase-storage"
import { useAuth } from "@/components/auth/auth-provider"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

export interface SingleImageData {
  url: string
  alt: string
  storagePath?: string // Track Firebase Storage path for deletion
}

interface SingleImageUploadProps {
  image: SingleImageData | null | undefined
  onChange: (image: SingleImageData | null) => void
  label?: string
  description?: string
  required?: boolean
  uploadFolder?: string // Folder in Firebase Storage
  className?: string
}

export function SingleImageUpload({
  image,
  onChange,
  label = "Hình ảnh",
  description,
  required = false,
  uploadFolder = "announcements/images",
  className
}: SingleImageUploadProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [uploading, setUploading] = React.useState(false)
  const [uploadMethod, setUploadMethod] = React.useState<'file' | 'url'>('file')
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleFileUpload = async (file: File) => {
    // Validate file
    const validation = validateImageFile(file)
    if (!validation.valid) {
      toast({
        title: "File không hợp lệ",
        description: validation.error || "Vui lòng chọn file ảnh phù hợp (JPG, PNG, WebP, tối đa 5MB)",
        variant: "destructive"
      })
      return
    }

    setUploading(true)

    // Show info notification about starting upload
    toast({
      title: "Đang xử lý ảnh",
      description: "Đang tối ưu hóa và tải lên ảnh, vui lòng chờ trong giây lát..."
    })

    try {
      // Resize image before upload
      const resizedFile = await resizeImage(file, 1200, 800, 0.8)

      // Upload to Firebase Storage
      const result = await uploadImage(
        resizedFile,
        uploadFolder,
        user?.id
      )

      // Update image data
      onChange({
        url: result.url,
        storagePath: result.path,
        alt: image?.alt || file.name.split('.')[0] // Use filename as default alt text
      })

      toast({
        title: "Tải lên thành công!",
        description: "Hình ảnh đã được tải lên và xử lý thành công"
      })

    } catch (error: any) {
      console.error('Upload failed:', error)
      toast({
        title: "Lỗi tải lên",
        description: error.message || "Không thể tải lên hình ảnh. Vui lòng kiểm tra kết nối và thử lại",
        variant: "destructive"
      })
    } finally {
      setUploading(false)
    }
  }

  const triggerFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0]
        if (file) {
          handleFileUpload(file)
        }
      }
      fileInputRef.current.click()
    }
  }

  const removeImage = () => {
    onChange(null)
  }

  const updateImageData = (updates: Partial<SingleImageData>) => {
    if (image) {
      onChange({ ...image, ...updates })
    }
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <div>
          <Label>{label} {required && <span className="text-destructive">*</span>}</Label>
          {description && (
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          )}
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
      />

      {/* Image Preview & Controls */}
      {image?.url ? (
        <div className="border border-border rounded-lg p-4 space-y-4">
          {/* Preview */}
          <div className="relative w-full h-48 bg-muted rounded-lg overflow-hidden">
            <img
              src={image.url}
              alt={image.alt || "Preview"}
              className="w-full h-full object-cover"
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2"
              onClick={removeImage}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Alt text input */}
          <div>
            <Label htmlFor="image-alt" className="text-sm">Mô tả ảnh (alt text) {required && <span className="text-destructive">*</span>}</Label>
            <Input
              id="image-alt"
              placeholder="Mô tả ngắn gọn về hình ảnh"
              value={image.alt}
              onChange={(e) => updateImageData({ alt: e.target.value })}
              required={required}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Giúp SEO và accessibility
            </p>
          </div>
        </div>
      ) : (
        <div className="border-2 border-dashed border-border rounded-lg p-6 space-y-4">
          {/* Upload Method Toggle */}
          <div className="flex gap-2 justify-center">
            <Button
              type="button"
              variant={uploadMethod === 'file' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setUploadMethod('file')}
            >
              <Upload className="w-4 h-4 mr-2" />
              Tải file
            </Button>
            <Button
              type="button"
              variant={uploadMethod === 'url' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setUploadMethod('url')}
            >
              <LinkIcon className="w-4 h-4 mr-2" />
              URL
            </Button>
          </div>

          {/* Upload Interface */}
          {uploadMethod === 'file' ? (
            <div className="text-center space-y-4">
              {uploading ? (
                <div className="py-8">
                  <BrandedLoading variant="spinner" size="md" text="Đang tải lên..." />
                </div>
              ) : (
                <>
                  <ImageIcon className="w-12 h-12 text-muted-foreground mx-auto" />
                  <div>
                    <LoadingButton
                      type="button"
                      variant="secondary"
                      onClick={triggerFileSelect}
                      isLoading={uploading}
                      loadingText="Đang tải lên..."
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Chọn file từ máy tính
                    </LoadingButton>
                    <p className="text-xs text-muted-foreground mt-2">
                      JPG, PNG, WebP (Tối đa 5MB)
                    </p>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <Label htmlFor="image-url" className="text-sm">URL hình ảnh</Label>
                <Input
                  id="image-url"
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  onChange={(e) => onChange({ url: e.target.value, alt: '' })}
                />
              </div>
              <div>
                <Label htmlFor="image-alt-url" className="text-sm">Mô tả ảnh (alt text)</Label>
                <Input
                  id="image-alt-url"
                  placeholder="Mô tả ngắn gọn về hình ảnh"
                  onChange={(e) => {
                    const currentUrl = (document.getElementById('image-url') as HTMLInputElement)?.value || ''
                    if (currentUrl) {
                      onChange({ url: currentUrl, alt: e.target.value })
                    }
                  }}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
