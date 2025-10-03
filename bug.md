ID token verified for user: 69XqrTdQuDML8YkyazqRzYPhyJd2
User found with role: admin
 GET /api/moderation/queue?status=in_review&itemType=new_place 200 in 489ms
Releasing 1 expired claim(s)
Failed to release expired claim 8jdBl4UBFWwIXl6uIjT4: ReferenceError: FieldValue is not defined
    at eval (src\app\api\moderation\queue\route.ts:244:23)
    at Array.map (<anonymous>)
    at GET (src\app\api\moderation\queue\route.ts:240:51)
  242 |           await adminDb.collection('moderation_queue').doc(entryId).update({
  243 |             status: 'pending',
> 244 |             claimedBy: FieldValue.delete(),
      |                       ^
  245 |             claimedAt: FieldValue.delete(),
  246 |             claimExpiresAt: FieldValue.delete(),
  247 |             updatedAt: new Date().toISOString()
 GET /api/moderation/queue?status=approved&itemType=new_place 200 in 2364ms
ID token verified for user: 69XqrTdQuDML8YkyazqRzYPhyJd2
ID token verified for user: 69XqrTdQuDML8YkyazqRzYPhyJd2
User found with role: admin
User found with role: admin
 GET /api/moderation/queue?status=rejected&itemType=new_place 200 in 252ms
ID token verified for user: 69XqrTdQuDML8YkyazqRzYPhyJd2
User found with role: admin
 GET /api/moderation/queue?status=needs_revision&itemType=new_place 200 in 220ms
Releasing 1 expired claim(s)
Failed to release expired claim 8jdBl4UBFWwIXl6uIjT4: ReferenceError: FieldValue is not defined
    at eval (src\app\api\moderation\queue\route.ts:244:23)
    at Array.map (<anonymous>)
    at GET (src\app\api\moderation\queue\route.ts:240:51)
  242 |           await adminDb.collection('moderation_queue').doc(entryId).update({
  243 |             status: 'pending',
> 244 |             claimedBy: FieldValue.delete(),
      |                       ^
  245 |             claimedAt: FieldValue.delete(),
  246 |             claimExpiresAt: FieldValue.delete(),
  247 |             updatedAt: new Date().toISOString()
 GET /api/moderation/queue?status=approved&itemType=new_place 200 in 2021ms
ID token verified for user: 69XqrTdQuDML8YkyazqRzYPhyJd2
User found with role: admin
 GET /api/moderation/queue?status=rejected&itemType=new_place 200 in 215ms
ID token verified for user: 69XqrTdQuDML8YkyazqRzYPhyJd2
User found with role: admin
 GET /api/moderation/queue?status=needs_revision&itemType=new_place 200 in 214ms
