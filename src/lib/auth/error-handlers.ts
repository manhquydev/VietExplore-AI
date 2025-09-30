/**
 * Centralized Error Handling for Authentication
 * Provides consistent error processing, logging, and user feedback
 */

import { AuthError } from 'firebase/auth';
import {
  AUTH_ERROR_MESSAGES,
  AuthErrorType,
  ErrorSeverity,
  AuthAction,
  VALIDATION_ERRORS
} from './auth-constants';

export interface ProcessedAuthError {
  type: AuthErrorType;
  severity: ErrorSeverity;
  message: string;
  code?: string;
  originalError?: any;
  action?: AuthAction;
  retryable: boolean;
  userMessage: string; // User-friendly message
  technicalMessage?: string; // For logging
}

/**
 * Determines error type based on Firebase error code
 */
export function categorizeError(code: string): AuthErrorType {
  if (code.includes('network') || code.includes('timeout')) {
    return AuthErrorType.NETWORK;
  }
  if (code.includes('invalid') || code.includes('wrong') || code.includes('not-found')) {
    return AuthErrorType.AUTHENTICATION;
  }
  if (code.includes('permission') || code.includes('unauthorized') || code.includes('disabled')) {
    return AuthErrorType.AUTHORIZATION;
  }
  if (code.includes('internal') || code.includes('unavailable')) {
    return AuthErrorType.SERVER;
  }
  return AuthErrorType.UNKNOWN;
}

/**
 * Determines error severity
 */
export function getErrorSeverity(type: AuthErrorType, code: string): ErrorSeverity {
  // Critical errors that require immediate attention
  if (code.includes('disabled') || code.includes('internal-error')) {
    return ErrorSeverity.CRITICAL;
  }

  // Network errors are warnings (usually temporary)
  if (type === AuthErrorType.NETWORK) {
    return ErrorSeverity.WARNING;
  }

  // Most auth errors are standard errors
  if (type === AuthErrorType.AUTHENTICATION || type === AuthErrorType.AUTHORIZATION) {
    return ErrorSeverity.ERROR;
  }

  return ErrorSeverity.INFO;
}

/**
 * Checks if error is retryable
 */
export function isRetryableError(type: AuthErrorType, code: string): boolean {
  // Network errors and server errors are typically retryable
  if (type === AuthErrorType.NETWORK || type === AuthErrorType.SERVER) {
    return true;
  }

  // Rate limiting is retryable after cooldown
  if (code.includes('too-many-requests')) {
    return true;
  }

  // Popup closed by user is retryable
  if (code.includes('popup-closed') || code.includes('cancelled-popup')) {
    return true;
  }

  return false;
}

/**
 * Process Firebase Auth Error
 */
export function processFirebaseAuthError(
  error: any,
  action?: AuthAction
): ProcessedAuthError {
  const code = error.code || 'unknown';
  const type = categorizeError(code);
  const severity = getErrorSeverity(type, code);
  const retryable = isRetryableError(type, code);

  // Get user-friendly message
  const userMessage = AUTH_ERROR_MESSAGES[code] ||
    'Đã có lỗi xảy ra. Vui lòng thử lại sau';

  // Technical message for logging
  const technicalMessage = error.message || error.toString();

  return {
    type,
    severity,
    code,
    message: userMessage,
    originalError: error,
    action,
    retryable,
    userMessage,
    technicalMessage,
  };
}

/**
 * Process validation errors
 */
export function processValidationError(
  field: string,
  value: any
): ProcessedAuthError | null {
  let message = '';

  if (field === 'email') {
    if (!value || !value.trim()) {
      message = VALIDATION_ERRORS.EMAIL_REQUIRED;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      message = VALIDATION_ERRORS.EMAIL_INVALID;
    }
  }

  if (field === 'password') {
    if (!value) {
      message = VALIDATION_ERRORS.PASSWORD_REQUIRED;
    } else if (value.length < 6) {
      message = VALIDATION_ERRORS.PASSWORD_MIN_LENGTH;
    }
  }

  if (field === 'fullName') {
    if (!value || !value.trim()) {
      message = VALIDATION_ERRORS.FULLNAME_REQUIRED;
    }
  }

  if (field === 'confirmPassword') {
    // This requires comparing with password, handled separately
    return null;
  }

  if (field === 'terms') {
    if (!value) {
      message = VALIDATION_ERRORS.TERMS_REQUIRED;
    }
  }

  if (!message) return null;

  return {
    type: AuthErrorType.VALIDATION,
    severity: ErrorSeverity.INFO,
    message,
    code: `validation/${field}`,
    retryable: true,
    userMessage: message,
  };
}

