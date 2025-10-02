"use client"

export const dynamic = 'force-dynamic'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  BrandedLoading, 
  FullScreenLoading, 
  LoadingButton, 
  BrandedCardSkeleton,
  PageLoadingOverlay 
} from "@/components/ui/branded-loading"
import { LoadingSpinner, LoadingOverlay, LoadingCard } from "@/components/ui/loading-spinner"

export default function TestLoadingPage() {
  const [isPageLoading, setIsPageLoading] = useState(false)
  const [isOverlayLoading, setIsOverlayLoading] = useState(false)
  const [isButtonLoading, setIsButtonLoading] = useState(false)
  const [showFullScreen, setShowFullScreen] = useState(false)

  const handleButtonClick = async () => {
    setIsButtonLoading(true)
    await new Promise(resolve => setTimeout(resolve, 3000))
    setIsButtonLoading(false)
  }

  const handleOverlayTest = async () => {
    setIsOverlayLoading(true)
    await new Promise(resolve => setTimeout(resolve, 3000))
    setIsOverlayLoading(false)
  }

  const handlePageLoadingTest = async () => {
    setIsPageLoading(true)
    await new Promise(resolve => setTimeout(resolve, 3000))
    setIsPageLoading(false)
  }

  const handleFullScreenTest = () => {
    setShowFullScreen(true)
    setTimeout(() => setShowFullScreen(false), 5000)
  }

  if (showFullScreen) {
    return <FullScreenLoading variant="logo" showProgress={true} progress={60} />
  }

  return (
    <PageLoadingOverlay isLoading={isPageLoading}>
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              Branded Loading System Test
            </h1>
            <p className="text-gray-600 text-lg">
              Test all loading components with Du Lịch Việt branding
            </p>
          </div>

          {/* Control Buttons */}
          <Card>
            <CardHeader>
              <CardTitle>Test Controls</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button onClick={handleFullScreenTest} variant="outline">
                  Full Screen Loading
                </Button>
                <Button onClick={handlePageLoadingTest} variant="outline">
                  Page Loading Overlay
                </Button>
                <Button onClick={handleOverlayTest} variant="outline">
                  Component Overlay
                </Button>
                <LoadingButton 
                  isLoading={isButtonLoading}
                  onClick={handleButtonClick}
                  variant="primary"
                  loadingText="Processing..."
                >
                  Test Loading Button
                </LoadingButton>
              </div>
            </CardContent>
          </Card>

          {/* Branded Loading Variants */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Branded Loading Variants</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div className="text-center space-y-3">
                    <h3 className="font-semibold">Logo Animation</h3>
                    <BrandedLoading variant="logo" size="lg" />
                  </div>
                  <div className="text-center space-y-3">
                    <h3 className="font-semibold">Spinner</h3>
                    <BrandedLoading variant="spinner" size="lg" />
                  </div>
                  <div className="text-center space-y-3">
                    <h3 className="font-semibold">Pulse</h3>
                    <BrandedLoading variant="pulse" size="lg" />
                  </div>
                  <div className="text-center space-y-3">
                    <h3 className="font-semibold">Dots</h3>
                    <BrandedLoading variant="dots" size="lg" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Loading Sizes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 items-center">
                  <div className="text-center space-y-2">
                    <h4 className="text-sm font-medium">Small</h4>
                    <BrandedLoading variant="logo" size="sm" />
                  </div>
                  <div className="text-center space-y-2">
                    <h4 className="text-sm font-medium">Medium</h4>
                    <BrandedLoading variant="logo" size="md" />
                  </div>
                  <div className="text-center space-y-2">
                    <h4 className="text-sm font-medium">Large</h4>
                    <BrandedLoading variant="logo" size="lg" />
                  </div>
                  <div className="text-center space-y-2">
                    <h4 className="text-sm font-medium">Extra Large</h4>
                    <BrandedLoading variant="logo" size="xl" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Legacy vs Branded Spinners */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Legacy Loading Spinners</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 items-center">
                  <div className="text-center space-y-2">
                    <h4 className="text-sm font-medium">Default</h4>
                    <LoadingSpinner size="lg" variant="default" />
                  </div>
                  <div className="text-center space-y-2">
                    <h4 className="text-sm font-medium">Primary</h4>
                    <LoadingSpinner size="lg" variant="primary" />
                  </div>
                  <div className="text-center space-y-2">
                    <h4 className="text-sm font-medium">Secondary</h4>
                    <LoadingSpinner size="lg" variant="secondary" />
                  </div>
                  <div className="text-center space-y-2">
                    <h4 className="text-sm font-medium">Branded</h4>
                    <LoadingSpinner size="lg" variant="branded" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <LoadingOverlay isLoading={isOverlayLoading}>
              <Card>
                <CardHeader>
                  <CardTitle>Component with Overlay</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-gray-600">
                      This card will show a loading overlay when you click the "Component Overlay" button.
                    </p>
                    <div className="grid grid-cols-1 gap-4">
                      <div className="h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        Sample Content Area
                      </div>
                      <div className="h-8 bg-gray-50 rounded flex items-center px-4">
                        More content here...
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </LoadingOverlay>
          </div>

          {/* Loading Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Branded Card Skeleton</h3>
              <BrandedCardSkeleton showImage={true} lines={4} />
            </div>
            
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Legacy Loading Card</h3>
              <LoadingCard showImage={true} lines={4} />
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Simple Loading Card</h3>
              <BrandedCardSkeleton showImage={false} lines={3} />
            </div>
          </div>

          {/* Loading States Comparison */}
          <Card>
            <CardHeader>
              <CardTitle>Usage Examples</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-pink-50 rounded-lg border border-pink-200">
                    <h4 className="font-semibold mb-2 text-pink-800">For Page Loading</h4>
                    <code className="text-sm text-pink-700 bg-white p-2 rounded block">
                      {'<FullScreenLoading variant="logo" />'}
                    </code>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <h4 className="font-semibold mb-2 text-purple-800">For Button States</h4>
                    <code className="text-sm text-purple-700 bg-white p-2 rounded block">
                      {'<LoadingButton isLoading={...} />'}
                    </code>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-semibold mb-2 text-blue-800">For Component Loading</h4>
                    <code className="text-sm text-blue-700 bg-white p-2 rounded block">
                      {'<BrandedLoading variant="spinner" />'}
                    </code>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <h4 className="font-semibold mb-2 text-green-800">For Card Skeletons</h4>
                    <code className="text-sm text-green-700 bg-white p-2 rounded block">
                      {'<BrandedCardSkeleton />'}
                    </code>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold mb-2">Key Features:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• <strong>Brand Integration:</strong> Uses Du Lịch Việt lotus logo in animations</li>
                    <li>• <strong>Modern UX:</strong> Smooth animations with proper timing and easing</li>
                    <li>• <strong>Responsive Design:</strong> Adapts to different screen sizes automatically</li>
                    <li>• <strong>Accessibility:</strong> Proper ARIA labels and screen reader support</li>
                    <li>• <strong>Flexible Variants:</strong> Multiple styles for different use cases</li>
                    <li>• <strong>Performance Optimized:</strong> Efficient CSS animations and SVG usage</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLoadingOverlay>
  )
}