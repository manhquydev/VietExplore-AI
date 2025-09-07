"use client";

import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, Clock, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { EmailVerificationService } from '@/lib/auth/email-verification';
import { cn } from '@/lib/utils';

interface EmailVerificationNoticeProps {
  user: User | null;
  className?: string;
  variant?: 'card' | 'alert' | 'minimal';
  showIcon?: boolean;
  autoHide?: boolean;
}

export function EmailVerificationNotice({
  user,
  className,
  variant = 'alert',
  showIcon = true,
  autoHide = false
}: EmailVerificationNoticeProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string>('');
  const [messageType, setMessageType] = useState<'success' | 'error' | null>(null);
  const [timeUntilCanResend, setTimeUntilCanResend] = useState(0);

  // Don't show if user is null, already verified, or autoHide is true for verified users
  if (!user || (user.emailVerified && autoHide)) {
    return null;
  }

  // If email is already verified, show success message
  if (user.emailVerified) {
    return variant === 'minimal' ? null : (
      <Alert className={cn("bg-green-50 border-green-200", className)}>
        {showIcon && <CheckCircle className="h-4 w-4 text-green-600" />}
        <AlertDescription className="text-green-800">
          Email của bạn đã được xác minh thành công!
        </AlertDescription>
      </Alert>
    );
  }

  // Update countdown timer
  useEffect(() => {
    const updateTimer = () => {
      const remaining = EmailVerificationService.getTimeUntilCanResend();
      setTimeUntilCanResend(remaining);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleResendEmail = async () => {
    setIsLoading(true);
    setMessage('');
    setMessageType(null);

    try {
      await EmailVerificationService.sendVerificationEmailWithRateLimit(user);
      setMessage('Email xác minh đã được gửi lại thành công!');
      setMessageType('success');
    } catch (error: any) {
      setMessage(error.message);
      setMessageType('error');
    } finally {
      setIsLoading(false);
      // Clear message after 5 seconds
      setTimeout(() => {
        setMessage('');
        setMessageType(null);
      }, 5000);
    }
  };

  const canResend = EmailVerificationService.canSendVerificationEmail();

  if (variant === 'minimal') {
    return (
      <div className={cn("flex items-center gap-2 text-sm text-amber-700", className)}>
        {showIcon && <Mail className="h-4 w-4" />}
        <span>Email chưa xác minh</span>
        <Button
          variant="link"
          size="sm"
          onClick={handleResendEmail}
          disabled={isLoading || !canResend}
          className="h-auto p-0 text-sm text-primary hover:text-primary/80"
        >
          {isLoading ? (
            <RefreshCw className="h-3 w-3 animate-spin mr-1" />
          ) : null}
          {canResend ? 'Gửi lại' : `Đợi ${timeUntilCanResend}s`}
        </Button>
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <Card className={cn("border-amber-200 bg-amber-50", className)}>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            {showIcon && <Mail className="h-5 w-5 text-amber-600" />}
            <CardTitle className="text-lg text-amber-800">
              Xác minh email của bạn
            </CardTitle>
          </div>
          <CardDescription className="text-amber-700">
            Chúng tôi đã gửi email xác minh đến <strong>{user.email}</strong>. 
            Vui lòng kiểm tra hộp thư và nhấp vào liên kết xác minh.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            {message && (
              <Alert className={messageType === 'success' ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}>
                <AlertDescription className={messageType === 'success' ? "text-green-800" : "text-red-800"}>
                  {message}
                </AlertDescription>
              </Alert>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleResendEmail}
              disabled={isLoading || !canResend}
              className="w-full sm:w-auto"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Đang gửi...
                </>
              ) : canResend ? (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Gửi lại email xác minh
                </>
              ) : (
                <>
                  <Clock className="mr-2 h-4 w-4" />
                  Gửi lại sau {timeUntilCanResend}s
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Default alert variant
  return (
    <Alert className={cn("bg-amber-50 border-amber-200", className)}>
      {showIcon && <AlertCircle className="h-4 w-4 text-amber-600" />}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <AlertDescription className="text-amber-800">
          <strong>Xác minh email:</strong> Chúng tôi đã gửi email xác minh đến{" "}
          <span className="font-medium">{user.email}</span>. 
          Vui lòng kiểm tra hộp thư và nhấp vào liên kết xác minh.
        </AlertDescription>
        
        <div className="flex flex-col gap-2">
          {message && (
            <p className={cn(
              "text-sm",
              messageType === 'success' ? "text-green-700" : "text-red-700"
            )}>
              {message}
            </p>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleResendEmail}
            disabled={isLoading || !canResend}
            className="shrink-0"
          >
            {isLoading ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Đang gửi...
              </>
            ) : canResend ? (
              'Gửi lại email'
            ) : (
              `Gửi lại sau ${timeUntilCanResend}s`
            )}
          </Button>
        </div>
      </div>
    </Alert>
  );
}

export default EmailVerificationNotice;