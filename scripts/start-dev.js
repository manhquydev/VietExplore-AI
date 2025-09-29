#!/usr/bin/env node

const { spawn } = require('child_process');
const net = require('net');

/**
 * Kiểm tra xem port có đang được sử dụng không
 */
function checkPort(port) {
  return new Promise((resolve) => {
    const server = net.createServer();

    server.listen(port, () => {
      server.close(() => resolve(true));
    });

    server.on('error', () => resolve(false));
  });
}

/**
 * Tìm port khả dụng bắt đầu từ preferredPort
 */
async function findAvailablePort(preferredPort) {
  let port = preferredPort;

  while (!(await checkPort(port))) {
    console.log(`⚠️  Port ${port} đang được sử dụng, thử port ${port + 1}...`);
    port++;
  }

  return port;
}

/**
 * Khởi động Next.js development server
 */
async function startDev() {
  // Lấy port từ env hoặc argument hoặc default
  const envPort = process.env.PORT;
  const argPort = process.argv[2];
  const defaultPort = 9002;

  const preferredPort = parseInt(argPort || envPort || defaultPort);

  console.log(`🚀 Đang tìm port khả dụng bắt đầu từ ${preferredPort}...`);

  const availablePort = await findAvailablePort(preferredPort);

  if (availablePort !== preferredPort) {
    console.log(`✅ Sử dụng port ${availablePort} thay vì ${preferredPort}`);
  } else {
    console.log(`✅ Khởi động Next.js trên port ${availablePort}`);
  }

  // Cập nhật NEXT_PUBLIC_APP_URL với port thực tế
  process.env.NEXT_PUBLIC_APP_URL = `http://localhost:${availablePort}`;

  // Khởi động Next.js
  const nextProcess = spawn('npx', ['next', 'dev', '--port', availablePort.toString()], {
    stdio: 'inherit',
    env: { ...process.env },
    shell: true
  });

  nextProcess.on('error', (error) => {
    console.error('❌ Lỗi khởi động Next.js:', error);
    process.exit(1);
  });

  // Xử lý tín hiệu tắt
  process.on('SIGINT', () => {
    console.log('\n🛑 Đang tắt development server...');
    nextProcess.kill('SIGINT');
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    nextProcess.kill('SIGTERM');
    process.exit(0);
  });
}

startDev().catch(console.error);