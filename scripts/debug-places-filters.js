/**
 * Debug script to check actual filter values in published places
 * Run: node scripts/debug-places-filters.js
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

async function checkFilterData() {
  console.log('📊 Checking filter data in published places...\n');

  try {
    const placesSnapshot = await db.collection('places')
      .where('status', '==', 'published')
      .get();

    const trustLabels = new Set();
    const provinces = new Set();
    const provincesSlugs = new Set();
    const types = new Set();
    const regions = new Set();

    let hasProvinceSlugField = 0;
    let missingProvinceSlug = [];

    console.log(`✅ Total published places: ${placesSnapshot.size}\n`);

    placesSnapshot.forEach(doc => {
      const data = doc.data();

      // Collect unique values
      if (data.trustLabel) trustLabels.add(data.trustLabel);
      if (data.province) provinces.add(data.province);
      if (data.provinceSlug) {
        provincesSlugs.add(data.provinceSlug);
        hasProvinceSlugField++;
      } else {
        missingProvinceSlug.push({ id: doc.id, name: data.name, province: data.province });
      }
      if (data.type) types.add(data.type);
      if (data.region) regions.add(data.region);
    });

    // Report findings
    console.log('🏷️  TRUST LABELS (Độ tin cậy):');
    console.log(`   Total unique values: ${trustLabels.size}`);
    Array.from(trustLabels).sort().forEach(label => {
      console.log(`   - ${label}`);
    });
    console.log();

    console.log('📍 REGIONS (Vùng miền):');
    console.log(`   Total unique values: ${regions.size}`);
    Array.from(regions).sort().forEach(region => {
      console.log(`   - ${region}`);
    });
    console.log();

    console.log('🏙️  PROVINCES (Tỉnh/Thành phố):');
    console.log(`   Total unique values: ${provinces.size}`);
    console.log(`   Places with provinceSlug field: ${hasProvinceSlugField}/${placesSnapshot.size}`);
    if (missingProvinceSlug.length > 0) {
      console.log(`   ⚠️  Missing provinceSlug in ${missingProvinceSlug.length} places:`);
      missingProvinceSlug.slice(0, 5).forEach(p => {
        console.log(`      - ${p.name} (${p.province})`);
      });
      if (missingProvinceSlug.length > 5) {
        console.log(`      ... and ${missingProvinceSlug.length - 5} more`);
      }
    }
    console.log('\n   Province values:');
    Array.from(provinces).sort().forEach(province => {
      console.log(`   - ${province}`);
    });
    console.log('\n   ProvinceSlug values:');
    Array.from(provincesSlugs).sort().forEach(slug => {
      console.log(`   - ${slug}`);
    });
    console.log();

    console.log('🏖️  TYPES (Loại hình):');
    console.log(`   Total unique values: ${types.size}`);
    Array.from(types).sort().forEach(type => {
      console.log(`   - ${type}`);
    });
    console.log();

    // Recommendations
    console.log('💡 RECOMMENDATIONS:');
    if (trustLabels.size < 5) {
      console.log(`   ⚠️  SearchBar has 5 trustLabel options but database only has ${trustLabels.size}`);
      console.log('   → Update SearchBar to only show existing values');
    }
    if (hasProvinceSlugField < placesSnapshot.size) {
      console.log(`   ⚠️  ${placesSnapshot.size - hasProvinceSlugField} places missing provinceSlug field`);
      console.log('   → Run migration to add provinceSlug to all places');
    }
    console.log();

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit(0);
  }
}

checkFilterData();
