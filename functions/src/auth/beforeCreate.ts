// functions/src/auth/beforeCreate.ts
import { beforeUserCreated } from 'firebase-functions/v2/identity';
import { HttpsError } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';

// Danh sách domain bị cấm (có thể mở rộng từ Firestore)
const bannedDomains = [
  'mailinator.com',
  'tempmail.com', 
  'guerrillamail.com',
  '10minutemail.com',
  'temp-mail.org',
  'throwaway.email',
  'maildrop.cc'
];

// Rate limiting: theo dõi IP đăng ký (có thể dùng Redis/Firestore)
const registrationTracker = new Map<string, number[]>();

export const beforeCreate = beforeUserCreated({
  region: 'asia-east1'
}, async (event) => {
  const email = event.data?.email;
  const ipAddress = event.ipAddress;
  
  if (!email) {
    throw new HttpsError('invalid-argument', 'Email là bắt buộc');
  }

  try {
    // 1. Kiểm tra domain bị cấm
    const domain = email.split('@')[1]?.toLowerCase();
    if (domain && bannedDomains.includes(domain)) {
      logger.warn(`Blocked registration from banned domain: ${domain}`, { email, ipAddress });
      throw new HttpsError('permission-denied', 'Domain email này không được phép đăng ký');
    }

    // 2. Rate limiting theo IP (giới hạn 3 đăng ký/IP trong 1 giờ)
    if (ipAddress) {
      const now = Date.now();
      const oneHourAgo = now - (60 * 60 * 1000);
      
      const ipRegistrations = registrationTracker.get(ipAddress) || [];
      const recentRegistrations = ipRegistrations.filter(time => time > oneHourAgo);
      
      if (recentRegistrations.length >= 3) {
        logger.warn(`Rate limit exceeded for IP: ${ipAddress}`, { email, registrationCount: recentRegistrations.length });
        throw new HttpsError('resource-exhausted', 'Quá nhiều lần đăng ký từ IP này. Vui lòng thử lại sau 1 giờ');
      }
      
      // Cập nhật tracker
      recentRegistrations.push(now);
      registrationTracker.set(ipAddress, recentRegistrations);
    }

    // 3. Kiểm tra email format cơ bản
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new HttpsError('invalid-argument', 'Định dạng email không hợp lệ');
    }

    logger.info(`Allowing user creation for email: ${email}`, { ipAddress });
  } catch (error) {
    logger.error('Error in beforeCreate function:', error);
    throw error;
  }
});
