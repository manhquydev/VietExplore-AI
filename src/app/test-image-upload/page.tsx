"use client"

export const dynamic = 'force-dynamic'

import { useState } from "react"
import { ImageUpload, type ImageData } from "@/components/image-upload"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TestImageUploadPage() {
  const [images, setImages] = useState<ImageData[]>([])

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
            Test Enhanced Image Upload
          </h1>
          <p className="text-gray-600 text-lg">
            Test the improved notification system for image upload with branding
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Enhanced Image Upload with Branded Notifications</CardTitle>
            <p className="text-gray-600">
              Upload images to see the new notification system in action. 
              Notifications will appear in the bottom-right corner with:
            </p>
            <ul className="text-sm text-gray-600 space-y-1 mt-2">
              <li>• <strong>Info notification:</strong> When starting upload with processing details</li>
              <li>• <strong>Success notification:</strong> When upload completes successfully</li>
              <li>• <strong>Error notification:</strong> If upload fails with helpful error details</li>
              <li>• <strong>Branded loading:</strong> Du Lịch Việt lotus logo in loading states</li>
            </ul>
          </CardHeader>
          <CardContent>
            <ImageUpload 
              images={images}
              onChange={setImages}
              maxImages={5}
            />
          </CardContent>
        </Card>

        {images.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Current Images ({images.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {images.map((image, index) => (
                  <div key={image.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="w-16 h-12 bg-gray-200 rounded flex items-center justify-center">
                      {image.url ? (
                        <img 
                          src={image.url} 
                          alt={image.alt}
                          className="w-full h-full object-cover rounded"
                        />
                      ) : (
                        <span className="text-gray-500 text-xs">No image</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Ảnh {index + 1}</p>
                      <p className="text-sm text-gray-500">
                        {image.url ? "✓ Uploaded successfully" : "Waiting for upload"}
                      </p>
                      {image.alt && (
                        <p className="text-xs text-gray-400">Alt: {image.alt}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>How to Test</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-semibold mb-2 text-blue-800">Test Upload Success</h4>
                <p className="text-blue-700 text-sm">
                  1. Click "Thêm ảnh mới" button<br/>
                  2. Click "Chọn file từ máy tính" button<br/>
                  3. Select a valid image file (JPG, PNG, WebP, under 5MB)<br/>
                  4. Watch for notifications in the bottom-right corner
                </p>
              </div>
              
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <h4 className="font-semibold mb-2 text-red-800">Test Upload Error</h4>
                <p className="text-red-700 text-sm">
                  1. Try to upload a file that's too large (&gt; 5MB)<br/>
                  2. Try to upload a non-image file (PDF, TXT, etc.)<br/>
                  3. See the branded error notification with helpful details
                </p>
              </div>

              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <h4 className="font-semibold mb-2 text-green-800">Enhanced Features</h4>
                <p className="text-green-700 text-sm">
                  • Loading buttons with Du Lịch Việt lotus logo animation<br/>
                  • Preview areas with branded spinner during upload<br/>
                  • Comprehensive notification feedback system<br/>
                  • Consistent branding throughout the upload process
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}