// scripts/set-admin.js
// A standalone Node.js script to assign the 'admin' role to a user.
// Usage: node scripts/set-admin.js <user-email>

const admin = require('firebase-admin');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

/**
 * Initializes the Firebase Admin SDK.
 */
function initializeFirebaseAdmin() {
  if (admin.apps.length > 0) {
    return admin.app();
  }

  const serviceAccountJson = process.env.FIREBASE_ADMIN_SDK_JSON;
  if (!serviceAccountJson) {
    throw new Error('FIREBASE_ADMIN_SDK_JSON environment variable is not set.');
  }

  try {
    const serviceAccount = JSON.parse(serviceAccountJson);
    return admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: `https://${serviceAccount.project_id}-default-rtdb.asia-southeast1.firebasedatabase.app`,
    });
  } catch (error) {
    throw new Error(`Failed to parse FIREBASE_ADMIN_SDK_JSON: ${error.message}`);
  }
}

/**
 * Main function to set the admin role.
 */
async function setAdminRole() {
  const email = process.argv[2];
  if (!email) {
    console.error('Usage: node scripts/set-admin.js <user-email>');
    process.exit(1);
  }

  try {
    console.log(`Attempting to set admin role for user: ${email}`);
    initializeFirebaseAdmin();

    const db = admin.firestore();

    // 1. Get user by email to find their UID
    const userRecord = await admin.auth().getUserByEmail(email);
    const uid = userRecord.uid;
    console.log(`Found user with UID: ${uid}`);

    // 2. Set custom claims
    await admin.auth().setCustomUserClaims(uid, { role: 'admin' });
    console.log('Successfully set custom user claims in Firebase Auth.');

    // 3. Update Firestore document
    const userDocRef = db.doc(`users/${uid}`);
    const userDoc = await userDocRef.get();

    if (userDoc.exists) {
      await userDocRef.update({
        role: 'admin',
        updatedAt: new Date(),
      });
      console.log('Successfully updated user document in Firestore.');
    } else {
      // If the user document doesn't exist for some reason, create it.
      await userDocRef.set({
        email: email,
        role: 'admin',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      }, { merge: true });
      console.log('User document did not exist. Created and updated in Firestore.');
    }

    // 4. Create an audit log for this action
    await db.collection('audits').add({
        actor: { uid: 'system_script', role: 'system' },
        action: 'set_admin_via_script',
        target: { collection: 'users', id: uid },
        metadata: { email: email },
        createdAt: new Date(),
      });
    console.log('Audit log created.');


    console.log(`\n✅ Successfully assigned 'admin' role to ${email}.`);
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Error assigning admin role:');
    if (error.code === 'auth/user-not-found') {
        console.error(`No user found with the email: ${email}`);
    } else {
        console.error(error.message);
    }
    process.exit(1);
  }
}

setAdminRole();
