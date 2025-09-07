"use client"

import * as React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card-custom"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { X, Loader2 } from "lucide-react"
import { ReportFormData, ReportType, REPORT_TYPE_LABELS } from "@/lib/types/reports"
import { cn } from "@/lib/utils"

interface ReportModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (reportData: ReportFormData) => Promise<void>
  placeName: string
  placeId: string
}

export function ReportModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  placeName,
  placeId 
}: ReportModalProps) {
  const [reportType, setReportType] = useState<ReportType>()
  const [reason, setReason] = useState("")
  const [description, setDescription] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!reportType) {
      alert("Vui lòng chọn loại báo cáo")
      return
    }

    if (!reason.trim()) {
      alert("Vui lòng nhập lý do báo cáo")
      return
    }

    const reportData: ReportFormData = {
      placeId,
      reportType,
      reason: reason.trim(),
      description: description.trim() || undefined
    }

    try {
      setIsSubmitting(true)
      await onSubmit(reportData)
      
      // Reset form
      setReportType(undefined)
      setReason("")
      setDescription("")
      
      onClose()
    } catch (error) {
      // Error handling is done in the parent component
      console.error('Error submitting report:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getReportTypeDetails = (type: ReportType) => {
    switch (type) {
      case 'incorrect_info': 
        return {
          description: 'Thông tin không chính xác, lỗi thời hoặc gây hiểu lầm',
          color: 'bg-blue-50 border-blue-200 text-blue-900',
          priority: 'Cao'
        }
      case 'inappropriate_content': 
        return {
          description: 'Nội dung không phù hợp, vi phạm quy định cộng đồng',
          color: 'bg-red-50 border-red-200 text-red-900',
          priority: 'Nghiêm trọng'
        }
      case 'spam': 
        return {
          description: 'Nội dung quảng cáo, spam hoặc không liên quan',
          color: 'bg-orange-50 border-orange-200 text-orange-900',
          priority: 'Trung bình'
        }
      case 'duplicate': 
        return {
          description: 'Địa điểm bị trùng lặp với địa điểm khác',
          color: 'bg-purple-50 border-purple-200 text-purple-900',
          priority: 'Thấp'
        }
      case 'other': 
        return {
          description: 'Vấn đề khác không thuộc các danh mục trên',
          color: 'bg-gray-50 border-gray-200 text-gray-900',
          priority: 'Thấp'
        }
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-3xl max-h-[95vh] overflow-hidden">
        <Card className="border-none shadow-2xl bg-white/95 backdrop-blur-sm">
          <CardHeader className="relative bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-8 bg-gradient-to-b from-red-500 to-orange-500 rounded-full"></div>
                  <div>
                    <CardTitle className="text-2xl font-bold text-gray-900 tracking-tight">
                      Báo cáo vấn đề
                    </CardTitle>
                    <p className="text-gray-600 font-medium mt-1">
                      Địa điểm: <span className="font-semibold text-gray-800">{placeName}</span>
                    </p>
                  </div>
                </div>
                <div className="bg-amber-50 px-4 py-2 rounded-lg border border-amber-200">
                  <p className="text-sm text-amber-800">
                    Báo cáo của bạn giúp duy trì chất lượng thông tin cho cộng đồng
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </CardHeader>

        <CardContent className="max-h-[calc(95vh-200px)] overflow-y-auto p-6">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Report Type Section */}
            <div className="space-y-6">
              <div>
                <Label className="text-lg font-bold text-gray-900 mb-2 block">
                  Chọn loại vấn đề *
                </Label>
                <p className="text-sm text-gray-600 mb-4">
                  Vui lòng chọn danh mục phù hợp nhất với vấn đề bạn muốn báo cáo
                </p>
              </div>
              
              <RadioGroup value={reportType} onValueChange={(value) => setReportType(value as ReportType)}>
                <div className="grid gap-4">
                  {Object.entries(REPORT_TYPE_LABELS).map(([type, label]) => {
                    const details = getReportTypeDetails(type as ReportType)
                    return (
                      <div key={type} className="relative">
                        <RadioGroupItem 
                          value={type} 
                          id={type}
                          className="peer sr-only" 
                        />
                        <Label 
                          htmlFor={type} 
                          className={cn(
                            "flex flex-col p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:shadow-md group",
                            reportType === type 
                              ? `${details.color} border-current shadow-lg ring-2 ring-current ring-opacity-20` 
                              : "border-gray-200 hover:border-gray-300 bg-white"
                          )}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="font-bold text-lg text-gray-900 group-hover:text-gray-700">
                                {label}
                              </div>
                              <div className="text-sm text-gray-600 mt-2 leading-relaxed">
                                {details.description}
                              </div>
                            </div>
                            <div className={cn(
                              "px-3 py-1 rounded-full text-xs font-semibold ml-4 flex-shrink-0",
                              reportType === type ? "bg-current bg-opacity-20 text-current" : "bg-gray-100 text-gray-600"
                            )}>
                              Mức độ: {details.priority}
                            </div>
                          </div>
                          
                          {reportType === type && (
                            <div className="pt-3 border-t border-current border-opacity-20">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-current rounded-full animate-pulse"></div>
                                <span className="text-sm font-medium text-current">
                                  Đã chọn loại báo cáo này
                                </span>
                              </div>
                            </div>
                          )}
                        </Label>
                      </div>
                    )
                  })}
                </div>
              </RadioGroup>
            </div>

            {/* Reason Section */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="reason" className="text-lg font-bold text-gray-900 mb-2 block">
                  Mô tả vấn đề cụ thể *
                </Label>
                <p className="text-sm text-gray-600 mb-4">
                  Vui lòng mô tả ngắn gọn về vấn đề bạn phát hiện tại địa điểm này
                </p>
              </div>
              <div className="relative">
                <Textarea
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Ví dụ: Địa chỉ không chính xác, giờ mở cửa đã thay đổi, hình ảnh không phù hợp..."
                  rows={3}
                  className="text-base resize-none border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl p-4 transition-colors"
                  maxLength={200}
                  required
                />
                <div className="absolute bottom-2 right-3 text-sm text-gray-400">
                  {reason.length}/200
                </div>
              </div>
            </div>

            {/* Description Section */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="description" className="text-lg font-bold text-gray-900 mb-2 block">
                  Thông tin bổ sung
                </Label>
                <p className="text-sm text-gray-600 mb-4">
                  Cung cấp thêm chi tiết để giúp chúng tôi xử lý báo cáo hiệu quả hơn
                </p>
              </div>
              <div className="relative">
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Thêm các thông tin chi tiết, bằng chứng hoặc đề xuất cách khắc phục..."
                  rows={4}
                  className="text-base resize-none border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl p-4 transition-colors"
                  maxLength={500}
                />
                <div className="absolute bottom-2 right-3 text-sm text-gray-400">
                  {description.length}/500
                </div>
              </div>
            </div>

            {/* Process Info */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
              <div className="space-y-4">
                <h4 className="font-bold text-blue-900 text-lg">
                  Quy trình xử lý báo cáo
                </h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                      <span className="text-sm font-medium text-blue-900">Nhận và phân loại báo cáo</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                      <span className="text-sm font-medium text-blue-900">Xem xét và xác minh thông tin</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                      <span className="text-sm font-medium text-blue-900">Xử lý và cập nhật thông tin</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">4</div>
                      <span className="text-sm font-medium text-blue-900">Thông báo kết quả qua email</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Priority Notice */}
            {reportType && (reportType === 'inappropriate_content' || reportType === 'incorrect_info') && (
              <div className="bg-gradient-to-r from-red-50 to-pink-50 p-5 rounded-xl border-l-4 border-red-400">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <h4 className="font-bold text-red-900 text-lg">
                      Báo cáo ưu tiên cao
                    </h4>
                  </div>
                  <p className="text-sm text-red-800 leading-relaxed">
                    Loại báo cáo này sẽ được xem xét trong vòng <span className="font-semibold">6-24 giờ</span> 
                    và có thể dẫn đến việc tạm thời ẩn địa điểm khỏi danh sách công khai trong quá trình xử lý.
                  </p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 pt-8 border-t border-gray-100 mt-8">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1 py-4 text-base font-semibold border-2 hover:bg-gray-50 transition-colors"
                disabled={isSubmitting}
              >
                Hủy bỏ
              </Button>
              <Button
                type="submit"
                disabled={!reportType || !reason.trim() || isSubmitting}
                className={cn(
                  "flex-1 py-4 text-base font-bold transition-all duration-300",
                  !reportType || !reason.trim() || isSubmitting
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105"
                )}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center gap-3">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Đang gửi báo cáo...</span>
                  </div>
                ) : (
                  <span>Gửi báo cáo ngay</span>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
        </Card>
      </div>
    </div>
  )
}