/**
 * Authentication Constants & Error Messages
 * Centralized configuration for authentication system
 */

// Error message mapping for Firebase Auth errors
export const AUTH_ERROR_MESSAGES: Record<string, string> = {
  // Email/Password errors
  'auth/email-already-in-use': 'Email này đã được sử dụng cho tài khoản khác',
  'auth/weak-password': 'Mật khẩu quá yếu. Vui lòng chọn mật khẩu ít nhất 6 ký tự',
  'auth/invalid-email': 'Email không hợp lệ',
  'auth/user-not-found': 'Không tìm thấy tài khoản với email này',
  'auth/wrong-password': 'Mật khẩu không chính xác',
  'auth/invalid-credential': 'Email hoặc mật khẩu không chính xác',
  'auth/user-disabled': 'Tài khoản này đã bị vô hiệu hóa. Vui lòng liên hệ hỗ trợ',

  // Rate limiting & security
  'auth/too-many-requests': 'Quá nhiều lần thử đăng nhập. Vui lòng thử lại sau vài phút',
  'auth/operation-not-allowed': 'Phương thức đăng nhập này chưa được kích hoạt',

  // Network errors
  'auth/network-request-failed': 'Lỗi kết nối mạng. Vui lòng kiểm tra internet của bạn',
  'auth/timeout': 'Yêu cầu bị hết thời gian chờ. Vui lòng thử lại',

  // Google Sign-in specific
  'auth/popup-closed-by-user': 'Cửa sổ đăng nhập đã bị đóng. Vui lòng thử lại',
  'auth/cancelled-popup-request': 'Yêu cầu đăng nhập đã bị hủy',
  'auth/popup-blocked': 'Popup đăng nhập bị chặn. Vui lòng cho phép popup và thử lại',
  'auth/account-exists-with-different-credential': 'Email này đã được sử dụng với phương thức đăng nhập khác. Vui lòng sử dụng phương thức đăng nhập ban đầu',
  'auth/credential-already-in-use': 'Thông tin xác thực này đã được sử dụng cho tài khoản khác',

  // Token & Session errors
  'auth/invalid-id-token': 'Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại',
  'auth/id-token-expired': 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại',
  'auth/invalid-custom-token': 'Token xác thực không hợp lệ',
  'auth/token-expired': 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại',

  // Email verification
  'auth/invalid-action-code': 'Mã xác thực không hợp lệ hoặc đã hết hạn',
  'auth/expired-action-code': 'Mã xác thực đã hết hạn. Vui lòng yêu cầu mã mới',

  // Password reset
  'auth/missing-email': 'Vui lòng nhập địa chỉ email',
  'auth/invalid-password': 'Mật khẩu không hợp lệ',
  'auth/requires-recent-login': 'Vui lòng đăng nhập lại để thực hiện hành động này',

  // Server errors
  'auth/internal-error': 'Lỗi hệ thống. Vui lòng thử lại sau',
  'auth/service-unavailable': 'Dịch vụ tạm thời không khả dụng. Vui lòng thử lại sau',
}

// Success messages
export const AUTH_SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Đăng nhập thành công! Chào mừng bạn trở lại',
  REGISTER_SUCCESS: 'Đăng ký thành công! Chào mừng bạn đến với VietExplore',
  LOGOUT_SUCCESS: 'Đã đăng xuất thành công',
  PASSWORD_RESET_SENT: 'Email đặt lại mật khẩu đã được gửi. Vui lòng kiểm tra hộp thư của bạn',
  PASSWORD_RESET_SUCCESS: 'Mật khẩu đã được đặt lại thành công',
  EMAIL_VERIFICATION_SENT: 'Email xác thực đã được gửi. Vui lòng kiểm tra hộp thư',
  PROFILE_UPDATE_SUCCESS: 'Cập nhật thông tin thành công',
  GOOGLE_LOGIN_SUCCESS: 'Đăng nhập Google thành công!',
}

// Validation error messages
export const VALIDATION_ERRORS = {
  EMAIL_REQUIRED: 'Vui lòng nhập địa chỉ email',
  EMAIL_INVALID: 'Địa chỉ email không hợp lệ',
  PASSWORD_REQUIRED: 'Vui lòng nhập mật khẩu',
  PASSWORD_MIN_LENGTH: 'Mật khẩu phải có ít nhất 6 ký tự',
  PASSWORD_MISMATCH: 'Mật khẩu xác nhận không khớp',
  FULLNAME_REQUIRED: 'Vui lòng nhập họ và tên',
  TERMS_REQUIRED: 'Bạn phải đồng ý với điều khoản sử dụng',
  FIELDS_REQUIRED: 'Vui lòng điền đầy đủ thông tin',
}

// Auth configuration
export const AUTH_CONFIG = {
  PASSWORD_MIN_LENGTH: 6,
  PASSWORD_MAX_LENGTH: 128,
  TOKEN_REFRESH_THRESHOLD: 5 * 60 * 1000, // 5 minutes before expiry
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes
  SESSION_TIMEOUT: 30 * 24 * 60 * 60 * 1000, // 30 days
}

// Error types for categorization
export enum AuthErrorType {
  VALIDATION = 'validation',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  NETWORK = 'network',
  SERVER = 'server',
  UNKNOWN = 'unknown',
}

// Error severity levels
export enum ErrorSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical',
}

// Auth action types for logging
export enum AuthAction {
  LOGIN = 'login',
  REGISTER = 'register',
  LOGOUT = 'logout',
  PASSWORD_RESET = 'password_reset',
  EMAIL_VERIFICATION = 'email_verification',
  PROFILE_UPDATE = 'profile_update',
  TOKEN_REFRESH = 'token_refresh',
}