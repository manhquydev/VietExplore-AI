import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { app } from '@/lib/firebase';

const storage = getStorage(app);

// Upload image to Firebase Storage
export async function uploadImage(
  file: File, 
  path: string = 'places', 
  userId?: string
): Promise<{ url: string; path: string }> {
  try {
    // Create unique filename
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const filename = `${timestamp}-${Math.random().toString(36).substring(7)}.${fileExtension}`;
    
    // Create storage path
    const storagePath = userId ? `${path}/${userId}/${filename}` : `${path}/${filename}`;
    const storageRef = ref(storage, storagePath);

    // Upload file
    const snapshot = await uploadBytes(storageRef, file);
    
    // Get download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return {
      url: downloadURL,
      path: storagePath
    };
  } catch (error) {
    console.error('Error uploading image:', error);
    throw new Error('Không thể tải lên hình ảnh');
  }
}

// Delete image from Firebase Storage
export async function deleteImage(path: string): Promise<void> {
  try {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
  } catch (error) {
    console.error('Error deleting image:', error);
    throw new Error('Không thể xóa hình ảnh');
  }
}

// Validate image file
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return { 
      valid: false, 
      error: 'Chỉ hỗ trợ file JPG, PNG và WebP' 
    };
  }

  // Check file size (5MB max)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    return { 
      valid: false, 
      error: 'Kích thước file không được vượt quá 5MB' 
    };
  }

  return { valid: true };
}

// Resize image before upload (optional)
export function resizeImage(file: File, maxWidth: number = 1200, maxHeight: number = 800, quality: number = 0.8): Promise<File> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;
      
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;

      // Draw and compress
      ctx?.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const resizedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now()
            });
            resolve(resizedFile);
          } else {
            resolve(file);
          }
        },
        file.type,
        quality
      );
    };

    img.src = URL.createObjectURL(file);
  });
}