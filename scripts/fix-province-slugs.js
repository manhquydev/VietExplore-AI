/**
 * Migration script to normalize provinceSlug (remove Vietnamese accents)
 * Run: node scripts/fix-province-slugs.js
 */

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

const admin = require('firebase-admin');

// Initialize Firebase Admin
if (!admin.apps.length) {
  const serviceAccount = require('../firebase-service-account.json');

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  });
}

const db = admin.firestore();

/**
 * Normalize slug - remove accents and special characters
 */
function normalizeSlug(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Remove multiple hyphens
    .trim();
}

async function fixProvinceSlugs() {
  console.log('🔧 Starting provinceSlug normalization...\n');

  try {
    const placesSnapshot = await db.collection('places').get();

    console.log(`📍 Total places to process: ${placesSnapshot.size}\n`);

    const updates = [];
    const batch = db.batch();
    let updateCount = 0;

    placesSnapshot.forEach(doc => {
      const data = doc.data();
      const currentSlug = data.provinceSlug;

      if (!currentSlug) {
        console.log(`⚠️  Missing provinceSlug: ${data.name} (${data.province})`);

        // Generate slug from province name
        if (data.province) {
          const newSlug = normalizeSlug(data.province);
          batch.update(doc.ref, { provinceSlug: newSlug });
          updates.push({ id: doc.id, name: data.name, old: null, new: newSlug });
          updateCount++;
        }
        return;
      }

      // Check if slug needs normalization (has accents)
      const normalizedSlug = normalizeSlug(currentSlug);

      if (currentSlug !== normalizedSlug) {
        console.log(`🔄 Updating: ${data.name}`);
        console.log(`   Old slug: "${currentSlug}"`);
        console.log(`   New slug: "${normalizedSlug}"`);

        batch.update(doc.ref, { provinceSlug: normalizedSlug });
        updates.push({
          id: doc.id,
          name: data.name,
          old: currentSlug,
          new: normalizedSlug
        });
        updateCount++;
      }
    });

    if (updateCount > 0) {
      console.log(`\n✅ Committing ${updateCount} updates...`);
      await batch.commit();
      console.log('✅ Migration completed successfully!\n');

      console.log('📊 Summary of changes:');
      updates.forEach(u => {
        console.log(`   - ${u.name}: "${u.old || 'null'}" → "${u.new}"`);
      });
    } else {
      console.log('✅ No updates needed. All provinceSlugs are already normalized.');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit(0);
  }
}

fixProvinceSlugs();
