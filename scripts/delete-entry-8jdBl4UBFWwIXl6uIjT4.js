/**
 * Quick Fix: Delete specific stuck entry
 */
const admin = require('firebase-admin');
require('dotenv').config();

if (!admin.apps.length) {
  let credential = admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  });
  admin.initializeApp({ credential });
}

const entryId = '8jdBl4UBFWwIXl6uIjT4';

console.log(`Deleting stuck entry: ${entryId}...`);

admin.firestore().collection('moderation_queue').doc(entryId).delete()
  .then(() => {
    console.log('✅ Successfully deleted stuck entry!');
    console.log('   Place "An Giang" is still published and will remain visible.');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
