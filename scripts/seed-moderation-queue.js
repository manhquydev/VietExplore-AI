// Script to seed moderation queue with sample data for testing
const admin = require('firebase-admin');
const dotenv = require('dotenv');

// Load environment variables
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

// Sample moderation queue data
const sampleModerationItems = [
  {
    contentType: 'place',
    contentId: 'place_001',
    submittedBy: 'contributor_001',
    submittedAt: new Date().toISOString(),
    status: 'pending',
    priority: 'medium',
    content: {
      title: 'Bãi biển Nha Trang',
      description: 'Bãi biển đẹp với nước trong xanh và cát trắng mịn',
      changes: 'Tạo mới địa điểm'
    }
  },
  {
    contentType: 'place',
    contentId: 'place_002', 
    submittedBy: 'traveler_001',
    submittedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    status: 'pending',
    priority: 'high',
    content: {
      title: 'Phố cổ Hội An',
      description: 'Di sản văn hóa thế giới với kiến trúc cổ kính',
      changes: 'Cập nhật thông tin giờ mở cửa'
    }
  },
  {
    contentType: 'itinerary',
    contentId: 'itinerary_001',
    submittedBy: 'contributor_002',
    submittedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
    status: 'pending',
    priority: 'low',
    content: {
      title: 'Du lịch Đà Lạt 3 ngày 2 đêm',
      description: 'Lịch trình chi tiết khám phá thành phố ngàn hoa',
      changes: 'Tạo mới lịch trình'
    }
  },
  {
    contentType: 'user_report',
    contentId: 'report_001',
    submittedBy: 'traveler_002',
    submittedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
    status: 'pending',
    priority: 'urgent',
    content: {
      title: 'Báo cáo nội dung không phù hợp',
      description: 'Địa điểm chứa thông tin sai lệch về giá cả',
      changes: 'Báo cáo vi phạm'
    }
  },
  {
    contentType: 'place',
    contentId: 'place_003',
    submittedBy: 'partner_001',
    submittedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
    status: 'approved',
    priority: 'medium',
    reviewedBy: 'moderator_001',
    reviewedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
    reviewNotes: 'Thông tin chính xác và đầy đủ. Đã duyệt.',
    content: {
      title: 'Vịnh Hạ Long',
      description: 'Di sản thiên nhiên thế giới UNESCO',
      changes: 'Cập nhật hình ảnh mới'
    }
  }
];

async function seedModerationQueue() {
  try {
    console.log('Starting to seed moderation queue...');
    
    const batch = db.batch();
    
    // Clear existing data first (optional)
    const existingDocs = await db.collection('moderation_queue').get();
    existingDocs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    // Add sample data
    sampleModerationItems.forEach((item, index) => {
      const docRef = db.collection('moderation_queue').doc(`mod_item_${index + 1}`);
      batch.set(docRef, item);
    });
    
    await batch.commit();
    
    console.log(`Successfully seeded ${sampleModerationItems.length} moderation items`);
    
    // Verify the data was added
    const verifyQuery = await db.collection('moderation_queue').get();
    console.log(`Total items in moderation queue: ${verifyQuery.size}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding moderation queue:', error);
    process.exit(1);
  }
}

// Run the seeding
seedModerationQueue();