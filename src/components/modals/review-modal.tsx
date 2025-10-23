"use client"

import * as React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card-custom"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { X, Star, Calendar, Image, Loader2 } from "lucide-react"
import { ReviewFormData } from "@/lib/types/reviews"
import { cn } from "@/lib/utils"

interface ReviewModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (reviewData: ReviewFormData) => Promise<void>
  placeName: string
  placeId: string
}

export function ReviewModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  placeName,
  placeId 
}: ReviewModalProps) {
  const [rating, setRating] = useState<number>(0)
  const [hoverRating, setHoverRating] = useState<number>(0)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [visitDate, setVisitDate] = useState("")
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    console.log('[REVIEW-FORM] Submit triggered');
    console.log('[REVIEW-FORM] Form state:', { rating, hasTitle: !!title.trim(), hasContent: !!content.trim(), hasVisitDate: !!visitDate, isAnonymous });

    if (rating === 0) {
      console.log('[REVIEW-FORM] ❌ Validation failed: No rating');
      alert("Vui lòng chọn số sao đánh giá")
      return
    }

    if (!content.trim()) {
      console.log('[REVIEW-FORM] ❌ Validation failed: No content');
      alert("Vui lòng nhập nội dung đánh giá")
      return
    }

    const reviewData: ReviewFormData = {
      placeId,
      rating,
      title: title.trim() || undefined,
      content: content.trim(),
      visitDate: visitDate || undefined,
      isAnonymous
    }

    console.log('[REVIEW-FORM] ✅ Validation passed');
    console.log('[REVIEW-FORM] Submitting review data:', JSON.stringify(reviewData, null, 2));

    try {
      setIsSubmitting(true)
      await onSubmit(reviewData)

      console.log('[REVIEW-FORM] ✅ Review submitted successfully');

      // Reset form
      setRating(0)
      setHoverRating(0)
      setTitle("")
      setContent("")
      setVisitDate("")
      setIsAnonymous(false)

      onClose()
    } catch (error) {
      // Error handling is done in the hook
      console.error('[REVIEW-FORM] ❌ Error submitting review:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRatingClick = (value: number) => {
    setRating(value)
  }

  const getRatingText = (rating: number) => {
    switch (rating) {
      case 1: return "Rất tệ"
      case 2: return "Tệ"
      case 3: return "Trung bình"
      case 4: return "Tốt"
      case 5: return "Xuất sắc"
      default: return "Chọn đánh giá"
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto border-none shadow-2xl">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold text-gray-900">
              Đánh giá địa điểm
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="rounded-full hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          <p className="text-gray-600 text-lg font-medium">{placeName}</p>
        </CardHeader>

        <CardContent className="space-y-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Rating Section */}
            <div className="space-y-4">
              <Label className="text-base font-semibold text-gray-900">
                Đánh giá tổng thể *
              </Label>
              <div className="flex items-center gap-4">
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      className="focus:outline-none transition-transform hover:scale-110"
                      onClick={() => handleRatingClick(value)}
                      onMouseEnter={() => setHoverRating(value)}
                      onMouseLeave={() => setHoverRating(0)}
                    >
                      <Star
                        className={cn(
                          "h-8 w-8 transition-colors",
                          (hoverRating >= value || rating >= value)
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-300 hover:text-yellow-400"
                        )}
                      />
                    </button>
                  ))}
                </div>
                <div className="flex flex-col">
                  <span className="text-lg font-semibold text-gray-900">
                    {getRatingText(hoverRating || rating)}
                  </span>
                  {(hoverRating || rating) > 0 && (
                    <span className="text-sm text-gray-600">
                      {hoverRating || rating}/5 sao
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Title Section */}
            <div className="space-y-3">
              <Label htmlFor="title" className="text-base font-semibold text-gray-900">
                Tiêu đề (tùy chọn)
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Tóm tắt trải nghiệm của bạn..."
                className="text-base"
                maxLength={100}
              />
              <div className="text-right text-sm text-gray-500">
                {title.length}/100 ký tự
              </div>
            </div>

            {/* Content Section */}
            <div className="space-y-3">
              <Label htmlFor="content" className="text-base font-semibold text-gray-900">
                Nội dung đánh giá *
              </Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Chia sẻ chi tiết về trải nghiệm của bạn tại địa điểm này..."
                rows={6}
                className="text-base resize-none"
                maxLength={1000}
                required
              />
              <div className="text-right text-sm text-gray-500">
                {content.length}/1000 ký tự
              </div>
            </div>

            {/* Visit Date Section */}
            <div className="space-y-3">
              <Label htmlFor="visitDate" className="text-base font-semibold text-gray-900">
                Ngày ghé thăm (tùy chọn)
              </Label>
              <div className="relative">
                <Input
                  id="visitDate"
                  type="date"
                  value={visitDate}
                  onChange={(e) => setVisitDate(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  className="text-base pl-10"
                />
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
            </div>

            {/* Anonymous Option */}
            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
              <Checkbox
                id="anonymous"
                checked={isAnonymous}
                onCheckedChange={setIsAnonymous}
              />
              <Label 
                htmlFor="anonymous" 
                className="text-base font-medium text-gray-700 cursor-pointer flex-1"
              >
                Đăng đánh giá ẩn danh
              </Label>
            </div>

            {/* Guidelines */}
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-2">
                Hướng dẫn viết đánh giá
              </h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Chia sẻ trải nghiệm thực tế và khách quan</li>
                <li>• Mô tả chi tiết về cảnh quan, dịch vụ, tiện ích</li>
                <li>• Đưa ra lời khuyên hữu ích cho du khách khác</li>
                <li>• Tránh sử dụng ngôn từ không phù hợp</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1 py-3 text-base font-semibold hover:bg-gray-50"
                disabled={isSubmitting}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                disabled={rating === 0 || !content.trim() || isSubmitting}
                className="flex-1 py-3 text-base font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/50 hover:shadow-xl hover:shadow-blue-600/50 transition-all duration-200"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Đang gửi...
                  </>
                ) : (
                  'Gửi đánh giá'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}