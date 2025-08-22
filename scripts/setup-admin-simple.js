// scripts/setup-admin-simple.js - Simple Admin Setup for Local
const { execSync } = require('child_process');

console.log('🔧 VietExplore AI - Local Admin Setup Guide');
console.log('==========================================\n');

console.log('📋 Để setup admin role trong local emulator, làm theo các bước sau:\n');

console.log('1️⃣ ĐĂNG KÝ TÀI KHOẢN:');
console.log('   - Mở: http://localhost:9002/auth/register');
console.log('   - Đăng ký với email: manhquydev@gmail.com');
console.log('   - Password: password123 (hoặc password bất kỳ)');
console.log('   - Hoàn thành đăng ký\n');

console.log('2️⃣ LẤY UID TỪ EMULATOR UI:');
console.log('   - Mở: http://127.0.0.1:4000/auth');
console.log('   - Tìm user manhquydev@gmail.com');
console.log('   - Copy UID của user\n');

console.log('3️⃣ CHẠY FUNCTION PROMOTE:');
console.log('   Sau khi có UID, chạy command:');
console.log('   curl -X POST "http://127.0.0.1:5002/vietexplore-ai/asia-southeast1/promoteUser" \\');
console.log('        -H "Content-Type: application/json" \\');
console.log('        -d \'{"targetUid": "YOUR_UID_HERE", "newRole": "admin"}\'\n');

console.log('4️⃣ HOẶC SỬ DỤNG EMERGENCY PROMOTE:');
console.log('   curl -X POST "http://127.0.0.1:5002/vietexplore-ai/asia-southeast1/emergencyPromoteAdmin" \\');
console.log('        -H "Content-Type: application/json" \\');
console.log('        -d \'{"email": "manhquydev@gmail.com", "emergencyKey": "emergency123"}\'\n');

console.log('5️⃣ XÁC NHẬN SETUP:');
console.log('   - Login lại với tài khoản admin');
console.log('   - Truy cập: http://localhost:9002/admin/dashboard');
console.log('   - Kiểm tra admin panel có hoạt động không\n');

console.log('🔗 EMULATOR URLS:');
console.log('   - App: http://localhost:9002');
console.log('   - Firebase UI: http://127.0.0.1:4000');
console.log('   - Auth UI: http://127.0.0.1:4000/auth');
console.log('   - Firestore UI: http://127.0.0.1:4000/firestore\n');

console.log('💡 LƯU Ý:');
console.log('   - Đảm bảo emulators đang chạy (npm run dev:emulator)');
console.log('   - Data trong emulator sẽ mất khi restart');
console.log('   - Chỉ dành cho local development\n');

console.log('✨ Hoàn thành setup sẽ có admin role trong local environment!');
