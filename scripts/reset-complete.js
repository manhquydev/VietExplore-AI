const admin = require('firebase-admin');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

// Initialize Firebase Admin
const serviceAccountPath = path.join(__dirname, '..', 'firebase-service-account.json');

if (!admin.apps.length) {
  try {
    const serviceAccount = require(serviceAccountPath);
    const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || `${serviceAccount.project_id}.appspot.com`;

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: storageBucket
    });
    console.log('✅ Firebase Admin đã khởi tạo thành công');
  } catch (error) {
    console.error('❌ Lỗi khởi tạo Firebase Admin:', error.message);
    console.log('📁 Đảm bảo file firebase-service-account.json tồn tại trong thư mục gốc');
    process.exit(1);
  }
}

const db = admin.firestore();

// Initialize storage with error handling
let storage = null;
try {
  storage = admin.storage().bucket();
} catch (error) {
  console.warn('⚠️  Không thể khởi tạo Firebase Storage:', error.message);
  console.log('   (Các thao tác Storage sẽ bị bỏ qua)');
}

// DANH SÁCH ĐẦY ĐỦ TẤT CẢ COLLECTIONS TRONG DỰ ÁN
const ALL_COLLECTIONS = {
  // 1. Core Data (Dữ liệu cốt lõi)
  core: [
    'users',
    'places',
    'place_drafts',
    'placeDrafts', // legacy name
  ],

  // 2. Moderation (Kiểm duyệt)
  moderation: [
    'moderation_queue',
    'moderationQueue', // legacy camelCase version
    'moderation', // parent collection for subcollections (moderation/requests)
    'moderation_logs',
    'suggestions',
    'edit_suggestions',
    'deletion_requests', // soft delete requests
  ],

  // 3. User Interactions (Tương tác người dùng)
  interactions: [
    'user_saved_places',
    'user_favorites',
    'place_reviews',
    'place_reports',
    'reports',
  ],

  // 4. Itineraries (Lộ trình du lịch)
  itineraries: [
    'itineraries',
    'itinerary_likes',
    'itinerary_saves',
    'itineraryShares',
  ],

  // 5. Announcements (Thông báo cộng đồng)
  announcements: [
    'announcements',
  ],

  // 6. Admin & Audit (Quản trị & Kiểm toán)
  admin: [
    'admin_logs',
    'adminLogs', // legacy
    'admin_audit_log',
    'admin_actions',
    'audit_logs',
    'audits',
    'admin_settings',
  ],

  // 7. User Management (Quản lý người dùng)
  userManagement: [
    'user_bans',
    'ban_schedules',
  ],

  // 8. System & Misc (Hệ thống & Khác)
  system: [
    'system', // chứa documents: settings, moderation_settings, notification_settings
    'notifications',
    'notification_digests',
    'preview_sessions',
    'rateLimits',
    'labels',
    'partners',
  ],
};

// Storage folders cần xóa
const STORAGE_FOLDERS = [
  'places/',
  'users/',
  'itineraries/',
  'homepage/', // homepage region images (homepage/regions/bac-bo, etc)
  'announcements/', // announcement images (announcements/images)
];

// Admin configuration
const adminConfig = {
  email: 'admin@dulichviet.tech',
  password: 'Manhquy203@',
  fullName: 'Quản Trị Viên Du Lịch Việt',
  username: 'admin-dulichviet'
};

/**
 * Xóa một collection cụ thể
 */
async function clearCollection(collectionName) {
  try {
    const snapshot = await db.collection(collectionName).get();

    if (snapshot.empty) {
      return 0;
    }

    // Delete in batches (Firestore has 500 writes per batch limit)
    const batchSize = 500;
    let deletedCount = 0;

    while (deletedCount < snapshot.size) {
      const batch = db.batch();
      const docsToDelete = snapshot.docs.slice(deletedCount, deletedCount + batchSize);

      docsToDelete.forEach(doc => {
        batch.delete(doc.ref);
      });

      await batch.commit();
      deletedCount += docsToDelete.length;

      // Show progress for large collections
      if (snapshot.size > 100) {
        console.log(`   📊 Đã xóa ${deletedCount}/${snapshot.size} documents...`);
      }
    }

    return snapshot.size;
  } catch (error) {
    // Collection might not exist, that's ok
    if (error.code === 'NOT_FOUND' || error.message.includes('NOT_FOUND')) {
      return 0;
    }
    throw error;
  }
}

