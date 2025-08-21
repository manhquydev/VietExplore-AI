// src/lib/storage.ts - Client-side Storage helpers
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage, auth } from './firebase';
import { getFunctions, httpsCallable } from 'firebase/functions';

const functions = getFunctions();

// Types
export interface ImageUploadResult {
  success: boolean;
  filePath?: string;
  downloadUrl?: string;
  error?: string;
}

export interface ImageVariants {
  thumb: string;
  md: string; 
  lg: string;
}

export interface ProcessedImage {
  id: string;
  path: string;
  variants: ImageVariants;
  width: number;
  height: number;
  credit: string;
  alt: string;
  originalFileName: string;
  hidden?: boolean;
}

// Storage service
export const storageService = {
  // Upload image to draft
  async uploadImageToDraft(draftId: string, file: File, credit: string = ''): Promise<ImageUploadResult> {
    try {
      // Validate file
      if (!file.type.startsWith('image/')) {
        return { success: false, error: 'Chỉ cho phép upload ảnh' };
      }

      if (file.size > 5 * 1024 * 1024) {
        return { success: false, error: 'Kích thước file tối đa 5MB' };
      }

      // Get signed upload URL
      const uploadImageFunction = httpsCallable(functions, 'uploadImageToDraft');
      const result = await uploadImageFunction({
        draftId,
        fileName: file.name,
        contentType: file.type
      });

      const { uploadUrl, filePath } = result.data as any;

      // Upload file using signed URL
      const response = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type
        }
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      return {
        success: true,
        filePath,
        downloadUrl: this.getPublicUrl(filePath)
      };
    } catch (error: any) {
      console.error('Error uploading image:', error);
      return {
        success: false,
        error: error.message || 'Lỗi khi upload ảnh'
      };
    }
  },

  // Upload avatar
  async uploadAvatar(file: File): Promise<ImageUploadResult> {
    try {
      if (!file.type.startsWith('image/')) {
        return { success: false, error: 'Chỉ cho phép upload ảnh' };
      }

      if (file.size > 5 * 1024 * 1024) {
        return { success: false, error: 'Kích thước file tối đa 5MB' };
      }

      // Generate unique filename
      const timestamp = Date.now();
      const fileName = `avatar-${timestamp}.${file.name.split('.').pop()}`;
      const storageRef = ref(storage, `users/${auth.currentUser?.uid}/avatar/${fileName}`);

      // Upload file
      const snapshot = await uploadBytes(storageRef, file);
      const downloadUrl = await getDownloadURL(snapshot.ref);

      return {
        success: true,
        filePath: snapshot.ref.fullPath,
        downloadUrl
      };
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      return {
        success: false,
        error: error.message || 'Lỗi khi upload avatar'
      };
    }
  },

  // Delete image from draft
  async deleteImageFromDraft(draftId: string, filePath: string): Promise<{ success: boolean; error?: string }> {
    try {
      const deleteFunction = httpsCallable(functions, 'deleteImageFromDraft');
      await deleteFunction({ draftId, filePath });

      return { success: true };
    } catch (error: any) {
      console.error('Error deleting image:', error);
      return {
        success: false,
        error: error.message || 'Lỗi khi xóa ảnh'
      };
    }
  },

  // Get public URL for web assets
  getPublicUrl(path: string): string {
    const bucketName = storage.app.options.storageBucket;
    return `https://storage.googleapis.com/${bucketName}/${encodeURIComponent(path)}`;
  },

  // Get optimized image URL với srcset
  getOptimizedImageUrls(photo: ProcessedImage): {
    src: string;
    srcSet: string;
    sizes: string;
  } {
    const baseUrl = 'https://storage.googleapis.com';
    const bucketName = storage.app.options.storageBucket;
    
    const thumb = `${baseUrl}/${bucketName}/${encodeURIComponent(photo.variants.thumb)}`;
    const md = `${baseUrl}/${bucketName}/${encodeURIComponent(photo.variants.md)}`;
    const lg = `${baseUrl}/${bucketName}/${encodeURIComponent(photo.variants.lg)}`;

    return {
      src: md, // Default fallback
      srcSet: `${thumb} 320w, ${md} 768w, ${lg} 1280w`,
      sizes: '(max-width: 768px) 100vw, 768px'
    };
  },

  // Validate image before upload
  validateImageFile(file: File): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Check file type
    if (!file.type.startsWith('image/')) {
      errors.push('Chỉ cho phép upload ảnh');
    }

    // Check file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      errors.push('Kích thước file tối đa 5MB');
    }

    // Check file extension
    const validExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
    const fileName = file.name.toLowerCase();
    const hasValidExtension = validExtensions.some(ext => fileName.endsWith(ext));
    
    if (!hasValidExtension) {
      errors.push('Chỉ hỗ trợ định dạng: JPG, PNG, WebP');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  },

  // Preview image before upload
  createImagePreview(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        resolve(e.target?.result as string);
      };
      
      reader.onerror = () => {
        reject(new Error('Không thể tạo preview ảnh'));
      };
      
      reader.readAsDataURL(file);
    });
  },

  // Format file size for display
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  // Check image dimensions client-side
  checkImageDimensions(file: File): Promise<{ width: number; height: number; valid: boolean; errors: string[] }> {
    return new Promise((resolve) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      
      img.onload = () => {
        URL.revokeObjectURL(url);
        
        const errors: string[] = [];
        if (img.width < 800) {
          errors.push('Chiều rộng tối thiểu 800px');
        }
        if (img.height < 600) {
          errors.push('Chiều cao tối thiểu 600px');
        }

        resolve({
          width: img.width,
          height: img.height,
          valid: errors.length === 0,
          errors
        });
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve({
          width: 0,
          height: 0,
          valid: false,
          errors: ['Không thể đọc kích thước ảnh']
        });
      };
      
      img.src = url;
    });
  }
};

// React hook cho image upload
import { useState } from 'react';

export function useImageUpload() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const uploadImage = async (
    file: File, 
    context: 'draft' | 'avatar' | 'report',
    params: any
  ): Promise<ImageUploadResult> => {
    setUploading(true);
    setProgress(0);

    try {
      // Validate file
      const validation = storageService.validateImageFile(file);
      if (!validation.valid) {
        return { success: false, error: validation.errors.join(', ') };
      }

      // Check dimensions
      const dimensions = await storageService.checkImageDimensions(file);
      if (!dimensions.valid) {
        return { success: false, error: dimensions.errors.join(', ') };
      }

      setProgress(25);

      // Upload based on context
      let result: ImageUploadResult;
      
      switch (context) {
        case 'draft':
          result = await storageService.uploadImageToDraft(params.draftId, file, params.credit);
          break;
        case 'avatar':
          result = await storageService.uploadAvatar(file);
          break;
        default:
          result = { success: false, error: 'Context không hỗ trợ' };
      }

      setProgress(100);
      return result;
    } catch (error: any) {
      return { success: false, error: error.message };
    } finally {
      setUploading(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  return {
    uploading,
    progress,
    uploadImage
  };
}
