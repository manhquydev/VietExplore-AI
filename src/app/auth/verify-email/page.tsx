"use client";

export const dynamic = 'force-dynamic'

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Logo } from '@/components/ui/logo';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  XCircle, 
  Loader2, 
  ArrowRight, 
  Mail,
  RefreshCw 
} from 'lucide-react';
import { EmailVerificationService } from '@/lib/auth/email-verification';
import { useAuth } from '@/components/auth/auth-provider';
import { useFirebaseAuth } from '@/hooks/use-firebase-auth';
import { cn } from '@/lib/utils';

type VerificationStatus = 'loading' | 'success' | 'error' | 'expired' | 'invalid';

interface VerificationResult {
  status: VerificationStatus;
  message: string;
  canRetry?: boolean;
}

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { getIdToken } = useFirebaseAuth();
  
  const [verificationResult, setVerificationResult] = useState<VerificationResult>({
    status: 'loading',
    message: 'Đang xác minh email của bạn...'
  });
  const [redirectCountdown, setRedirectCountdown] = useState(5);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    const verifyEmail = async () => {
      const oobCode = searchParams.get('oobCode');
      const mode = searchParams.get('mode');

      // Check if this is a valid email verification link
      if (!oobCode || mode !== 'verifyEmail') {
        setVerificationResult({
          status: 'invalid',
          message: 'Liên kết xác minh không hợp lệ hoặc bị thiếu thông tin cần thiết.',
          canRetry: true
        });
        return;
      }

      try {
        await EmailVerificationService.verifyEmailCode(oobCode);
        
        // Sync the email verification status with our backend
        if (user) {
          try {
            const token = await getIdToken();
            await fetch('/api/auth/sync-email-verification', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
          } catch (syncError) {
            console.error('Failed to sync email verification status:', syncError);
            // Don't fail the verification if sync fails
          }
        }
        
        setVerificationResult({
          status: 'success',
          message: 'Email của bạn đã được xác minh thành công! Bạn có thể sử dụng đầy đủ các tính năng của Du Lịch Việt AI.'
        });

        // Start countdown for redirect
        const countdownInterval = setInterval(() => {
          setRedirectCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(countdownInterval);
              router.replace('/');
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        return () => clearInterval(countdownInterval);
        
      } catch (error: any) {
        console.error('Email verification error:', error);
        
        let status: VerificationStatus = 'error';
        let message = 'Đã có lỗi xảy ra khi xác minh email.';
        let canRetry = false;

        if (error.message.includes('hết hạn')) {
          status = 'expired';
          message = 'Liên kết xác minh đã hết hạn. Vui lòng yêu cầu liên kết mới.';
          canRetry = true;
        } else if (error.message.includes('không hợp lệ')) {
          status = 'invalid';
          message = 'Liên kết xác minh không hợp lệ hoặc đã được sử dụng.';
          canRetry = true;
        } else {
          message = error.message;
        }

        setVerificationResult({
          status,
          message,
          canRetry
        });
      }
    };

    verifyEmail();
  }, [searchParams, router]);

  const handleResendVerification = async () => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    setIsResending(true);
    try {
      await EmailVerificationService.sendVerificationEmailWithRateLimit(user);
      setVerificationResult({
        status: 'success',
        message: 'Email xác minh mới đã được gửi! Vui lòng kiểm tra hộp thư của bạn.'
      });
    } catch (error: any) {
      setVerificationResult({
        status: 'error',
        message: error.message || 'Không thể gửi email xác minh. Vui lòng thử lại sau.',
        canRetry: true
      });
    } finally {
      setIsResending(false);
    }
  };

  const getStatusIcon = () => {
    switch (verificationResult.status) {
      case 'loading':
        return <Loader2 className="w-12 h-12 text-primary animate-spin" />;
      case 'success':
        return <CheckCircle className="w-12 h-12 text-green-600" />;
      case 'error':
      case 'expired':
      case 'invalid':
        return <XCircle className="w-12 h-12 text-red-600" />;
      default:
        return <Mail className="w-12 h-12 text-muted-foreground" />;
    }
  };

  const getStatusColor = () => {
    switch (verificationResult.status) {
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'error':
      case 'expired':
      case 'invalid':
        return 'border-red-200 bg-red-50';
      default:
        return 'border-primary/20 bg-primary/5';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="relative min-h-screen pt-20 pb-12">
        <div className="container">
          <div className="max-w-lg mx-auto">
            {/* Logo */}
            <div className="flex justify-center mb-8">
              <Logo variant="horizontal" size="xl" className="h-24" />
            </div>

            {/* Verification Status Card */}
            <Card className={cn("text-center", getStatusColor())}>
              <CardHeader className="space-y-4">
                <div className="flex justify-center">
                  {getStatusIcon()}
                </div>
                
                <CardTitle className="text-2xl">
                  {verificationResult.status === 'loading' && 'Đang xác minh email...'}
                  {verificationResult.status === 'success' && 'Xác minh thành công!'}
                  {verificationResult.status === 'error' && 'Xác minh thất bại'}
                  {verificationResult.status === 'expired' && 'Liên kết đã hết hạn'}
                  {verificationResult.status === 'invalid' && 'Liên kết không hợp lệ'}
                </CardTitle>

                <CardDescription className="text-base">
                  {verificationResult.message}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Success: Show countdown and navigation */}
                {verificationResult.status === 'success' && (
                  <div className="space-y-4">
                    <Alert className="bg-green-100 border-green-200">
                      <AlertDescription className="text-green-800">
                        Bạn sẽ được chuyển hướng về trang chủ trong {redirectCountdown} giây...
                      </AlertDescription>
                    </Alert>
                    
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <Button asChild>
                        <Link href="/">
                          <ArrowRight className="mr-2 h-4 w-4" />
                          Về trang chủ ngay
                        </Link>
                      </Button>
                      
                      {user && (
                        <Button variant="outline" asChild>
                          <Link href="/profile">
                            Xem hồ sơ
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                )}

                {/* Error states: Show retry options */}
                {(verificationResult.status === 'error' || 
                  verificationResult.status === 'expired' || 
                  verificationResult.status === 'invalid') && (
                  <div className="space-y-4">
                    {verificationResult.canRetry && (
                      <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        {user ? (
                          <Button
                            onClick={handleResendVerification}
                            disabled={isResending}
                          >
                            {isResending ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Đang gửi...
                              </>
                            ) : (
                              <>
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Gửi lại email xác minh
                              </>
                            )}
                          </Button>
                        ) : (
                          <Button asChild>
                            <Link href="/auth/login">
                              <Mail className="mr-2 h-4 w-4" />
                              Đăng nhập để gửi lại
                            </Link>
                          </Button>
                        )}
                        
                        <Button variant="outline" asChild>
                          <Link href="/">
                            Về trang chủ
                          </Link>
                        </Button>
                      </div>
                    )}

                    {!verificationResult.canRetry && (
                      <Button variant="outline" asChild>
                        <Link href="/contact">
                          Liên hệ hỗ trợ
                        </Link>
                      </Button>
                    )}
                  </div>
                )}

                {/* Loading state */}
                {verificationResult.status === 'loading' && (
                  <div className="text-sm text-muted-foreground">
                    Vui lòng đợi trong giây lát...
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Additional information */}
            <div className="mt-8 text-center">
              <p className="text-sm text-muted-foreground">
                Cần hỗ trợ?{" "}
                <Link 
                  href="/contact" 
                  className="text-primary hover:text-primary/80 font-medium"
                >
                  Liên hệ với chúng tôi
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}