/**
 * Xóa tất cả collections trong Firestore
 */
async function clearAllCollections() {
  console.log('🗑️  ĐANG XÓA TẤT CẢ CÁC COLLECTIONS FIRESTORE...');
  console.log('═══════════════════════════════════════════════\n');

  const stats = {
    total: 0,
    byCategory: {}
  };

  for (const [category, collections] of Object.entries(ALL_COLLECTIONS)) {
    const categoryNames = {
      core: 'Dữ liệu cốt lõi',
      moderation: 'Kiểm duyệt',
      interactions: 'Tương tác người dùng',
      itineraries: 'Lộ trình du lịch',
      announcements: 'Thông báo',
      admin: 'Quản trị & Kiểm toán',
      userManagement: 'Quản lý người dùng',
      system: 'Hệ thống'
    };

    console.log(`\n📂 ${categoryNames[category]}:`);
    console.log('─'.repeat(50));

    let categoryTotal = 0;

    for (const collectionName of collections) {
      try {
        const count = await clearCollection(collectionName);

        if (count > 0) {
          console.log(`   ✅ ${collectionName}: ${count} documents`);
          categoryTotal += count;
        } else {
          console.log(`   ⚪ ${collectionName}: trống hoặc không tồn tại`);
        }
      } catch (error) {
        console.error(`   ❌ ${collectionName}: Lỗi - ${error.message}`);
      }
    }

    stats.byCategory[category] = categoryTotal;
    stats.total += categoryTotal;
  }

  console.log('\n' + '═'.repeat(50));
  console.log(`✅ ĐÃ XÓA TỔNG CỘNG: ${stats.total} documents từ tất cả collections`);
  console.log('═'.repeat(50) + '\n');

  return stats;
}

/**
 * Xóa tất cả files trong Firebase Storage
 */
async function clearAllStorage() {
  if (!storage) {
    console.log('⚠️  Firebase Storage không khả dụng, bỏ qua việc xóa files');
    return { total: 0, byFolder: {} };
  }

  console.log('🗑️  ĐANG XÓA TẤT CẢ FILES TRONG FIREBASE STORAGE...');
  console.log('═══════════════════════════════════════════════\n');

  const stats = {
    total: 0,
    byFolder: {}
  };

  for (const folder of STORAGE_FOLDERS) {
    try {
      const [files] = await storage.getFiles({ prefix: folder });

      if (files.length === 0) {
        console.log(`   ⚪ ${folder}: Trống`);
        stats.byFolder[folder] = 0;
        continue;
      }

      console.log(`   📁 ${folder}: Tìm thấy ${files.length} files`);

      // Delete files in parallel batches
      const batchSize = 100;
      let deletedCount = 0;

      for (let i = 0; i < files.length; i += batchSize) {
        const batch = files.slice(i, i + batchSize);
        const deletePromises = batch.map(file =>
          file.delete().catch(error => {
            console.error(`      ❌ Không thể xóa ${file.name}: ${error.message}`);
          })
        );

        await Promise.all(deletePromises);
        deletedCount += batch.length;

        if (files.length > 100) {
          console.log(`      📊 Đã xóa ${deletedCount}/${files.length} files...`);
        }
      }

      console.log(`   ✅ ${folder}: Đã xóa ${files.length} files`);
      stats.byFolder[folder] = files.length;
      stats.total += files.length;

    } catch (error) {
      console.error(`   ❌ ${folder}: Lỗi - ${error.message}`);
      stats.byFolder[folder] = 0;
    }
  }

  console.log('\n' + '═'.repeat(50));
  console.log(`✅ ĐÃ XÓA TỔNG CỘNG: ${stats.total} files từ Storage`);
  console.log('═'.repeat(50) + '\n');

  return stats;
}

/**
 * Xóa tất cả users từ Firebase Authentication
 */