/**
 * Log error to console with formatting
 */
export function logAuthError(error: ProcessedAuthError, context?: any) {
  const emoji = {
    [ErrorSeverity.INFO]: 'ℹ️',
    [ErrorSeverity.WARNING]: '⚠️',
    [ErrorSeverity.ERROR]: '❌',
    [ErrorSeverity.CRITICAL]: '🔥',
  }[error.severity];

  console.group(`${emoji} Auth Error [${error.type}]`);
  console.log('User Message:', error.userMessage);
  console.log('Code:', error.code);
  console.log('Severity:', error.severity);
  console.log('Retryable:', error.retryable);
  if (error.action) console.log('Action:', error.action);
  if (error.technicalMessage) console.log('Technical:', error.technicalMessage);
  if (context) console.log('Context:', context);
  if (error.originalError) console.log('Original Error:', error.originalError);
  console.groupEnd();
}

/**
 * Create error for API responses
 */
export function createAPIError(
  statusCode: number,
  message: string,
  code?: string
): ProcessedAuthError {
  let type = AuthErrorType.SERVER;
  let severity = ErrorSeverity.ERROR;

  if (statusCode === 401 || statusCode === 403) {
    type = AuthErrorType.AUTHORIZATION;
  } else if (statusCode === 400) {
    type = AuthErrorType.VALIDATION;
    severity = ErrorSeverity.WARNING;
  } else if (statusCode >= 500) {
    type = AuthErrorType.SERVER;
    severity = ErrorSeverity.CRITICAL;
  }

  return {
    type,
    severity,
    code: code || `http/${statusCode}`,
    message,
    retryable: statusCode >= 500 || statusCode === 408,
    userMessage: message,
  };
}

/**
 * Handle network errors
 */
export function handleNetworkError(error: any): ProcessedAuthError {
  return {
    type: AuthErrorType.NETWORK,
    severity: ErrorSeverity.WARNING,
    code: 'network/failed',
    message: 'Lỗi kết nối mạng. Vui lòng kiểm tra internet của bạn',
    originalError: error,
    retryable: true,
    userMessage: 'Lỗi kết nối mạng. Vui lòng kiểm tra internet của bạn',
    technicalMessage: error?.message || 'Network request failed',
  };
}

/**
 * Get retry delay based on error type (exponential backoff)
 */
export function getRetryDelay(attemptNumber: number, errorType: AuthErrorType): number {
  const baseDelay = {
    [AuthErrorType.NETWORK]: 1000,
    [AuthErrorType.SERVER]: 2000,
    [AuthErrorType.AUTHENTICATION]: 0,
    [AuthErrorType.AUTHORIZATION]: 0,
    [AuthErrorType.VALIDATION]: 0,
    [AuthErrorType.UNKNOWN]: 3000,
  }[errorType];

  // Exponential backoff: baseDelay * (2 ^ attemptNumber)
  return Math.min(baseDelay * Math.pow(2, attemptNumber), 30000); // Max 30 seconds
}

/**
 * Check if error indicates account needs verification
 */
export function requiresEmailVerification(error: ProcessedAuthError): boolean {
  return error.code?.includes('email-not-verified') || false;
}

/**
 * Check if error indicates account is locked/disabled
 */
export function isAccountDisabled(error: ProcessedAuthError): boolean {
  return error.code?.includes('user-disabled') ||
         error.code?.includes('account-disabled') ||
         false;
}

/**
 * Get user-friendly action suggestion based on error
 */
export function getActionSuggestion(error: ProcessedAuthError): string | null {
  if (error.code?.includes('popup-blocked')) {
    return 'Vui lòng cho phép popup trong trình duyệt';
  }

  if (error.code?.includes('network')) {
    return 'Kiểm tra kết nối internet và thử lại';
  }

  if (error.code?.includes('too-many-requests')) {
    return 'Vui lòng đợi 15 phút trước khi thử lại';
  }

  if (error.code?.includes('wrong-password') || error.code?.includes('invalid-credential')) {
    return 'Kiểm tra lại email và mật khẩu';
  }

  if (error.code?.includes('user-not-found')) {
    return 'Tạo tài khoản mới nếu chưa có';
  }

  if (error.code?.includes('email-already-in-use')) {
    return 'Thử đăng nhập hoặc đặt lại mật khẩu';
  }

  if (error.retryable) {
    return 'Thử lại sau vài giây';
  }

  return null;
}