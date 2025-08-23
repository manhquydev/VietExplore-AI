#!/usr/bin/env node
/**
 * Complete Local Development Setup Script
 * Khởi động Firebase Emulator + Next.js + tạo test accounts
 * Sử dụng: npm run dev:complete
 */

const { spawn, execSync } = require('child_process');
const path = require('path');

console.log('🚀 Khởi động Complete Local Development Environment...\n');

// Function to check if port is available
async function isPortAvailable(port) {
  return new Promise((resolve) => {
    const net = require('net');
    const server = net.createServer();
    
    server.listen(port, () => {
      server.once('close', () => resolve(true));
      server.close();
    });
    
    server.on('error', () => resolve(false));
  });
}

// Function to wait for emulator to be ready
async function waitForEmulator() {
  console.log('⏳ Đợi Firebase Emulator khởi động...');
  
  let attempts = 0;
  const maxAttempts = 30; // 30 seconds
  
  while (attempts < maxAttempts) {
    try {
      const response = await fetch('http://localhost:4000');
      if (response.ok) {
        console.log('✅ Firebase Emulator đã sẵn sàng!');
        return true;
      }
    } catch (error) {
      // Emulator chưa sẵn sàng
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    attempts++;
    process.stdout.write('.');
  }
  
  console.log('\n❌ Firebase Emulator không khởi động được sau 30 giây');
  return false;
}

async function main() {
  try {
    // Check if required ports are available
    const requiredPorts = [4000, 5002, 8081, 9099, 9002];
    for (const port of requiredPorts) {
      const available = await isPortAvailable(port);
      if (!available) {
        console.log(`❌ Port ${port} đang được sử dụng!`);
        console.log(`💡 Hãy dừng process sử dụng port ${port} hoặc thay đổi config`);
        process.exit(1);
      }
    }

    console.log('✅ Tất cả ports đều sẵn sàng');

    // Step 1: Khởi động Firebase Emulator
    console.log('\n📂 Khởi động Firebase Emulator...');
    const emulatorProcess = spawn('firebase', [
      'emulators:start', 
      '--only', 'auth,firestore,functions,storage,database'
    ], {
      stdio: 'inherit',
      shell: true
    });

    // Wait for emulator to be ready
    await waitForEmulator();

    // Step 2: Tạo test accounts
    console.log('\n👥 Tạo test accounts...');
    try {
      execSync('node scripts/setup-test-accounts-local.js', { 
        stdio: 'inherit',
        cwd: process.cwd()
      });
      console.log('✅ Test accounts đã được tạo!');
    } catch (error) {
      console.log('⚠️  Có thể test accounts đã tồn tại hoặc có lỗi nhỏ');
    }

    // Step 3: Khởi động Next.js
    console.log('\n⚡ Khởi động Next.js...');
    const nextProcess = spawn('npm', ['run', 'dev'], {
      stdio: 'inherit',
      shell: true
    });

    // Handle shutdown
    const cleanup = () => {
      console.log('\n🛑 Đang dừng services...');
      
      if (emulatorProcess) {
        emulatorProcess.kill('SIGTERM');
      }
      
      if (nextProcess) {
        nextProcess.kill('SIGTERM');
      }
      
      process.exit(0);
    };

    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);

    // Display URLs
    setTimeout(() => {
      console.log('\n' + '='.repeat(60));
      console.log('🌟 LOCAL DEVELOPMENT ENVIRONMENT READY!');
      console.log('='.repeat(60));
      console.log('🌐 Next.js App: http://localhost:9002');
      console.log('🔥 Firebase Emulator UI: http://localhost:4000');
      console.log('🔐 Auth UI: http://localhost:4000/auth');
      console.log('🗄️  Firestore UI: http://localhost:4000/firestore');
      console.log('⚡ Functions UI: http://localhost:4000/functions');
      console.log('\n👥 Test Accounts:');
      console.log('   admin2@vietexplore.test / admin123456');
      console.log('   moderator@vietexplore.test / moderator123456');
      console.log('   contributor@vietexplore.test / contributor123456');
      console.log('   partner@vietexplore.test / partner123456');
      console.log('   traveler@vietexplore.test / traveler123456');
      console.log('   guest@vietexplore.test / guest123456');
      console.log('\n⌨️  Press Ctrl+C to stop all services');
      console.log('='.repeat(60));
    }, 3000);

  } catch (error) {
    console.error('❌ Lỗi khởi động:', error);
    process.exit(1);
  }
}

// Run main function
if (require.main === module) {
  main().catch(console.error);
}