async function clearAllUsers() {
  console.log('🗑️  ĐANG XÓA TẤT CẢ USERS TỪ FIREBASE AUTHENTICATION...');
  console.log('═══════════════════════════════════════════════\n');

  let deletedCount = 0;
  let nextPageToken;

  try {
    do {
      const listUsersResult = await admin.auth().listUsers(1000, nextPageToken);

      if (listUsersResult.users.length > 0) {
        const deletePromises = listUsersResult.users.map(user =>
          admin.auth().deleteUser(user.uid)
            .then(() => {
              deletedCount++;
              if (deletedCount % 50 === 0) {
                console.log(`   📊 Đã xóa ${deletedCount} users...`);
              }
            })
            .catch(error => {
              console.error(`   ❌ Không thể xóa user ${user.uid}: ${error.message}`);
            })
        );

        await Promise.all(deletePromises);
      }

      nextPageToken = listUsersResult.pageToken;
    } while (nextPageToken);

    console.log(`✅ ĐÃ XÓA TỔNG CỘNG: ${deletedCount} users từ Firebase Auth\n`);

    return deletedCount;
  } catch (error) {
    console.error('❌ Lỗi khi xóa users:', error.message);
    throw error;
  }
}

/**
 * Tạo admin user mới
 */
async function createAdminUser() {
  console.log('👤 ĐANG TẠO TÀI KHOẢN QUẢN TRỊ VIÊN MỚI...');
  console.log('═══════════════════════════════════════════════\n');

  try {
    // Create user in Firebase Auth
    const userRecord = await admin.auth().createUser({
      email: adminConfig.email,
      password: adminConfig.password,
      displayName: adminConfig.fullName,
      emailVerified: true,
    });

    console.log(`   ✅ Đã tạo Firebase Auth user: ${userRecord.uid}`);

    // Create user document in Firestore
    const userData = {
      id: userRecord.uid,
      email: adminConfig.email,
      fullName: adminConfig.fullName,
      username: adminConfig.username,
      role: 'admin',
      verified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      profile: {
        bio: 'Quản trị viên hệ thống Du Lịch Việt',
        location: 'Việt Nam'
      },
      stats: {
        placesContributed: 0,
        itinerariesCreated: 0,
        helpfulVotes: 0,
        placesPublished: 0
      },
      permissions: [
        'all_permissions'
      ],
      disabled: false
    };

    await db.collection('users').doc(userRecord.uid).set(userData);
    console.log(`   ✅ Đã tạo Firestore user document`);

    // Set custom claims
    await admin.auth().setCustomUserClaims(userRecord.uid, {
      role: 'admin',
      verified: true
    });
    console.log(`   ✅ Đã thiết lập custom claims cho admin role\n`);

    return {
      uid: userRecord.uid,
      email: adminConfig.email,
      password: adminConfig.password,
      fullName: adminConfig.fullName
    };
  } catch (error) {
    console.error('❌ Lỗi tạo admin user:', error.message);
    throw error;
  }
}

/**
 * Hiển thị trạng thái database hiện tại
 */
async function showDatabaseStatus() {
  console.log('📊 TÌNH TRẠNG CƠ SỞ DỮ LIỆU HIỆN TẠI');
  console.log('═══════════════════════════════════════════════\n');

  try {
    // Get all collection counts
    const allCollections = Object.values(ALL_COLLECTIONS).flat();
    const uniqueCollections = [...new Set(allCollections)]; // Remove duplicates

    let totalDocuments = 0;
    const collectionCounts = {};

    console.log('📂 FIRESTORE COLLECTIONS:\n');

    for (const collectionName of uniqueCollections) {
      try {
        const snapshot = await db.collection(collectionName).get();
        const count = snapshot.size;

        if (count > 0) {
          console.log(`   📁 ${collectionName.padEnd(25)} : ${count} documents`);
          collectionCounts[collectionName] = count;
          totalDocuments += count;
        }
      } catch (error) {
        // Collection might not exist
      }
    }

    if (totalDocuments === 0) {
      console.log('   ✅ Tất cả collections đều trống!\n');
    } else {
      console.log(`\n   📊 TỔNG CỘNG: ${totalDocuments} documents\n`);
    }

    // Get Firebase Auth users count
    console.log('👥 FIREBASE AUTHENTICATION:\n');
    let usersCount = 0;
    let adminCount = 0;
    const adminUsers = [];

    const listUsersResult = await admin.auth().listUsers(1000);
    usersCount = listUsersResult.users.length;

    // Check for admin users in Firestore
    const usersSnapshot = await db.collection('users').get();
    usersSnapshot.forEach(doc => {
      const userData = doc.data();
      if (userData.role === 'admin') {
        adminCount++;
        adminUsers.push({
          email: userData.email,
          fullName: userData.fullName || 'Chưa có tên'
        });
      }
    });

    console.log(`   👤 Tổng số users: ${usersCount}`);
    console.log(`   👑 Số admin: ${adminCount}`);

    if (adminUsers.length > 0) {
      console.log('\n   👑 DANH SÁCH ADMIN:');
      adminUsers.forEach((admin, index) => {
        console.log(`      ${index + 1}. ${admin.fullName} (${admin.email})`);
      });
    }

    // Get Storage stats
    if (storage) {
      console.log('\n\n💾 FIREBASE STORAGE:\n');

      let totalFiles = 0;

      for (const folder of STORAGE_FOLDERS) {
        try {
          const [files] = await storage.getFiles({ prefix: folder });
          if (files.length > 0) {
            console.log(`   📁 ${folder.padEnd(20)} : ${files.length} files`);
            totalFiles += files.length;
          }
        } catch (error) {
          // Folder might not exist
        }
      }

      if (totalFiles === 0) {
        console.log('   ✅ Tất cả folders đều trống!');
      } else {
        console.log(`\n   📊 TỔNG CỘNG: ${totalFiles} files`);
      }
    }

    console.log('\n' + '═'.repeat(50) + '\n');

    return {
      totalDocuments,
      totalUsers: usersCount,
      totalAdmins: adminCount,
      isEmpty: totalDocuments === 0 && usersCount === 0
    };

  } catch (error) {
    console.error('❌ Lỗi khi lấy thông tin database:', error.message);
    throw error;
  }
}

