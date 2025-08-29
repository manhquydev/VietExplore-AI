const { clearAllUsers } = require('./clear-all-users');
const { clearAllPlaces } = require('./clear-all-places');
const { createSingleAdmin } = require('./create-single-admin');

// Cấu hình admin cho dự án
const adminConfig = {
  email: 'admin@dulichviet.tech',
  password: 'Manhquy203@',
  fullName: 'Quản Trị Viên Du Lịch Việt',
  username: 'admin-dulichviet'
};

async function resetProjectVietnamese() {
  console.log('🔄 DU LỊCH VIỆT - RESET DỰ ÁN');
  console.log('===============================');
  console.log('');
  console.log('⚠️  CẢNH BÁO: Thao tác này sẽ XÓA HOÀN TOÀN tất cả dữ liệu!');
  console.log('⚠️  Tất cả dữ liệu sẽ bị xóa vĩnh viễn!');
  console.log('');
  
  try {
    const startTime = Date.now();
    
    // Bước 1: Xóa tất cả dữ liệu địa điểm
    console.log('📍 BƯỚC 1: Đang xóa tất cả dữ liệu địa điểm...');
    console.log('──────────────────────────────────────────────');
    await clearAllPlaces();
    console.log('✅ Đã xóa xong dữ liệu địa điểm\n');
    
    // Bước 2: Xóa tất cả dữ liệu người dùng
    console.log('👥 BƯỚC 2: Đang xóa tất cả dữ liệu người dùng...');
    console.log('────────────────────────────────────────────');
    await clearAllUsers();
    console.log('✅ Đã xóa xong dữ liệu người dùng\n');
    
    // Bước 3: Tạo tài khoản admin duy nhất
    console.log('👤 BƯỚC 3: Đang tạo tài khoản quản trị viên...');
    console.log('─────────────────────────────────────────────');
    const adminResult = await createSingleAdmin(adminConfig);
    console.log('✅ Đã tạo xong tài khoản quản trị viên\n');
    
    const endTime = Date.now();
    const duration = Math.round((endTime - startTime) / 1000);
    
    console.log('🎉 RESET DỰ ÁN HOÀN TẤT THÀNH CÔNG!');
    console.log('==================================');
    console.log(`⏱️  Tổng thời gian: ${duration} giây`);
    console.log('');
    console.log('🔑 THÔNG TIN ĐĂNG NHẬP QUẢN TRỊ VIÊN:');
    console.log(`   📧 Email: ${adminResult.email}`);
    console.log(`   🔐 Mật khẩu: ${adminResult.password}`);
    console.log(`   👨‍💼 Tên: ${adminResult.fullName}`);
    console.log('');
    console.log('🚀 CÁC BƯỚC TIẾP THEO:');
    console.log('   1. Khởi động server: npm run dev');
    console.log('   2. Mở trang quản trị: http://localhost:9002/admin');
    console.log('   3. Đăng nhập bằng thông tin trên');
    console.log('   4. Có thể thêm dữ liệu mẫu nếu cần');
    console.log('');
    console.log('📝 SCRIPTS THÊM DỮ LIỆU MẪU:');
    console.log('   - node scripts/seed-places-vietnam.js --confirm');
    console.log('   - node scripts/seed-users.js --confirm');
    console.log('');
    
    return {
      success: true,
      duration,
      admin: adminResult,
      message: 'Reset dự án thành công'
    };
    
  } catch (error) {
    console.error('❌ RESET DỰ ÁN THẤT BẠI!');
    console.error('========================');
    console.error('Lỗi:', error.message);
    console.log('');
    console.log('💡 GỢI Ý KHẮC PHỤC:');
    console.log('   1. Kiểm tra kết nối Firebase');
    console.log('   2. Xác nhận file firebase-service-account.json tồn tại');
    console.log('   3. Kiểm tra quyền truy cập Firebase project');
    console.log('   4. Đảm bảo kết nối internet ổn định');
    console.log('');
    
    throw error;
  }
}

