import { 
  sendEmailVerification, 
  applyActionCode, 
  verifyBeforeUpdateEmail,
  User 
} from 'firebase/auth';
import { auth } from '@/lib/firebase';

export interface EmailVerificationOptions {
  url?: string;
  handleCodeInApp?: boolean;
}

export class EmailVerificationService {
  static async sendVerificationEmail(
    user: User, 
    options: EmailVerificationOptions = {}
  ): Promise<void> {
    try {
      const actionCodeSettings = {
        url: options.url || `${window.location.origin}/auth/verify-email`,
        handleCodeInApp: options.handleCodeInApp ?? false,
      };

      await sendEmailVerification(user, actionCodeSettings);
    } catch (error: any) {
      console.error('Error sending verification email:', error);
      throw new Error(this.getErrorMessage(error));
    }
  }

  static async verifyEmailCode(oobCode: string): Promise<void> {
    try {
      await applyActionCode(auth, oobCode);
    } catch (error: any) {
      console.error('Error verifying email code:', error);
      throw new Error(this.getErrorMessage(error));
    }
  }

  static async resendVerificationEmail(user: User | null): Promise<boolean> {
    if (!user) {
      throw new Error('Người dùng không tồn tại');
    }

    if (user.emailVerified) {
      throw new Error('Email đã được xác minh');
    }

    try {
      await this.sendVerificationEmail(user);
      return true;
    } catch (error: any) {
      console.error('Error resending verification email:', error);
      throw error;
    }
  }

  static isEmailVerified(user: User | null): boolean {
    return user?.emailVerified ?? false;
  }

  static shouldShowVerificationNotice(user: User | null): boolean {
    return user !== null && !user.emailVerified;
  }

  private static getErrorMessage(error: any): string {
    // Handle case where error is undefined or null
    if (!error) {
      return 'Đã có lỗi xảy ra khi xác minh email.';
    }

    // Handle string errors
    if (typeof error === 'string') {
      return error;
    }

    // Handle Firebase error codes
    if (error.code) {
      switch (error.code) {
        case 'auth/expired-action-code':
          return 'Liên kết xác minh đã hết hạn. Vui lòng yêu cầu liên kết mới.';
        case 'auth/invalid-action-code':
          return 'Liên kết xác minh không hợp lệ.';
        case 'auth/user-disabled':
          return 'Tài khoản đã bị vô hiệu hóa.';
        case 'auth/user-not-found':
          return 'Không tìm thấy tài khoản.';
        case 'auth/too-many-requests':
          return 'Quá nhiều yêu cầu. Vui lòng thử lại sau.';
        case 'auth/network-request-failed':
          return 'Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet.';
        default:
          return `Lỗi Firebase: ${error.code}`;
      }
    }

    // Handle standard Error objects
    if (error.message) {
      return error.message;
    }

    // Fallback for any other error types
    return 'Đã có lỗi xảy ra khi xác minh email.';
  }

  // Rate limiting helper to prevent spam
  private static lastSentTime = 0;
  private static readonly RATE_LIMIT_MS = 60000; // 1 minute

  static canSendVerificationEmail(): boolean {
    const now = Date.now();
    const timeSinceLastSent = now - this.lastSentTime;
    return timeSinceLastSent >= this.RATE_LIMIT_MS;
  }

  static getTimeUntilCanResend(): number {
    const now = Date.now();
    const timeSinceLastSent = now - this.lastSentTime;
    const remaining = this.RATE_LIMIT_MS - timeSinceLastSent;
    return Math.max(0, Math.ceil(remaining / 1000));
  }

  static async sendVerificationEmailWithRateLimit(user: User): Promise<void> {
    if (!this.canSendVerificationEmail()) {
      const seconds = this.getTimeUntilCanResend();
      const error = new Error(`Vui lòng đợi ${seconds} giây trước khi gửi lại email xác minh.`);
      // Add a custom property to identify rate limit errors
      (error as any).isRateLimit = true;
      throw error;
    }

    try {
      await this.sendVerificationEmail(user);
      this.lastSentTime = Date.now();
    } catch (error: any) {
      console.error('Error in sendVerificationEmailWithRateLimit:', error);
      // Re-throw with processed error message
      const processedError = new Error(this.getErrorMessage(error));
      (processedError as any).originalError = error;
      throw processedError;
    }
  }
}

export default EmailVerificationService;