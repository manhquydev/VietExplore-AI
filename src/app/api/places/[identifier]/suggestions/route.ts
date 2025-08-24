import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/server/auth';
import { DecodedIdToken } from 'firebase-admin/auth';

interface SuggestionData {
  proposed: {
    description?: string;
    sources?: string[];
    // photos would be handled separately
  };
}

const createSuggestionHandler = async (
  request: NextRequest,
  context: { params: { identifier: string }; user: DecodedIdToken }
) => {
  const { user } = context;
  const { identifier: placeId } = context.params; // Treat the identifier as a placeId
  const { proposed }: SuggestionData = await request.json();

  if (!placeId) {
    return NextResponse.json({ error: 'Place ID is required.' }, { status: 400 });
  }
  if (!proposed || (!proposed.description && !proposed.sources)) {
    return NextResponse.json({ error: 'Suggestion data is missing.' }, { status: 400 });
  }

  try {
    const { adminDb, firebaseAdmin } = await import('@/lib/server/firebaseAdmin');
    const placeRef = adminDb.doc(`places/${placeId}`);
    const placeDoc = await placeRef.get();

    if (!placeDoc.exists) {
      return NextResponse.json({ error: 'The place to suggest edits for does not exist.' }, { status: 404 });
    }

    const suggestionRef = adminDb.collection('suggestions').doc();
    const moderationRequestRef = adminDb.collection('moderation/requests/items').doc();

    const batch = adminDb.batch();

    // 1. Create the suggestion document
    const suggestionData = {
        placeId,
        proposed,
        submitter: user.uid,
        status: 'submitted',
        createdAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
    };
    batch.set(suggestionRef, suggestionData);

    // 2. Create the moderation request
    const moderationRequestData = {
        type: 'place_suggestion',
        ref: {
            collection: 'suggestions',
            id: suggestionRef.id,
        },
        placeId: placeId, // For context
        priority: 'normal',
        submitter: user.uid,
        submitterRole: user.role || 'traveler',
        status: 'queued',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
    };
    batch.set(moderationRequestRef, moderationRequestData);

    // 3. Create an audit log
    const auditRef = adminDb.collection('audits').doc();
    batch.set(auditRef, {
      actor: { uid: user.uid, role: user.role },
      action: 'create_suggestion',
      target: { collection: 'places', id: placeId },
      metadata: { suggestionId: suggestionRef.id },
      createdAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
    });

    await batch.commit();

    console.log(`Suggestion ${suggestionRef.id} created for place ${placeId} by user ${user.uid}`);
    return NextResponse.json({
      success: true,
      message: 'Your suggestion has been submitted for review.',
      suggestionId: suggestionRef.id,
    });

  } catch (error: any) {
    console.error(`Error creating suggestion for place ${placeId}:`, error);
    return NextResponse.json(
      { success: false, error: 'An internal server error occurred.' },
      { status: 500 }
    );
  }
};

export const POST = withAuth(createSuggestionHandler);
