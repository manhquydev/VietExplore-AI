// functions/src/auth/beforeCreate.ts
import { beforeUserCreated } from 'firebase-functions/v2/identity';
import { HttpsError } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';
import * as logger from 'firebase-functions/logger';

// Ensure admin is initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

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
  const userData = event.data;
  const ipAddress = event.ipAddress;
  
  if (!userData) {
    throw new HttpsError('invalid-argument', 'User data is required');
  }

  const { uid, email, displayName, photoURL } = userData;
  
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

    // 4. 🔧 TẠO USER DOCUMENT TRONG FIRESTORE
    // Tạo user profile document trước khi user được tạo
    const userProfile = {
      id: uid,
      email: email,
      displayName: displayName || '',
      photoURL: photoURL || '',
      role: 'traveler',
      status: 'active',
      verifiedContributor: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      authProvider: userData.providerData?.[0]?.providerId || 'password',
      emailVerified: false
    };

    // Tạo document trong Firestore với Admin SDK (bypass security rules)
    await admin.firestore()
      .collection('users')
      .doc(uid)
      .set(userProfile);

    logger.info(`✅ User registration approved and profile created for ${email}`, { uid, ipAddress });

    // Note: Custom claims sẽ được set trong onUserDocumentCreate trigger
    // vì user chưa tồn tại trong Auth tại thời điểm beforeCreate

  } catch (error) {
    if (error instanceof HttpsError) {
      throw error;
    }
    
    logger.error('Error in beforeCreate trigger:', error);
    throw new HttpsError('internal', 'Lỗi hệ thống khi xử lý đăng ký');
  }
});
