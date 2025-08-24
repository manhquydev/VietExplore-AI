import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/server/auth';
import { getFirebaseAdmin } from '@/lib/server/firebaseAdmin';
import { DecodedIdToken } from 'firebase-admin/auth';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs/promises';

const IMAGE_VARIANTS = {
  thumb: { width: 320, quality: 80 },
  md: { width: 768, quality: 82 },
  lg: { width: 1280, quality: 85 },
};

async function generateUniqueSlug(title: string, db: any): Promise<string> {
  let baseSlug = title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  let slug = baseSlug;
  let counter = 1;
  while (true) {
    const existingPlace = await db.collection('places').where('slug', '==', slug).limit(1).get();
    if (existingPlace.empty) break;
    slug = `${baseSlug}-${counter++}`;
    if (counter > 10) {
      slug = `${baseSlug}-${Date.now()}`;
      break;
    }
  }
  return slug;
}

async function processPlaceImages(draftId: string, placeId: string, photoMetadata: any[]): Promise<any[]> {
  const { adminStorage } = getFirebaseAdmin();
  const bucket = adminStorage.bucket();
  const processedPhotos: any[] = [];
  const draftFilesPrefix = `drafts/places/${draftId}/`;
  const [files] = await bucket.getFiles({ prefix: draftFilesPrefix });
  if (files.length === 0) return [];

  for (const file of files) {
    const originalFileName = file.name.split('/').pop()!;
    const tempFilePath = `/tmp/${originalFileName}`;
    try {
      await file.download({ destination: tempFilePath });
      const imageBuffer = await sharp(tempFilePath).rotate().toBuffer();
      const imageMetadata = await sharp(imageBuffer).metadata();
      const uniqueId = uuidv4();
      const variants: Record<string, string> = {};
      for (const [variantName, config] of Object.entries(IMAGE_VARIANTS)) {
        const resizedBuffer = await sharp(imageBuffer).resize({ width: config.width, fit: 'inside', withoutEnlargement: true }).webp({ quality: config.quality }).toBuffer();
        const variantPath = `places/${placeId}/web/${variantName}/${uniqueId}.webp`;
        const variantFile = bucket.file(variantPath);
        await variantFile.save(resizedBuffer, { contentType: 'image/webp', metadata: { cacheControl: 'public, max-age=31536000, immutable' } });
        variants[variantName] = variantPath;
      }
      const photoMeta = photoMetadata.find(p => p.path && p.path.includes(originalFileName)) || {};
      processedPhotos.push({ id: uniqueId, path: variants.lg, variants, width: imageMetadata.width || 0, height: imageMetadata.height || 0, credit: photoMeta.credit || '' });
    } catch (imageError) {
      console.error(`Skipping due to error processing image ${originalFileName}:`, imageError);
    } finally {
      await fs.unlink(tempFilePath).catch((e:any) => console.error(`Failed to delete temp file ${tempFilePath}`, e));
    }
  }
  await bucket.deleteFiles({ prefix: draftFilesPrefix });
  return processedPhotos;
}

interface ApproveData {
  requestId: string;
  notes?: string;
}

const approveHandler = async (request: NextRequest, context: { user: DecodedIdToken }) => {
  const { user } = context;
  const { requestId, notes }: ApproveData = await request.json();
  if (!requestId) return NextResponse.json({ error: 'Request ID is required.' }, { status: 400 });

  const { adminDb } = getFirebaseAdmin();
  const requestRef = adminDb.doc(`moderation/requests/items/${requestId}`);
  let draftRef: any, draftData: any;

  try {
    const draftInfo = await adminDb.runTransaction(async (tx) => {
      const requestSnap = await tx.get(requestRef);
      if (!requestSnap.exists) throw new Error('REQUEST_NOT_FOUND');
      const requestData = requestSnap.data()!;
      if (!['queued', 'in_review'].includes(requestData.status)) throw new Error('INVALID_STATUS');
      const currentDraftRef = adminDb.doc(`${requestData.ref.collection}/${requestData.ref.id}`);
      const draftSnap = await tx.get(currentDraftRef);
      if (!draftSnap.exists) throw new Error('DRAFT_NOT_FOUND');
      tx.update(currentDraftRef, { status: 'approved', moderationNotes: notes || null, updatedAt: new Date() });
      tx.update(requestRef, { status: 'approved', decisionNotes: notes || null, updatedAt: new Date() });
      const auditRef = adminDb.collection('audits').doc();
      tx.set(auditRef, { actor: { uid: user.uid, role: user.role }, action: 'approve_draft', target: { collection: 'placeDrafts', id: currentDraftRef.id }, createdAt: new Date() });
      return { ref: currentDraftRef, data: draftSnap.data()! };
    });
    draftRef = draftInfo.ref;
    draftData = draftInfo.data;
  } catch (error: any) {
    if (error.message === 'REQUEST_NOT_FOUND') return NextResponse.json({ error: 'Moderation request not found.' }, { status: 404 });
    if (error.message === 'DRAFT_NOT_FOUND') return NextResponse.json({ error: 'Associated draft not found.' }, { status: 404 });
    if (error.message === 'INVALID_STATUS') return NextResponse.json({ error: 'Request cannot be approved in its current state.' }, { status: 409 });
    return NextResponse.json({ error: 'An internal server error occurred during transaction.' }, { status: 500 });
  }

  try {
    const slug = await generateUniqueSlug(draftData.title, adminDb);
    const placeRef = adminDb.collection('places').doc();
    await placeRef.set({
      name: draftData.title, slug, region: draftData.region, province: draftData.province, type: draftData.type,
      description: draftData.description, sources: draftData.sources || [],
      trustLabel: draftData.submitterRole === 'partner' ? 'partner' : 'contributor',
      createdBy: draftData.submitter, status: 'published', createdAt: new Date(), updatedAt: new Date(), photos: [],
    });
    const processedPhotos = await processPlaceImages(draftRef.id, placeRef.id, draftData.photos || []);
    await placeRef.update({ photos: processedPhotos });
    await draftRef.update({ linkedPlaceId: placeRef.id, status: 'published' });
    return NextResponse.json({ success: true, message: 'Draft approved and published successfully.', placeId: placeRef.id });
  } catch (error: any) {
    await draftRef.update({ status: 'processing_error', moderationNotes: 'Failed during media processing or publishing.' });
    return NextResponse.json({ error: 'An error occurred during media processing or publishing.' }, { status: 500 });
  }
};

export const POST = withAuth(approveHandler, ['moderator', 'admin']);
