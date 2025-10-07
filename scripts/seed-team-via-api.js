/**
 * Seed Team Members via API
 * This script uses the API endpoints to create initial team members
 * Run: node scripts/seed-team-via-api.js
 */

const teamMembers = [
  {
    slug: 'nguyen-minh-hoang',
    fullName: 'Nguyễn Minh Hoàng',
    title: 'Founder & CEO',
    bio: 'Đam mê công nghệ và du lịch, kết hợp AI để mang văn hóa Việt đến gần hơn với mọi người',
    longBio: 'Nguyễn Minh Hoàng là người sáng lập và CEO của Du Lịch Việt. Với hơn 10 năm kinh nghiệm trong lĩnh vực công nghệ và khởi nghiệp, anh đã dành cả thanh xuân để xây dựng các sản phẩm công nghệ phục vụ cộng đồng. Niềm đam mê với văn hóa Việt Nam và công nghệ AI đã thôi thúc anh xây dựng nền tảng Du Lịch Việt - nơi kết nối du khách với những trải nghiệm văn hóa độc đáo của Việt Nam thông qua công nghệ trí tuệ nhân tạo.',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Hoang',
    expertise: ['AI/ML', 'Product Management', 'Startup Strategy', 'Travel Tech'],
    achievements: [
      'Xây dựng nền tảng du lịch AI đầu tiên tại Việt Nam',
      'Kết nối hơn 10,000 du khách với văn hóa địa phương',
      'Giải thưởng Khởi nghiệp Sáng tạo 2024'
    ],
    education: [
      {
        degree: 'Thạc sĩ Khoa học Máy tính',
        institution: 'Đại học Bách Khoa Hà Nội',
        year: '2018',
        major: 'Trí tuệ nhân tạo và Học máy'
      },
      {
        degree: 'Cử nhân Công nghệ Thông tin',
        institution: 'Đại học Quốc gia Hà Nội',
        year: '2015'
      }
    ],
    socialLinks: {
      linkedin: 'https://linkedin.com/in/nguyen-minh-hoang',
      github: 'https://github.com/hoangdev',
      twitter: 'https://twitter.com/hoangdev',
      email: 'hoang@dulichviet.tech'
    },
    status: 'active',
    featured: true,
    displayOrder: 1,
    department: 'leadership',
    joinedDate: '2024-01-15',
    metaDescription: 'Founder & CEO của Du Lịch Việt - Kết nối văn hóa Việt Nam với công nghệ AI',
    tags: ['AI', 'Travel Tech', 'Founder', 'CEO', 'Vietnam']
  },
  {
    slug: 'tran-thi-lan',
    fullName: 'Trần Thị Lan',
    title: 'Chief Technology Officer',
    bio: 'Chuyên gia AI với niềm đam mê xây dựng hệ thống thông minh phục vụ cộng đồng',
    longBio: 'Trần Thị Lan là CTO của Du Lịch Việt, chịu trách nhiệm về kiến trúc công nghệ và phát triển các mô hình AI tiên tiến. Với bằng Tiến sĩ về Trí tuệ nhân tạo và hơn 8 năm kinh nghiệm trong lĩnh vực AI/ML, chị đã góp phần quan trọng trong việc xây dựng hệ thống gợi ý du lịch thông minh và chatbot AI của nền tảng.',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lan',
    expertise: ['AI Architecture', 'Machine Learning', 'NLP', 'System Design'],
    achievements: [
      'Phát triển mô hình AI gợi ý du lịch với độ chính xác 95%',
      'Xuất bản 10+ bài báo khoa học về AI',
      'Giảng viên thỉnh giảng tại Đại học Bách Khoa'
    ],
    education: [
      {
        degree: 'Tiến sĩ Trí tuệ nhân tạo',
        institution: 'Đại học Bách Khoa Hà Nội',
        year: '2022',
        major: 'Natural Language Processing'
      },
      {
        degree: 'Thạc sĩ Khoa học Máy tính',
        institution: 'Đại học Công nghệ',
        year: '2017'
      }
    ],
    socialLinks: {
      linkedin: 'https://linkedin.com/in/tran-thi-lan',
      github: 'https://github.com/landev',
      email: 'lan@dulichviet.tech'
    },
    status: 'active',
    featured: true,
    displayOrder: 2,
    department: 'technology',
    joinedDate: '2024-01-20',
    metaDescription: 'CTO của Du Lịch Việt - Chuyên gia AI và Machine Learning',
    tags: ['AI', 'CTO', 'Machine Learning', 'NLP', 'Technology']
  },
  {
    slug: 'le-van-duc',
    fullName: 'Lê Văn Đức',
    title: 'Head of Operations',
    bio: 'Chuyên gia vận hành với kinh nghiệm quản lý cộng đồng và phát triển nội dung du lịch',
    longBio: 'Lê Văn Đức là Trưởng phòng Vận hành tại Du Lịch Việt. Với kinh nghiệm hơn 7 năm trong lĩnh vực quản lý cộng đồng và nội dung du lịch, anh đã xây dựng quy trình kiểm duyệt nội dung chuyên nghiệp và phát triển cộng đồng contributor lên hơn 1,000 thành viên tích cực. Anh cũng là người dẫn dắt các chương trình hợp tác với địa phương để đưa các điểm đến độc đáo lên nền tảng.',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Duc',
    expertise: ['Community Management', 'Content Moderation', 'Partnership Development', 'Tourism'],
    achievements: [
      'Xây dựng cộng đồng 1,000+ contributors tích cực',
      'Hợp tác với 50+ địa phương trên toàn quốc',
      'Phát triển quy trình kiểm duyệt nội dung 4-tier'
    ],
    education: [
      {
        degree: 'Cử nhân Quản trị Kinh doanh',
        institution: 'Đại học Kinh tế Quốc dân',
        year: '2016',
        major: 'Quản trị Du lịch và Khách sạn'
      }
    ],
    socialLinks: {
      linkedin: 'https://linkedin.com/in/le-van-duc',
      facebook: 'https://facebook.com/levanduc',
      email: 'duc@dulichviet.tech'
    },
    status: 'active',
    featured: true,
    displayOrder: 3,
    department: 'operations',
    joinedDate: '2024-02-01',
    metaDescription: 'Head of Operations - Quản lý cộng đồng và phát triển nội dung du lịch',
    tags: ['Operations', 'Community', 'Content', 'Tourism', 'Partnership']
  }
];