/**
 * Reset hoàn toàn dự án
 */
async function resetComplete() {
  console.log('\n');
  console.log('🔄 DU LỊCH VIỆT - RESET DỰ ÁN HOÀN TOÀN');
  console.log('═══════════════════════════════════════════════');
  console.log('⚠️  CẢNH BÁO: Thao tác này sẽ XÓA HOÀN TOÀN tất cả dữ liệu!');
  console.log('⚠️  Bao gồm: 33+ Collections + Storage Files + Auth Users');
  console.log('⚠️  KHÔNG ẢNH HƯỞNG: Indexes, Rules, Firebase Config');
  console.log('═══════════════════════════════════════════════\n');

  const startTime = Date.now();

  try {
    // Step 1: Clear all Firestore collections
    console.log('📍 BƯỚC 1/4: Xóa tất cả Firestore collections');
    console.log('─'.repeat(50));
    const collectionsStats = await clearAllCollections();

    // Step 2: Clear all Storage files
    console.log('\n📦 BƯỚC 2/4: Xóa tất cả Storage files');
    console.log('─'.repeat(50));
    const storageStats = await clearAllStorage();

    // Step 3: Clear all Firebase Auth users
    console.log('\n👥 BƯỚC 3/4: Xóa tất cả Firebase Auth users');
    console.log('─'.repeat(50));
    const usersDeleted = await clearAllUsers();

    // Step 4: Create new admin user
    console.log('👤 BƯỚC 4/4: Tạo tài khoản quản trị viên mới');
    console.log('─'.repeat(50));
    const adminResult = await createAdminUser();

    const endTime = Date.now();
    const duration = Math.round((endTime - startTime) / 1000);

    // Final summary
    console.log('\n' + '═'.repeat(50));
    console.log('🎉 RESET DỰ ÁN HOÀN TẤT THÀNH CÔNG!');
    console.log('═══════════════════════════════════════════════');
    console.log(`⏱️  Tổng thời gian: ${duration} giây`);
    console.log('');
    console.log('📊 THỐNG KÊ:');
    console.log(`   🗑️  Documents đã xóa: ${collectionsStats.total}`);
    console.log(`   📦 Files đã xóa: ${storageStats.total}`);
    console.log(`   👥 Users đã xóa: ${usersDeleted}`);
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
    console.log('   4. Có thể thêm dữ liệu mẫu nếu cần:');
    console.log('      - node scripts/seed-places-vietnam.js --confirm');
    console.log('      - node scripts/seed-users.js --confirm');
    console.log('');
    console.log('═'.repeat(50) + '\n');

    return {
      success: true,
      duration,
      stats: {
        collections: collectionsStats,
        storage: storageStats,
        users: usersDeleted
      },
      admin: adminResult
    };

  } catch (error) {
    console.error('\n' + '═'.repeat(50));
    console.error('❌ RESET DỰ ÁN THẤT BẠI!');
    console.error('═══════════════════════════════════════════════');
    console.error('Lỗi:', error.message);
    console.log('');
    console.log('💡 GỢI Ý KHẮC PHỤC:');
    console.log('   1. Kiểm tra kết nối Firebase');
    console.log('   2. Xác nhận file firebase-service-account.json tồn tại');
    console.log('   3. Kiểm tra quyền truy cập Firebase project');
    console.log('   4. Đảm bảo kết nối internet ổn định');
    console.log('');
    console.log('═'.repeat(50) + '\n');

    throw error;
  }
}

