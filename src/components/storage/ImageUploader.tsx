// src/components/storage/ImageUploader.tsx
'use client';

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { storageService, useImageUpload } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { X, Upload, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';

interface ImageUploaderProps {
  draftId?: string;
  maxImages?: number;
  onUploadComplete?: (result: any) => void;
  onUploadError?: (error: string) => void;
  existingImages?: any[];
}

export function ImageUploader({
  draftId,
  maxImages = 5,
  onUploadComplete,
  onUploadError,
  existingImages = []
}: ImageUploaderProps) {
  const [previews, setPreviews] = useState<{ file: File; preview: string; credit: string }[]>([]);
  const [uploadedImages, setUploadedImages] = useState(existingImages);
  const { uploading, progress, uploadImage } = useImageUpload();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    // Check total image limit
    if (uploadedImages.length + previews.length + acceptedFiles.length > maxImages) {
      onUploadError?.(`Tối đa ${maxImages} ảnh`);
      return;
    }

    // Validate and create previews
    const newPreviews: { file: File; preview: string; credit: string }[] = [];
    
    for (const file of acceptedFiles) {
      // Validate file
      const validation = storageService.validateImageFile(file);
      if (!validation.valid) {
        onUploadError?.(validation.errors.join(', '));
        continue;
      }

      // Check dimensions
      const dimensions = await storageService.checkImageDimensions(file);
      if (!dimensions.valid) {
        onUploadError?.(dimensions.errors.join(', '));
        continue;
      }

      // Create preview
      try {
        const preview = await storageService.createImagePreview(file);
        newPreviews.push({
          file,
          preview,
          credit: ''
        });
      } catch (error) {
        console.error('Error creating preview:', error);
      }
    }

    setPreviews(prev => [...prev, ...newPreviews]);
  }, [uploadedImages.length, previews.length, maxImages, onUploadError]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    multiple: true
  });

  const handleUpload = async () => {
    if (!draftId || previews.length === 0) return;

    for (const preview of previews) {
      try {
        const result = await uploadImage(preview.file, 'draft', {
          draftId,
          credit: preview.credit
        });

        if (result.success) {
          setUploadedImages(prev => [...prev, {
            path: result.filePath,
            downloadUrl: result.downloadUrl,
            credit: preview.credit,
            fileName: preview.file.name
          }]);
          
          onUploadComplete?.(result);
        } else {
          onUploadError?.(result.error || 'Lỗi upload');
        }
      } catch (error: any) {
        onUploadError?.(error.message);
      }
    }

    // Clear previews after upload
    setPreviews([]);
  };

  const removePreview = (index: number) => {
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const updateCredit = (index: number, credit: string) => {
    setPreviews(prev => prev.map((p, i) => i === index ? { ...p, credit } : p));
  };

  const removeUploadedImage = async (image: any, index: number) => {
    if (!draftId) return;

    try {
      const result = await storageService.deleteImageFromDraft(draftId, image.path);
      if (result.success) {
        setUploadedImages(prev => prev.filter((_, i) => i !== index));
      } else {
        onUploadError?.(result.error || 'Lỗi khi xóa ảnh');
      }
    } catch (error: any) {
      onUploadError?.(error.message);
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <Card>
        <CardContent className="p-6">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
              ${isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary/50'}`}
          >
            <input {...getInputProps()} />
            <ImageIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            {isDragActive ? (
              <p className="text-primary">Thả ảnh vào đây...</p>
            ) : (
              <div>
                <p className="text-gray-600 mb-2">Kéo thả ảnh hoặc click để chọn</p>
                <p className="text-sm text-gray-500">
                  Hỗ trợ: JPG, PNG, WebP • Tối đa {maxImages} ảnh • Mỗi ảnh ≤ 5MB
                </p>
                <p className="text-sm text-gray-500">
                  Kích thước tối thiểu: 800x600px
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Preview Images */}
      {previews.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium mb-4">Ảnh đã chọn ({previews.length})</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {previews.map((preview, index) => (
                <div key={index} className="relative">
                  <div className="aspect-square relative rounded-lg overflow-hidden bg-gray-100">
                    <Image
                      src={preview.preview}
                      alt={`Preview ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                    <button
                      onClick={() => removePreview(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                  
                  <input
                    type="text"
                    placeholder="Nguồn ảnh / Credit"
                    value={preview.credit}
                    onChange={(e) => updateCredit(index, e.target.value)}
                    className="mt-2 w-full px-2 py-1 border rounded text-sm"
                  />
                  
                  <p className="text-xs text-gray-500 mt-1">
                    {storageService.formatFileSize(preview.file.size)}
                  </p>
                </div>
              ))}
            </div>
            
            {/* Upload Progress */}
            {uploading && (
              <div className="mt-4">
                <Progress value={progress} className="w-full" />
                <p className="text-sm text-gray-600 mt-2">Đang upload... {progress}%</p>
              </div>
            )}
            
            <div className="flex justify-end mt-4">
              <Button 
                onClick={handleUpload}
                disabled={uploading || previews.length === 0}
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                Upload {previews.length} ảnh
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Uploaded Images */}
      {uploadedImages.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium mb-4">Ảnh đã upload ({uploadedImages.length})</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {uploadedImages.map((image, index) => (
                <div key={index} className="relative">
                  <div className="aspect-square relative rounded-lg overflow-hidden bg-gray-100">
                    <Image
                      src={image.downloadUrl || storageService.getPublicUrl(image.path)}
                      alt={image.credit || `Ảnh ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                    <button
                      onClick={() => removeUploadedImage(image, index)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      disabled={uploading}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                  
                  <p className="text-sm font-medium mt-2">{image.credit || 'Chưa có credit'}</p>
                  <p className="text-xs text-gray-500">{image.fileName}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Guidelines */}
      <Card className="bg-blue-50">
        <CardContent className="p-4">
          <h4 className="font-medium text-blue-900 mb-2">Hướng dẫn upload ảnh</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Chỉ upload ảnh tự chụp hoặc có quyền sử dụng</li>
            <li>• Bắt buộc ghi nguồn (credit) cho mỗi ảnh</li>
            <li>• Ảnh sẽ được tự động tối ưu và tạo nhiều kích thước</li>
            <li>• Thông tin vị trí (GPS) sẽ được tự động xóa</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

