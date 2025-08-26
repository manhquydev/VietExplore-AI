// Script to seed users collection with sample data for testing
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

// Sample users data (matching the mock data structure)
const sampleUsers = [
  {
    id: 'contributor_001',
    email: 'contributor@example.com',
    fullName: 'Trần Thị Bình',
    username: 'tran_thi_binh',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b332c5cd?w=100&h=100&fit=crop&crop=face',
    role: 'contributor',
    verified: true,
    createdAt: '2024-01-10T09:15:00Z',
    profile: {
      bio: 'Travel blogger với 5 năm kinh nghiệm khám phá Việt Nam.',
      location: 'TP. Hồ Chí Minh, Việt Nam'
    },
    stats: {
      placesContributed: 28,
      itinerariesCreated: 12,
      helpfulVotes: 156
    }
  },
  {
    id: 'traveler_001',
    email: 'traveler@example.com',
    fullName: 'Nguyễn Văn An',
    username: 'nguyen_van_an',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    role: 'traveler',
    verified: false,
    createdAt: '2024-02-15T14:30:00Z',
    profile: {
      bio: 'Yêu thích khám phá những địa điểm mới',
      location: 'Hà Nội, Việt Nam'
    },
    stats: {
      placesContributed: 0,
      itinerariesCreated: 5,
      helpfulVotes: 23
    }
  },
  {
    id: 'contributor_002',
    email: 'contributor2@example.com',
    fullName: 'Lê Văn Cường',
    username: 'le_van_cuong',
    role: 'contributor',
    verified: true,
    createdAt: '2024-01-20T10:30:00Z',
    profile: {
      bio: 'Cộng tác viên chuyên về du lịch miền Trung',
      location: 'Đà Nẵng, Việt Nam'
    },
    stats: {
      placesContributed: 15,
      itinerariesCreated: 8,
      helpfulVotes: 89
    }
  },
  {
    id: 'traveler_002',
    email: 'traveler2@example.com',
    fullName: 'Phạm Thị Mai',
    username: 'pham_thi_mai',
    role: 'traveler',
    verified: false,
    createdAt: '2024-02-20T16:00:00Z',
    profile: {
      bio: 'Người yêu thích du lịch bụi',
      location: 'TP. Hồ Chí Minh, Việt Nam'
    },
    stats: {
      placesContributed: 2,
      itinerariesCreated: 3,
      helpfulVotes: 12
    }
  },
  {
    id: 'partner_001',
    email: 'partner@danang.gov.vn',
    fullName: 'Sở Du lịch Đà Nẵng',
    username: 'danang_tourism',
    role: 'partner',
    verified: true,
    createdAt: '2024-01-05T11:20:00Z',
    profile: {
      bio: 'Cơ quan quản lý du lịch chính thức của thành phố Đà Nẵng',
      location: 'Đà Nẵng, Việt Nam'
    },
    stats: {
      placesContributed: 45,
      itinerariesCreated: 8,
      helpfulVotes: 289
    }
  },
  {
    id: 'moderator_001',
    email: 'moderator@dulichviet.com',
    fullName: 'Lê Văn Cường',
    username: 'le_van_cuong_mod',
    role: 'moderator',
    verified: true,
    createdAt: '2023-12-01T08:00:00Z',
    profile: {
      bio: 'Kiểm duyệt viên chuyên về du lịch',
      location: 'Hà Nội, Việt Nam'
    },
    stats: {
      placesContributed: 12,
      itinerariesCreated: 3,
      helpfulVotes: 67
    }
  }
];

async function seedUsers() {
  try {
    console.log('Starting to seed users...');
    
    const batch = db.batch();
    
    // Add sample users
    sampleUsers.forEach((user) => {
      const docRef = db.collection('users').doc(user.id);
      batch.set(docRef, user);
    });
    
    await batch.commit();
    
    console.log(`Successfully seeded ${sampleUsers.length} users`);
    
    // Verify the data was added
    const verifyQuery = await db.collection('users').get();
    console.log(`Total users in database: ${verifyQuery.size}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding users:', error);
    process.exit(1);
  }
}

// Run the seeding
seedUsers();