console.log('=== Seed Team Members via API ===\n');
console.log('Please follow these steps:\n');
console.log('1. Đăng nhập vào tài khoản Admin tại: http://localhost:9002/auth/login');
console.log('2. Mở Developer Tools (F12)');
console.log('3. Vào tab Console');
console.log('4. Copy và paste đoạn code sau:\n');

const apiCode = `
// Lấy auth token từ localStorage
const token = localStorage.getItem('authToken');
if (!token) {
  console.error('❌ Chưa đăng nhập! Vui lòng đăng nhập trước.');
} else {
  console.log('✅ Tìm thấy auth token');

  // Data của 3 team members
  const teamMembers = ${JSON.stringify(teamMembers, null, 2)};

  // Function để tạo team member
  async function createTeamMember(member) {
    try {
      const response = await fetch('http://localhost:9002/api/team', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': \`Bearer \${token}\`
        },
        body: JSON.stringify(member)
      });

      const result = await response.json();

      if (result.success) {
        console.log(\`✅ Tạo thành công: \${member.fullName}\`);
        return true;
      } else {
        console.error(\`❌ Lỗi khi tạo \${member.fullName}:\`, result.error);
        return false;
      }
    } catch (error) {
      console.error(\`❌ Lỗi khi tạo \${member.fullName}:\`, error);
      return false;
    }
  }

  // Tạo tuần tự từng member
  (async () => {
    console.log('\\n🚀 Bắt đầu tạo team members...\\n');

    for (const member of teamMembers) {
      await createTeamMember(member);
      await new Promise(resolve => setTimeout(resolve, 500)); // Đợi 500ms giữa các request
    }

    console.log('\\n✅ Hoàn thành! Kiểm tra tại: http://localhost:9002/about');
    console.log('📋 Hoặc quản lý tại: http://localhost:9002/admin/team');
  })();
}
`;

console.log('━'.repeat(80));
console.log(apiCode);
console.log('━'.repeat(80));

console.log('\n💡 Hoặc sử dụng Postman/Thunder Client:');
console.log('   POST http://localhost:9002/api/team');
console.log('   Headers: Authorization: Bearer YOUR_TOKEN');
console.log('   Body: (copy từ teamMembers array ở trên)\n');

console.log('📝 Lưu ý:');
console.log('   - Phải đăng nhập bằng tài khoản có role = "admin"');
console.log('   - Token sẽ tự động lưu trong localStorage sau khi login');
console.log('   - Mỗi member sẽ được tạo tuần tự để tránh race condition\n');
