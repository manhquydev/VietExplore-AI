// Create real moderation queue from places and user contributions
const admin = require('firebase-admin');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

// Initialize Firebase Admin SDK
const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: process.env.FIREBASE_PROJECT_ID,
  });
}

const db = admin.firestore();

async function createRealModerationQueue() {
  try {
    console.log('🔄 Creating real moderation queue from places and contributions...\n');
    
    // 1. First, let's add some 'submitted' places that need review
    const pendingPlaces = [
      {
        name: 'Hang Sơn Trà',
        slug: 'hang-son-tra',
        shortDescription: 'Động tự nhiên với tượng Phật khổng lồ tại bán đảo Sơn Trà',
        description: 'Hang Sơn Trà là một động tự nhiên kỳ bí nằm trong khu bảo tồn thiên nhiên bán đảo Sơn Trà. Bên trong hang có tượng Phật Quan Âm cao 67 mét, tạo nên một không gian tâm linh độc đáo giữa thiên nhiên hoang sơ.',
        region: 'trung-bo',
        province: 'Đà Nẵng',
        provinceSlug: 'da-nang',
        type: 'van-hoa',
        coordinates: { lat: 16.1061, lng: 108.2635 },
        address: 'Bán đảo Sơn Trà, Thành phố Đà Nẵng',
        trustLabel: 'community',
        source: { type: 'user', userId: 'traveler_001' },
        status: 'submitted', // Waiting for review
        rating: { average: 0, count: 0, breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } },
        tags: ['hang động', 'tượng phật', 'tâm linh', 'thiên nhiên'],
        viewCount: 0,
        likeCount: 0,
        featured: false,
        images: [],
        createdBy: 'traveler_001',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        name: 'Bãi biển Quy Nhon',
        slug: 'bai-bien-quy-nhon',
        shortDescription: 'Bãi biển hoang sơ với nước trong xanh và cát vàng mịn',
        description: 'Quy Nhon là một bãi biển tuyệt đẹp còn nguyên sơ ở miền Trung, với bờ cát vàng trải dài và nước biển trong xanh. Đây là nơi lý tưởng để thư giãn và tận hưởng không gian yên tĩnh.',
        region: 'trung-bo',
        province: 'Bình Định',
        provinceSlug: 'binh-dinh',
        type: 'bien',
        coordinates: { lat: 13.7830, lng: 109.2196 },
        address: 'Thành phố Quy Nhon, Tỉnh Bình Định',
        trustLabel: 'contributor',
        source: { type: 'user', userId: 'contributor_001' },
        status: 'submitted',
        rating: { average: 0, count: 0, breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } },
        tags: ['bãi biển', 'hoang sơ', 'yên tĩnh', 'cát vàng'],
        viewCount: 0,
        likeCount: 0,
        featured: false,
        images: [],
        createdBy: 'contributor_001',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        name: 'Chùa Một Cột Hà Nội',
        slug: 'chua-mot-cot-ha-noi',
        shortDescription: 'Ngôi chùa lịch sử với kiến trúc độc đáo một cột duy nhất',
        description: 'Chùa Một Cột là một trong những ngôi chùa cổ nhất Hà Nội, được xây dựng từ thế kỷ 11 với kiến trúc đặc biệt chỉ có một cột trụ. Đây là biểu tượng văn hóa và lịch sử quan trọng của Thủ đô.',
        region: 'bac-bo',
        province: 'Hà Nội',
        provinceSlug: 'ha-noi',
        type: 'van-hoa',
        coordinates: { lat: 21.0350, lng: 105.8346 },
        address: 'Quận Ba Đình, Thành phố Hà Nội',
        trustLabel: 'community',
        source: { type: 'user', userId: 'traveler_002' },
        status: 'submitted',
        rating: { average: 0, count: 0, breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } },
        tags: ['chùa', 'lịch sử', 'kiến trúc', 'hà nội'],
        viewCount: 0,
        likeCount: 0,
        featured: false,
        images: [],
        createdBy: 'traveler_002',
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
        updatedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
      }
    ];
    
    // Add pending places to database
    const batch = db.batch();
    
    console.log('Adding pending places for review...');
    pendingPlaces.forEach(place => {
      const placeRef = db.collection('places').doc();
      batch.set(placeRef, {
        ...place,
        reportCount: 0
      });
    });
    
    await batch.commit();
    console.log(`✅ Added ${pendingPlaces.length} places waiting for review`);
    
    // 2. Clear old moderation queue and create new one based on real data
    console.log('\nClearing old moderation queue...');
    const oldQueue = await db.collection('moderation_queue').get();
    const deleteBatch = db.batch();
    oldQueue.forEach(doc => {
      deleteBatch.delete(doc.ref);
    });
    await deleteBatch.commit();
    console.log(`✅ Cleared ${oldQueue.size} old moderation items`);
    
    // 3. Create moderation queue items from submitted places
    console.log('\nCreating moderation queue from submitted places...');
    const submittedPlaces = await db.collection('places')
      .where('status', '==', 'submitted')
      .orderBy('createdAt', 'desc')
      .get();
    
    const newBatch = db.batch();
    const moderationItems = [];
    
    for (const placeDoc of submittedPlaces.docs) {
      const place = { id: placeDoc.id, ...placeDoc.data() };
      
      // Get submitter info
      const submitterDoc = await db.collection('users').doc(place.createdBy).get();
      const submitter = submitterDoc.exists ? submitterDoc.data() : null;
      
      const moderationItem = {
        contentType: 'place',
        contentId: place.id,
        submittedBy: place.createdBy,
        submittedAt: place.createdAt,
        status: 'pending',
        priority: place.trustLabel === 'contributor' ? 'medium' : 
                 place.trustLabel === 'partner' ? 'high' : 'low',
        content: {
          title: place.name,
          description: place.shortDescription,
          changes: 'Tạo mới địa điểm',
          region: place.region,
          province: place.province,
          type: place.type,
          trustLabel: place.trustLabel
        },
        submitterInfo: submitter ? {
          fullName: submitter.fullName || 'Unknown User',
          role: submitter.role || 'traveler',
          ...(submitter.avatar && { avatar: submitter.avatar })
        } : {
          fullName: 'Unknown User',
          role: 'traveler'
        }
      };
      
      const moderationRef = db.collection('moderation_queue').doc();
      newBatch.set(moderationRef, moderationItem);
      moderationItems.push(moderationItem);
    }
    
    await newBatch.commit();
    console.log(`✅ Created ${moderationItems.length} moderation items from submitted places`);
    
    // 4. Add some user reports for testing
    console.log('\nAdding user reports...');
    const userReports = [
      {
        contentType: 'user_report',
        contentId: 'report_001',
        submittedBy: 'traveler_002',
        submittedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        status: 'pending',
        priority: 'urgent',
        content: {
          title: 'Nội dung không phù hợp',
          description: 'Địa điểm chứa thông tin sai lệch về giá cả và dịch vụ',
          changes: 'Báo cáo vi phạm nội dung',
          reportType: 'misinformation',
          targetPlaceId: 'place_reported'
        },
        submitterInfo: {
          fullName: 'Người dùng báo cáo',
          role: 'traveler'
        }
      }
    ];
    
    const reportBatch = db.batch();
    userReports.forEach(report => {
      const reportRef = db.collection('moderation_queue').doc();
      reportBatch.set(reportRef, report);
    });
    await reportBatch.commit();
    console.log(`✅ Added ${userReports.length} user reports`);
    
    // 5. Summary
    const finalQueue = await db.collection('moderation_queue').get();
    console.log('\n📊 Final moderation queue summary:');
    
    const stats = {
      pending: 0,
      byType: {},
      byPriority: {}
    };
    
    finalQueue.forEach(doc => {
      const item = doc.data();
      if (item.status === 'pending') stats.pending++;
      stats.byType[item.contentType] = (stats.byType[item.contentType] || 0) + 1;
      stats.byPriority[item.priority] = (stats.byPriority[item.priority] || 0) + 1;
    });
    
    console.log(`Total items: ${finalQueue.size}`);
    console.log(`Pending review: ${stats.pending}`);
    console.log('By type:', stats.byType);
    console.log('By priority:', stats.byPriority);
    
    console.log('\n🚀 Ready to test moderation dashboard:');
    console.log('1. Login as admin: admin@dulichviet.com / password123');
    console.log('2. Visit: /moderation/dashboard');
    console.log('3. Review and approve/reject places');
    console.log('4. Check /places to see approved places appear');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating moderation queue:', error);
    process.exit(1);
  }
}

createRealModerationQueue();