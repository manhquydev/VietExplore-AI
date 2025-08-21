// src/app/auth/forgot-password/page.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { useFirebaseAuth } from "@/components/auth/FirebaseAuthProvider";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { sendPasswordReset } = useFirebaseAuth();
  
  const [email, setEmail] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [success, setSuccess] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await sendPasswordReset(email);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Gửi email reset thất bại");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="relative min-h-screen pt-20 pb-12">
          <div className="container">
            <div className="max-w-md mx-auto">
              <div className="text-center mb-8 space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <Logo variant="stacked" size="lg" className="h-20" />
                  </div>
                  
                  <div className="space-y-2">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
                    <h1 className="text-3xl font-bold text-foreground">
                      Email đã được gửi
                    </h1>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                      Chúng tôi đã gửi link reset mật khẩu đến{" "}
                      <span className="font-medium text-primary">{email}</span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-lg shadow-sm border p-6 sm:p-8 space-y-6">
                <div className="text-center space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Vui lòng kiểm tra email và click vào link để reset mật khẩu.
                    Nếu không thấy email, hãy kiểm tra thư mục spam.
                  </p>
                  
                  <div className="space-y-3">
                    <Button
                      onClick={() => router.push('/auth/login')}
                      className="w-full"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Quay lại đăng nhập
                    </Button>
                    
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSuccess(false);
                        setEmail("");
                      }}
                      className="w-full"
                    >
                      Gửi lại email
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="relative min-h-screen pt-20 pb-12">
        <div className="container">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8 space-y-6">
              <div className="space-y-4">
                <div className="flex justify-center">
                  <Logo variant="stacked" size="lg" className="h-20" />
                </div>
                
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold text-foreground">
                    Quên mật khẩu?
                  </h1>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    Nhập email để nhận link reset mật khẩu
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-lg shadow-sm border p-6 sm:p-8 space-y-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="your.email@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                {error && (
                  <div className="p-4 border border-destructive/20 bg-destructive/5 rounded-md">
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isLoading || !email}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Đang gửi...</span>
                    </div>
                  ) : (
                    <span>Gửi email reset</span>
                  )}
                </Button>
              </form>

              <div className="text-center pt-6 border-t border-border/50">
                <Link 
                  href="/auth/login" 
                  className="text-sm text-primary hover:text-primary/80 font-medium transition-colors inline-flex items-center"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Quay lại đăng nhập
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}