"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card-custom"
import { AlertTriangle, RefreshCw, Home } from "lucide-react"
import { useRouter } from "next/navigation"

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<ErrorFallbackProps>
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

interface ErrorFallbackProps {
  error: Error
  resetErrorBoundary: () => void
}

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

const DefaultErrorFallback: React.FC<ErrorFallbackProps> = ({ 
  error, 
  resetErrorBoundary 
}) => {
  const router = useRouter()
  
  return (
    <div className="min-h-[400px] flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="p-8 text-center">
          <AlertTriangle className="w-16 h-16 text-warn mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2 text-text">
            Oops! Có lỗi xảy ra
          </h2>
          <p className="text-muted mb-6 text-sm leading-relaxed">
            Đã xảy ra lỗi không mong muốn. Chúng tôi đã ghi nhận sự cố này 
            và sẽ khắc phục sớm nhất có thể.
          </p>
          
          {process.env.NODE_ENV === 'development' && (
            <details className="mb-6 p-3 bg-surface rounded border text-left">
              <summary className="cursor-pointer text-sm font-medium text-muted mb-2">
                Chi tiết lỗi (Development)
              </summary>
              <code className="text-xs text-danger block whitespace-pre-wrap break-all">
                {error.message}
                {error.stack && `\n\n${error.stack}`}
              </code>
            </details>
          )}
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={resetErrorBoundary} variant="default">
              <RefreshCw className="w-4 h-4 mr-2" />
              Thử lại
            </Button>
            <Button 
              onClick={() => router.push('/')} 
              variant="outline"
            >
              <Home className="w-4 h-4 mr-2" />
              Về trang chủ
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    
    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
    
    // In production, you might want to send this to an error reporting service
    if (process.env.NODE_ENV === 'production') {
      // Example: Send to error reporting service
      // errorReportingService.captureException(error, { extra: errorInfo })
    }
  }

  resetErrorBoundary = () => {
    this.setState({ hasError: false, error: undefined })
  }

  render() {
    if (this.state.hasError && this.state.error) {
      const Fallback = this.props.fallback || DefaultErrorFallback
      
      return (
        <Fallback 
          error={this.state.error} 
          resetErrorBoundary={this.resetErrorBoundary}
        />
      )
    }

    return this.props.children
  }
}

// Hook version for functional components
export function useErrorHandler() {
  return React.useCallback((error: Error, errorInfo?: React.ErrorInfo) => {
    console.error('Error caught by useErrorHandler:', error, errorInfo)
    
    // In production, send to error reporting service
    if (process.env.NODE_ENV === 'production') {
      // Example: errorReportingService.captureException(error)
    }
  }, [])
}

// Higher-order component for easier usage
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorFallback?: React.ComponentType<ErrorFallbackProps>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary fallback={errorFallback}>
      <Component {...props} />
    </ErrorBoundary>
  )
  
  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`
  
  return WrappedComponent
}