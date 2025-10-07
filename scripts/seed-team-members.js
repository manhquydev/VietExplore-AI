/**
 * Seed script for team_members collection
 * Migrates existing mock data from About page to Firestore
 *
 * Run with: node scripts/seed-team-members.js
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin using environment variables
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'vietexplore-ai',
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'vietexplore-ai.firebasestorage.app'
  });
}

const db = admin.firestore();

// Team members data (from src/app/about/page.tsx lines 28-47)
const teamMembers = [
  {
    slug: "nguyen-minh-hoang",
    fullName: "Nguyễn Minh Hoàng",
    title: "Founder & Product Lead",
    bio: "Passionate về việc xây dựng nền tảng du lịch bền vững cho Việt Nam",
    longBio: `Với hơn 10 năm kinh nghiệm trong lĩnh vực công nghệ và du lịch, Hoàng đã dành toàn bộ sự nghiệp để kết nối du khách với những trải nghiệm du lịch có ý nghĩa.

Trước khi thành lập Du Lịch Việt, Hoàng đã làm việc tại nhiều công ty du lịch hàng đầu và luôn nhận thấy thiếu một nền tảng minh bạch, dễ tiếp cận cho du khách Việt Nam.

Sứ mệnh của Hoàng là xây dựng một cộng đồng du lịch nơi mọi người có thể chia sẻ trải nghiệm thực tế, giúp nhau khám phá vẻ đẹp Việt Nam một cách bền vững và có trách nhiệm.`,
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
    coverImage: "https://images.unsplash.com/photo-1559592413-7cec4d0d5d2d?w=1200&h=400&fit=crop",
    expertise: ["Product Strategy", "Travel Tech", "Community Building", "Sustainable Tourism"],
    achievements: [
      "Thành lập 3 startup du lịch thành công",
      "TEDx Speaker về du lịch bền vững",
      "Giải thưởng Founder of the Year 2023"
    ],
    education: [
      {
        degree: "MBA",
        institution: "Harvard Business School",
        year: "2015",
        description: "Chuyên ngành Entrepreneurship"
      },
      {
        degree: "Bachelor of Computer Science",
        institution: "Đại học Bách Khoa Hà Nội",
        year: "2010"
      }
    ],
    department: "leadership",
    featured: true,
    displayOrder: 1,
    status: "active",
    socialLinks: {
      email: "hoang@dulichviet.tech",
      linkedin: "https://linkedin.com/in/nguyen-minh-hoang",
      twitter: "https://twitter.com/hoangtravel",
      website: "https://nguyenminhhoang.com"
    },
    joinedDate: "2024-01-01",
    metaDescription: "Founder của Du Lịch Việt, passionate về việc xây dựng nền tảng du lịch bền vững và minh bạch cho Việt Nam.",
    tags: ["founder", "leadership", "product", "sustainability"]
  },
  {
    slug: "tran-thi-lan",
    fullName: "Trần Thị Lan",
    title: "Community Manager",
    bio: "Kết nối và phát triển cộng đồng du lịch Việt Nam",
    longBio: `Lan là người đam mê xây dựng cộng đồng và tạo ra những kết nối ý nghĩa giữa những người yêu du lịch.

Với kinh nghiệm 7 năm trong quản lý cộng đồng và marketing, Lan đã xây dựng nhiều cộng đồng du lịch offline và online với hàng chục nghìn thành viên tích cực.

Tại Du Lịch Việt, Lan chịu trách nhiệm nuôi dưỡng một cộng đồng tích cực, nơi mọi người cảm thấy được trân trọng và khuyến khích chia sẻ những câu chuyện du lịch của mình.`,
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b332c5cd?w=400&h=400&fit=crop&crop=face",
    coverImage: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1200&h=400&fit=crop",
    expertise: ["Community Management", "Social Media Marketing", "Content Strategy", "Event Planning"],
    achievements: [
      "Xây dựng cộng đồng 50,000+ thành viên tích cực",
      "Tổ chức 100+ meetup và sự kiện du lịch",
      "Top 10 Community Manager Việt Nam 2024"
    ],
    education: [
      {
        degree: "Bachelor of Marketing",
        institution: "Đại học Ngoại Thương",
        year: "2017"
      }
    ],
    department: "community",
    featured: true,
    displayOrder: 2,
    status: "active",
    socialLinks: {
      email: "lan@dulichviet.tech",
      facebook: "https://facebook.com/tranthilan",
      instagram: "https://instagram.com/lantravels"
    },
    joinedDate: "2024-02-01",
    metaDescription: "Community Manager của Du Lịch Việt, chuyên gia xây dựng và phát triển cộng đồng du lịch.",
    tags: ["community", "marketing", "events"]
  },
  {
    slug: "le-van-duc",
    fullName: "Lê Văn Đức",
    title: "Technical Lead",
    bio: "Phát triển công nghệ AI và platform architecture",
    longBio: `Đức là kỹ sư phần mềm với đam mê về trí tuệ nhân tạo và kiến trúc hệ thống.

Với 8 năm kinh nghiệm trong phát triển phần mềm và AI, Đức đã xây dựng nhiều hệ thống quy mô lớn phục vụ hàng triệu người dùng.

Tại Du Lịch Việt, Đức chịu trách nhiệm về toàn bộ hạ tầng công nghệ, đảm bảo nền tảng hoạt động mượt mà, an toàn và có khả năng mở rộng. Đức cũng dẫn dắt đội ngũ phát triển các tính năng AI giúp người dùng có những gợi ý du lịch thông minh và cá nhân hóa.`,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
    coverImage: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&h=400&fit=crop",
    expertise: ["AI/Machine Learning", "System Architecture", "Next.js", "Firebase", "Cloud Infrastructure"],
    achievements: [
      "Xây dựng hệ thống AI recommendation phục vụ 1M+ users",
      "Open-source contributor với 5,000+ GitHub stars",
      "Speaker tại VietnamJS Conference 2023"
    ],
    education: [
      {
        degree: "Master of Computer Science",
        institution: "Đại học Quốc gia Singapore (NUS)",
        year: "2018",
        description: "Chuyên ngành Machine Learning"
      },
      {
        degree: "Bachelor of Software Engineering",
        institution: "Đại học Bách Khoa TP.HCM",
        year: "2016"
      }
    ],
    department: "engineering",
    featured: true,
    displayOrder: 3,
    status: "active",
    socialLinks: {
      email: "duc@dulichviet.tech",
      github: "https://github.com/levanduc",
      linkedin: "https://linkedin.com/in/levanduc",
      twitter: "https://twitter.com/ducle_dev"
    },
    joinedDate: "2024-01-15",
    metaDescription: "Technical Lead của Du Lịch Việt, chuyên gia về AI, kiến trúc hệ thống và phát triển phần mềm.",
    tags: ["engineering", "ai", "architecture", "open-source"]
  }
];

async function seedTeamMembers() {
  try {
    console.log('🌱 Starting team members seed...\n');

    // Get admin user ID (you'll need to replace this with actual admin user ID)
    const adminUsersSnapshot = await db.collection('users')
      .where('role', '==', 'admin')
      .limit(1)
      .get();

    let adminUserId = 'system';
    if (!adminUsersSnapshot.empty) {
      adminUserId = adminUsersSnapshot.docs[0].id;
      console.log(`✅ Found admin user: ${adminUserId}\n`);
    } else {
      console.log(`⚠️  No admin user found, using 'system' as creator\n`);
    }

    const now = new Date().toISOString();
    let createdCount = 0;
    let skippedCount = 0;

    for (const member of teamMembers) {
      // Check if member already exists (by slug)
      const existingMember = await db.collection('team_members')
        .where('slug', '==', member.slug)
        .limit(1)
        .get();

      if (!existingMember.empty) {
        console.log(`⏭️  Skipped: ${member.fullName} (slug "${member.slug}" already exists)`);
        skippedCount++;
        continue;
      }

      // Create team member document
      const teamMemberData = {
        ...member,
        createdAt: now,
        updatedAt: now,
        createdBy: adminUserId,
        updatedBy: adminUserId
      };

      const docRef = await db.collection('team_members').add(teamMemberData);

      console.log(`✅ Created: ${member.fullName}`);
      console.log(`   ID: ${docRef.id}`);
      console.log(`   Slug: ${member.slug}`);
      console.log(`   Department: ${member.department}`);
      console.log(`   Featured: ${member.featured ? 'Yes' : 'No'}`);
      console.log('');

      createdCount++;
    }

    console.log('\n🎉 Seed completed!');
    console.log(`   Created: ${createdCount} team members`);
    console.log(`   Skipped: ${skippedCount} (already exist)`);
    console.log(`   Total: ${teamMembers.length} team members in seed data\n`);

    console.log('📝 Next steps:');
    console.log('   1. Deploy Firestore rules: firebase deploy --only firestore:rules');
    console.log('   2. Deploy Firestore indexes: firebase deploy --only firestore:indexes');
    console.log('   3. Visit /admin/team to manage team members');
    console.log('   4. Visit /about to see the team section\n');

  } catch (error) {
    console.error('❌ Error seeding team members:', error);
    process.exit(1);
  }
}

// Run seed function
seedTeamMembers()
  .then(() => {
    console.log('✅ Seed script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Seed script failed:', error);
    process.exit(1);
  });