/**
 * Parse command line arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  return {
    confirm: args.includes('--confirm'),
    status: args.includes('--status'),
    help: args.includes('--help') || args.includes('-h')
  };
}

/**
 * Show help
 */
function showHelp() {
  console.log('\n🔄 DU LỊCH VIỆT - CÔNG CỤ RESET DỰ ÁN HOÀN TOÀN');
  console.log('═══════════════════════════════════════════════\n');
  console.log('Công cụ này sẽ xóa HOÀN TOÀN tất cả dữ liệu dự án về trạng thái sạch.\n');
  console.log('🎯 TÍNH NĂNG:');
  console.log('   ✅ Xóa 33+ Firestore collections (users, places, itineraries, ...)');
  console.log('   ✅ Xóa tất cả files trong Storage (places/, users/, itineraries/)');
  console.log('   ✅ Xóa tất cả Firebase Auth users');
  console.log('   ✅ Tạo tài khoản admin mới tự động');
  console.log('   ✅ Progress tracking chi tiết');
  console.log('   ✅ Giao diện tiếng Việt\n');
  console.log('⚠️  KHÔNG ẢNH HƯỞNG:');
  console.log('   ✅ Firestore indexes (firestore.indexes.json)');
  console.log('   ✅ Security rules (firestore.rules, storage.rules)');
  console.log('   ✅ Firebase project configuration');
  console.log('   ✅ Cloud Functions deployed\n');
  console.log('📝 CÁC LỆNH:\n');
  console.log('   📊 Kiểm tra trạng thái hiện tại:');
  console.log('      node scripts/reset-complete.js --status\n');
  console.log('   🔄 Reset hoàn toàn dự án:');
  console.log('      node scripts/reset-complete.js --confirm\n');
  console.log('   ❓ Hiển thị trợ giúp:');
  console.log('      node scripts/reset-complete.js --help\n');
  console.log('📧 THÔNG TIN ADMIN SẼ TẠO:');
  console.log(`   Email: ${adminConfig.email}`);
  console.log(`   Tên: ${adminConfig.fullName}`);
  console.log(`   Mật khẩu: [Được cấu hình sẵn]\n`);
  console.log('⚠️  CẢNH BÁO: Thao tác reset KHÔNG THỂ HOÀN TÁC!');
  console.log('   Hãy backup dữ liệu quan trọng trước khi chạy.\n');
  console.log('═'.repeat(50) + '\n');
}

// Run the script
if (require.main === module) {
  const options = parseArgs();

  if (options.help) {
    showHelp();
    process.exit(0);
  }

  if (options.status) {
    showDatabaseStatus()
      .then((stats) => {
        if (stats.isEmpty) {
          console.log('✅ Database đã sạch và sẵn sàng!');
        } else {
          console.log('💡 Để reset về trạng thái sạch, chạy:');
          console.log('   node scripts/reset-complete.js --confirm');
        }
        process.exit(0);
      })
      .catch(() => process.exit(1));
    return;
  }

  if (!options.confirm) {
    showHelp();
    process.exit(0);
  }

  // Confirm before proceeding
  console.log('\n⚠️  BẠN ĐANG CHUẨN BỊ RESET HOÀN TOÀN DỰ ÁN!');
  console.log('⚠️  Tất cả dữ liệu sẽ bị XÓA VĨNH VIỄN!\n');

  // Execute reset
  resetComplete()
    .then(() => {
      console.log('✅ Script hoàn thành thành công');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Script thực hiện thất bại:', error.message);
      process.exit(1);
    });
}

module.exports = {
  resetComplete,
  showDatabaseStatus,
  clearAllCollections,
  clearAllStorage,
  clearAllUsers,
  createAdminUser
};