// Hàm hiển thị trạng thái database hiện tại
async function showDatabaseStatusVietnamese() {
  const admin = require('firebase-admin');
  const path = require('path');
  const dotenv = require('dotenv');
  
  // Load biến môi trường
  dotenv.config({ path: path.join(__dirname, '..', '.env.local') });
  
  // Khởi tạo Firebase Admin nếu chưa có
  if (!admin.apps.length) {
    const serviceAccountPath = path.join(__dirname, '..', 'firebase-service-account.json');
    const serviceAccount = require(serviceAccountPath);
    const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || `${serviceAccount.project_id}.appspot.com`;
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: storageBucket
    });
  }
  
  const db = admin.firestore();
  
  try {
    console.log('📊 TÌNH TRẠNG CƠ SỞ DỮ LIỆU HIỆN TẠI:');
    console.log('=====================================');
    
    // Đếm người dùng
    const usersSnapshot = await db.collection('users').get();
    console.log(`👥 Người dùng: ${usersSnapshot.size}`);
    
    // Đếm địa điểm
    const placesSnapshot = await db.collection('places').get();
    console.log(`📍 Địa điểm: ${placesSnapshot.size}`);
    
    // Đếm hàng đợi kiểm duyệt
    const moderationSnapshot = await db.collection('moderation_queue').get();
    console.log(`⚖️  Hàng đợi kiểm duyệt: ${moderationSnapshot.size}`);
    
    // Đếm nhật ký kiểm duyệt
    const logsSnapshot = await db.collection('moderation_logs').get();
    console.log(`📋 Nhật ký kiểm duyệt: ${logsSnapshot.size}`);
    
    // Hiển thị danh sách quản trị viên
    const adminUsers = [];
    usersSnapshot.forEach(doc => {
      const userData = doc.data();
      if (userData.role === 'admin') {
        adminUsers.push({
          email: userData.email,
          fullName: userData.fullName || 'Chưa có tên',
          verified: userData.verified
        });
      }
    });
    
    console.log('');
    console.log('👑 DANH SÁCH QUẢN TRỊ VIÊN:');
    if (adminUsers.length === 0) {
      console.log('   ❌ Không có quản trị viên nào!');
    } else {
      adminUsers.forEach((admin, index) => {
        console.log(`   ${index + 1}. ${admin.fullName} (${admin.email})`);
      });
    }
    
    console.log('');
    
  } catch (error) {
    console.error('❌ Không thể lấy thông tin trạng thái database:', error.message);
  }
}

// Xử lý tham số dòng lệnh
function parseArgsVietnamese() {
  const args = process.argv.slice(2);
  const options = {
    confirm: args.includes('--confirm'),
    status: args.includes('--status')
  };
  
  return options;
}

// Chạy script
if (require.main === module) {
  const options = parseArgsVietnamese();
  
  if (options.status) {
    showDatabaseStatusVietnamese()
      .then(() => process.exit(0))
      .catch(() => process.exit(1));
    return;
  }
  
  if (!options.confirm) {
    console.log('🔄 DU LỊCH VIỆT - CÔNG CỤ RESET DỰ ÁN');
    console.log('====================================');
    console.log('');
    console.log('Công cụ này sẽ giúp bạn reset dự án về trạng thái sạch.');
    console.log('');
    console.log('🎯 TÍNH NĂNG:');
    console.log('   ✅ Xóa toàn bộ địa điểm và ảnh');
    console.log('   ✅ Xóa toàn bộ người dùng');
    console.log('   ✅ Xóa toàn bộ dữ liệu kiểm duyệt');
    console.log('   ✅ Tạo tài khoản quản trị viên duy nhất');
    console.log('');
    console.log('📊 Kiểm tra trạng thái hiện tại:');
    console.log('   node scripts/reset-vn-admin.js --status');
    console.log('');
    console.log('🔄 Thực hiện reset hoàn toàn:');
    console.log('   node scripts/reset-vn-admin.js --confirm');
    console.log('');
    console.log('📧 THÔNG TIN QUẢN TRỊ VIÊN SẼ TẠO:');
    console.log(`   Email: ${adminConfig.email}`);
    console.log(`   Tên: ${adminConfig.fullName}`);
    console.log(`   Mật khẩu: [Được cấu hình sẵn]`);
    console.log('');
    console.log('⚠️  CẢNH BÁO: Thao tác này không thể hoàn tác!');
    console.log('');
    process.exit(0);
  }
  
  resetProjectVietnamese()
    .then(() => {
      console.log('✅ Hoàn thành script thành công');
      process.exit(0);
    })
    .catch(() => {
      console.error('❌ Script thực hiện thất bại');
      process.exit(1);
    });
}

module.exports = {
  resetProjectVietnamese,
  showDatabaseStatusVietnamese
};