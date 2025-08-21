// functions/src/storage/imageProcessing.ts
import * as admin from 'firebase-admin';
import { onDocumentUpdated } from 'firebase-functions/v2/firestore';
import { onObjectFinalized } from 'firebase-functions/v2/storage';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';

// Use default storage bucket
const storage = admin.storage();

// Image processing configurations
const IMAGE_VARIANTS = {
  thumb: { width: 320, quality: 80 },
  md: { width: 768, quality: 82 },
  lg: { width: 1280, quality: 85 }
};

// Function xử lý khi draft được approve → publish
export const onDraftApproved = onDocumentUpdated('placeDrafts/{draftId}', async (event) => {
  const before = event.data?.before.data();
  const after = event.data?.after.data();
  
  if (!before || !after) return;
  if (before.status === after.status) return;
  if (!['approved', 'published'].includes(after.status)) return;

  const draftId = event.params.draftId;
  const db = admin.firestore();

  try {
    logger.info(`Processing approved draft: ${draftId}`);

    // 1) Tạo place document nếu chưa có
    let placeId = after.linkedPlaceId;
    if (!placeId) {
      const slug = await generateUniqueSlug(after.title);
      const placeRef = await db.collection('places').add({
        id: '', // Will be updated with actual ID
        name: after.title,
        slug,
        region: after.region,
        province: after.province,
        type: after.type,
        description: after.description,
        photos: [], // Will be populated after image processing
        sources: after.sources || [],
        trustLabel: after.submitterRole === 'partner' ? 'partner' : 'contributor',
        createdBy: after.submitter,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        status: 'published'
      });
      
      placeId = placeRef.id;
      await placeRef.update({ id: placeId });
    }

    // 2) Process images từ drafts → places
    const processedPhotos = await processPlaceImages(draftId, placeId, after.photos || []);

    // 3) Update place với processed photos
    await db.doc(`places/${placeId}`).update({
      photos: processedPhotos,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // 4) Update draft với linkedPlaceId
    await db.doc(`placeDrafts/${draftId}`).update({
      linkedPlaceId: placeId,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // 5) Audit log
    await db.collection('audits').add({
      actor: { uid: 'system', role: 'function' },
      action: 'publish',
      target: { collection: 'places', id: placeId },
      metadata: { draftId, processedPhotos: processedPhotos.length },
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    logger.info(`Successfully processed place: ${placeId} from draft: ${draftId}`);
  } catch (error) {
    logger.error('Error processing approved draft:', error);
    
    // Update draft status to error for manual review
    await db.doc(`placeDrafts/${draftId}`).update({
      status: 'processing_error',
      moderationNotes: `Error during image processing: ${error instanceof Error ? error.message : 'Unknown error'}`,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
  }
});

// Helper function để process images
async function processPlaceImages(draftId: string, placeId: string, photoMetadata: any[]): Promise<any[]> {
  const bucket = storage.bucket();
  const processedPhotos: any[] = [];

  try {
    // List files trong draft folder
    const [files] = await bucket.getFiles({ prefix: `drafts/places/${draftId}/` });
    
    for (const file of files) {
      const fileName = file.name.split('/').pop()!;
      const fileExtension = fileName.split('.').pop()!.toLowerCase();
      
      // Skip non-image files
      if (!['jpg', 'jpeg', 'png', 'webp'].includes(fileExtension)) {
        continue;
      }

      try {
        // Generate unique filename
        const uniqueId = uuidv4();
        const baseFileName = `${uniqueId}`;

        // 1) Copy to orig folder
        const origPath = `places/${placeId}/orig/${baseFileName}.${fileExtension}`;
        await file.copy(bucket.file(origPath));

        // 2) Download and process image
        const [imageBuffer] = await file.download();
        
        // Remove EXIF data and get metadata
        const image = sharp(imageBuffer);
        const metadata = await image.metadata();
        const processedBuffer = await image.rotate().toBuffer(); // Auto-rotate based on EXIF

        // 3) Create variants
        const variants: any = {};
        
        for (const [variantName, config] of Object.entries(IMAGE_VARIANTS)) {
          const resizedBuffer = await sharp(processedBuffer)
            .resize({ 
              width: config.width, 
              height: undefined, 
              fit: 'inside',
              withoutEnlargement: true 
            })
            .webp({ quality: config.quality })
            .toBuffer();

          const variantPath = `places/${placeId}/web/${variantName}/${baseFileName}.webp`;
          
          await bucket.file(variantPath).save(resizedBuffer, {
            metadata: {
              contentType: 'image/webp',
              cacheControl: 'public, max-age=31536000, immutable',
              customMetadata: {
                originalFile: fileName,
                processedAt: new Date().toISOString(),
                variant: variantName
              }
            }
          });

          variants[variantName] = variantPath;
        }

        // Find matching metadata from draft
        const photoMeta = photoMetadata.find(p => p.path && p.path.includes(fileName)) || {};

        processedPhotos.push({
          id: uniqueId,
          path: variants.lg, // Main display path
          variants,
          width: metadata.width || 0,
          height: metadata.height || 0,
          credit: photoMeta.credit || '',
          alt: photoMeta.alt || '',
          originalFileName: fileName
        });

        logger.info(`Processed image: ${fileName} → ${uniqueId}`);
      } catch (imageError) {
        logger.error(`Error processing image ${fileName}:`, imageError);
        // Continue with other images
      }
    }

    // Clean up draft files after successful processing
    for (const file of files) {
      try {
        await file.delete();
      } catch (deleteError) {
        logger.warn(`Could not delete draft file ${file.name}:`, deleteError);
      }
    }

    return processedPhotos;
  } catch (error) {
    logger.error('Error in processPlaceImages:', error);
    throw error;
  }
}

// Function để generate unique slug (reuse from placeWorkflow)
async function generateUniqueSlug(title: string): Promise<string> {
  const db = admin.firestore();
  
  let baseSlug = title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  let slug = baseSlug;
  let counter = 1;
  
  while (true) {
    const existingPlace = await db.collection('places')
      .where('slug', '==', slug)
      .limit(1)
      .get();
      
    if (existingPlace.empty) break;
    
    slug = `${baseSlug}-${counter}`;
    counter++;
    
    if (counter > 100) {
      slug = `${baseSlug}-${Date.now()}`;
      break;
    }
  }
  
  return slug;
}

// Function để upload image với validation
export const uploadImageToDraft = onCall(async (req) => {
  if (!req.auth?.uid) {
    throw new HttpsError('unauthenticated', 'Cần đăng nhập');
  }

  if (!req.auth.token?.email_verified) {
    throw new HttpsError('failed-precondition', 'Cần xác minh email trước khi upload');
  }

  const { draftId, fileName, contentType } = req.data;

  if (!draftId || !fileName || !contentType) {
    throw new HttpsError('invalid-argument', 'Thiếu thông tin upload');
  }

  // Validate file type
  if (!contentType.startsWith('image/')) {
    throw new HttpsError('invalid-argument', 'Chỉ cho phép upload ảnh');
  }

  // Validate draft ownership
  try {
    const db = admin.firestore();
    const draftDoc = await db.doc(`placeDrafts/${draftId}`).get();
    
    if (!draftDoc.exists) {
      throw new HttpsError('not-found', 'Không tìm thấy bản nháp');
    }

    const draftData = draftDoc.data()!;
    if (draftData.submitter !== req.auth.uid) {
      throw new HttpsError('permission-denied', 'Không có quyền upload vào bản nháp này');
    }

    if (!['draft', 'changes_requested'].includes(draftData.status)) {
      throw new HttpsError('failed-precondition', 'Bản nháp không thể chỉnh sửa');
    }

    // Generate upload URL
    const uniqueFileName = `${uuidv4()}-${fileName}`;
    const uploadPath = `drafts/places/${draftId}/${uniqueFileName}`;
    
    // Create signed upload URL (valid for 15 minutes)
    const [signedUrl] = await storage.bucket().file(uploadPath).getSignedUrl({
      action: 'write',
      expires: Date.now() + 15 * 60 * 1000, // 15 minutes
      contentType: contentType,
      extensionHeaders: {
        'x-goog-content-length-range': '0,5242880' // Max 5MB
      }
    });

    logger.info(`Generated upload URL for draft ${draftId}: ${uploadPath}`);
    return {
      success: true,
      uploadUrl: signedUrl,
      filePath: uploadPath,
      message: 'URL upload đã được tạo'
    };
  } catch (error) {
    logger.error('Error generating upload URL:', error);
    throw error;
  }
});

// Trigger khi có file upload vào drafts
export const onDraftImageUpload = onObjectFinalized(async (event) => {
  const filePath = event.data.name;
  
  // Chỉ xử lý files trong drafts/places/
  if (!filePath.startsWith('drafts/places/')) {
    return;
  }

  const pathParts = filePath.split('/');
  if (pathParts.length < 4) return;
  
  const draftId = pathParts[2];
  const fileName = pathParts[3];

  try {
    const db = admin.firestore();
    const bucket = storage.bucket();
    const file = bucket.file(filePath);

    // Get file metadata
    const [metadata] = await file.getMetadata();
    const fileSize = parseInt(String(metadata.size || '0'));
    
    // Validate file size (5MB max)
    if (fileSize > 5 * 1024 * 1024) {
      logger.warn(`File too large: ${filePath} (${fileSize} bytes)`);
      await file.delete();
      return;
    }

    // Get image dimensions
    const [imageBuffer] = await file.download();
    const image = sharp(imageBuffer);
    const imageMetadata = await image.metadata();

    // Validate minimum dimensions (800px)
    if ((imageMetadata.width || 0) < 800 && (imageMetadata.height || 0) < 800) {
      logger.warn(`Image too small: ${filePath} (${imageMetadata.width}x${imageMetadata.height})`);
      await file.delete();
      return;
    }

    // Update draft document với photo metadata
    const draftRef = db.doc(`placeDrafts/${draftId}`);
    const draftDoc = await draftRef.get();
    
    if (draftDoc.exists) {
      const currentPhotos = draftDoc.data()?.photos || [];
      const newPhoto = {
        path: filePath,
        fileName,
        width: imageMetadata.width || 0,
        height: imageMetadata.height || 0,
        size: fileSize,
        contentType: metadata.contentType || 'image/jpeg',
        uploadedAt: admin.firestore.FieldValue.serverTimestamp()
      };

      await draftRef.update({
        photos: [...currentPhotos, newPhoto],
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      logger.info(`Added photo metadata to draft ${draftId}: ${fileName}`);
    }
  } catch (error) {
    logger.error(`Error processing uploaded image ${filePath}:`, error);
  }
});

// Function để xóa image từ draft
export const deleteImageFromDraft = onCall(async (req) => {
  if (!req.auth?.uid) {
    throw new HttpsError('unauthenticated', 'Cần đăng nhập');
  }

  const { draftId, filePath } = req.data;

  if (!draftId || !filePath) {
    throw new HttpsError('invalid-argument', 'Draft ID và file path là bắt buộc');
  }

  try {
    const db = admin.firestore();
    const draftDoc = await db.doc(`placeDrafts/${draftId}`).get();

    if (!draftDoc.exists) {
      throw new HttpsError('not-found', 'Không tìm thấy bản nháp');
    }

    const draftData = draftDoc.data()!;
    if (draftData.submitter !== req.auth.uid) {
      throw new HttpsError('permission-denied', 'Không có quyền xóa ảnh từ bản nháp này');
    }

    // Delete from storage
    const bucket = storage.bucket();
    await bucket.file(filePath).delete();

    // Update draft document
    const currentPhotos = draftData.photos || [];
    const updatedPhotos = currentPhotos.filter((photo: any) => photo.path !== filePath);

    await db.doc(`placeDrafts/${draftId}`).update({
      photos: updatedPhotos,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    logger.info(`Deleted image from draft ${draftId}: ${filePath}`);
    return { success: true, message: 'Ảnh đã được xóa' };
  } catch (error) {
    logger.error('Error deleting image from draft:', error);
    throw error;
  }
});

// Function để hide/unhide place image (Moderator only)
export const togglePlaceImage = onCall(async (req) => {
  if (!req.auth?.token?.role || !['moderator', 'admin'].includes(req.auth.token.role)) {
    throw new HttpsError('permission-denied', 'Chỉ Moderator/Admin mới có quyền ẩn/hiện ảnh');
  }

  const { placeId, photoId, hidden, reason } = req.data;

  if (!placeId || !photoId || typeof hidden !== 'boolean') {
    throw new HttpsError('invalid-argument', 'Thiếu thông tin cần thiết');
  }

  try {
    const db = admin.firestore();
    const placeDoc = await db.doc(`places/${placeId}`).get();

    if (!placeDoc.exists) {
      throw new HttpsError('not-found', 'Không tìm thấy địa điểm');
    }

    const placeData = placeDoc.data()!;
    const photos = placeData.photos || [];
    
    const updatedPhotos = photos.map((photo: any) => {
      if (photo.id === photoId) {
        return {
          ...photo,
          hidden,
          hiddenReason: hidden ? reason : null,
          hiddenBy: hidden ? req.auth?.uid : null,
          hiddenAt: hidden ? admin.firestore.FieldValue.serverTimestamp() : null
        };
      }
      return photo;
    });

    await db.doc(`places/${placeId}`).update({
      photos: updatedPhotos,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Audit log
    await db.collection('audits').add({
      actor: {
        uid: req.auth.uid,
        role: req.auth.token.role
      },
      action: hidden ? 'hide_image' : 'show_image',
      target: { collection: 'places', id: placeId },
      metadata: { photoId, reason },
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    logger.info(`Image ${hidden ? 'hidden' : 'shown'}: ${photoId} in place ${placeId}`);
    return { success: true, message: `Ảnh đã được ${hidden ? 'ẩn' : 'hiện'}` };
  } catch (error) {
    logger.error('Error toggling place image:', error);
    throw error;
  }
});
