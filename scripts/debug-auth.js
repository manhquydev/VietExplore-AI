// scripts/force-token-refresh.js - Force refresh Firebase Auth token
console.log('🔄 Force Token Refresh Guide');
console.log('==========================\n');

console.log('Nếu sau khi logout/login mà vẫn hiện "Du khách", hãy:');
console.log('');
console.log('1️⃣ CLEAR BROWSER DATA:');
console.log('   - Press F12 → Application → Storage → Clear storage');
console.log('   - Hoặc Ctrl+Shift+Delete → Clear all data');
console.log('');
console.log('2️⃣ FORCE REFRESH TOKEN (trong console):');
console.log('   firebase.auth().currentUser?.getIdToken(true)');
console.log('');
console.log('3️⃣ CHECK CUSTOM CLAIMS:');
console.log('   firebase.auth().currentUser?.getIdTokenResult()');
console.log('     .then(result => console.log(result.claims))');
console.log('');
console.log('4️⃣ HOẶC RESTART EMULATORS:');
console.log('   - Stop emulators: Ctrl+C');
console.log('   - Run: npm run dev:emulator');
console.log('   - Run setup admin lại nếu cần');
console.log('');
console.log('💡 Expected role sau khi fix: "Quản trị viên"');
console.log('🔗 Admin dashboard: http://localhost:9002/admin/dashboard');
