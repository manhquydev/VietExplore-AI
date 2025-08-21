// functions/src/utils/storageHelpers.ts
import * as admin from 'firebase-admin';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';

const storage = admin.storage();

export const storageHelpers = {
  // Validate image file
  isValidImageFile(contentType: string, fileName: string): boolean {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const validExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
    
    const hasValidType = validTypes.includes(contentType.toLowerCase());
    const hasValidExtension = validExtensions.some(ext => 
      fileName.toLowerCase().endsWith(ext)
    );
    
    return hasValidType && hasValidExtension;
  },

  // Generate storage path for different contexts
  generateStoragePath(context: 'draft' | 'place' | 'user' | 'report', params: any): string {
    const uniqueId = uuidv4();
    
    switch (context) {
      case 'draft':
        return `drafts/places/${params.draftId}/${uniqueId}-${params.fileName}`;
      case 'place':
        return `places/${params.placeId}/${params.variant}/${uniqueId}.webp`;
      case 'user':
        return `users/${params.uid}/avatar/${uniqueId}-${params.fileName}`;
      case 'report':
        return `reports/${params.reportId}/evidence/${uniqueId}-${params.fileName}`;
      default:
        throw new Error('Invalid storage context');
    }
  },

  // Get signed upload URL
  async getSignedUploadUrl(path: string, contentType: string, maxSize: number = 5242880): Promise<string> {
    const bucket = storage.bucket();
    const file = bucket.file(path);
    
    const [signedUrl] = await file.getSignedUrl({
      action: 'write',
      expires: Date.now() + 15 * 60 * 1000, // 15 minutes
      contentType: contentType,
      extensionHeaders: {
        'x-goog-content-length-range': `0,${maxSize}`
      }
    });

    return signedUrl;
  },

  // Get signed download URL
  async getSignedDownloadUrl(path: string, expiresInMinutes: number = 60): Promise<string> {
    const bucket = storage.bucket();
    const file = bucket.file(path);
    
    const [signedUrl] = await file.getSignedUrl({
      action: 'read',
      expires: Date.now() + expiresInMinutes * 60 * 1000
    });

    return signedUrl;
  },

  // Process image với Sharp
  async processImage(inputBuffer: Buffer, options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'jpeg' | 'png';
    removeExif?: boolean;
  }): Promise<Buffer> {
    let image = sharp(inputBuffer);

    // Remove EXIF data (security)
    if (options.removeExif !== false) {
      image = image.rotate(); // Auto-rotate and remove EXIF
    }

    // Resize
    if (options.width || options.height) {
      image = image.resize({
        width: options.width,
        height: options.height,
        fit: 'inside',
        withoutEnlargement: true
      });
    }

    // Convert format
    switch (options.format || 'webp') {
      case 'webp':
        image = image.webp({ quality: options.quality || 85 });
        break;
      case 'jpeg':
        image = image.jpeg({ quality: options.quality || 85 });
        break;
      case 'png':
        image = image.png({ quality: options.quality || 85 });
        break;
    }

    return await image.toBuffer();
  },

  // Copy file trong Storage
  async copyFile(sourcePath: string, destPath: string): Promise<void> {
    const bucket = storage.bucket();
    const sourceFile = bucket.file(sourcePath);
    const destFile = bucket.file(destPath);
    
    await sourceFile.copy(destFile);
  },

  // Delete file với error handling
  async deleteFile(path: string, ignoreNotFound: boolean = true): Promise<boolean> {
    try {
      const bucket = storage.bucket();
      await bucket.file(path).delete();
      return true;
    } catch (error: any) {
      if (ignoreNotFound && error.code === 404) {
        return false; // File không tồn tại
      }
      throw error;
    }
  },

  // Cleanup draft files
  async cleanupDraftFiles(draftId: string): Promise<number> {
    const bucket = storage.bucket();
    const prefix = `drafts/places/${draftId}/`;
    
    try {
      const [files] = await bucket.getFiles({ prefix });
      let deletedCount = 0;
      
      for (const file of files) {
        try {
          await file.delete();
          deletedCount++;
        } catch (error) {
          console.warn(`Could not delete ${file.name}:`, error);
        }
      }
      
      return deletedCount;
    } catch (error) {
      console.error(`Error cleaning up draft ${draftId}:`, error);
      return 0;
    }
  },

  // Get file metadata
  async getFileMetadata(path: string): Promise<any> {
    const bucket = storage.bucket();
    const file = bucket.file(path);
    
    try {
      const [metadata] = await file.getMetadata();
      return metadata;
    } catch (error) {
      return null;
    }
  },

  // Check if file exists
  async fileExists(path: string): Promise<boolean> {
    const bucket = storage.bucket();
    const file = bucket.file(path);
    
    try {
      const [exists] = await file.exists();
      return exists;
    } catch (error) {
      return false;
    }
  },

  // Generate public URL for web assets
  getPublicUrl(path: string): string {
    const bucket = storage.bucket();
    return `https://storage.googleapis.com/${bucket.name}/${encodeURIComponent(path)}`;
  },

  // Validate image dimensions
  async validateImageDimensions(buffer: Buffer, minWidth: number = 800, minHeight: number = 600): Promise<{
    valid: boolean;
    width: number;
    height: number;
    errors: string[];
  }> {
    try {
      const metadata = await sharp(buffer).metadata();
      const width = metadata.width || 0;
      const height = metadata.height || 0;
      const errors: string[] = [];

      if (width < minWidth) {
        errors.push(`Chiều rộng tối thiểu ${minWidth}px (hiện tại: ${width}px)`);
      }

      if (height < minHeight) {
        errors.push(`Chiều cao tối thiểu ${minHeight}px (hiện tại: ${height}px)`);
      }

      return {
        valid: errors.length === 0,
        width,
        height,
        errors
      };
    } catch (error) {
      return {
        valid: false,
        width: 0,
        height: 0,
        errors: ['Không thể đọc metadata ảnh']
      };
    }
  }
};

