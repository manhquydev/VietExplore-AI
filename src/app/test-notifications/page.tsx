"use client"

import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

export default function TestNotificationsPage() {
  const { toast, success, error, warning, info } = useToast()

  const showDefaultToast = () => {
    toast({
      title: "Thông báo mặc định",
      description: "Đây là thông báo mặc định với nội dung chi tiết."
    })
  }

  const showSuccessToast = () => {
    success({
      title: "Thành công!",
      description: "Địa điểm đã được thêm thành công vào danh sách."
    })
  }

  const showErrorToast = () => {
    error({
      title: "Có lỗi xảy ra",
      description: "Không thể tải dữ liệu. Vui lòng thử lại sau."
    })
  }

  const showWarningToast = () => {
    warning({
      title: "Cảnh báo",
      description: "Bạn chưa hoàn thành tất cả thông tin bắt buộc."
    })
  }

  const showInfoToast = () => {
    info({
      title: "Thông tin",
      description: "Cập nhật mới nhất đã được áp dụng cho hệ thống."
    })
  }

  const showMultipleToasts = () => {
    success({ title: "Toast 1", description: "Thông báo đầu tiên" })
    setTimeout(() => info({ title: "Toast 2", description: "Thông báo thứ hai" }), 500)
    setTimeout(() => warning({ title: "Toast 3", description: "Thông báo thứ ba" }), 1000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Test Notification System
          </h1>
          <p className="text-gray-600 text-center mb-8">
            Kiểm tra hệ thống thông báo với các loại thông báo khác nhau.
            Thông báo sẽ hiển thị ở góc dưới bên phải màn hình.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Button 
              onClick={showDefaultToast}
              variant="outline"
              className="h-16 flex flex-col items-center justify-center gap-1"
            >
              <span className="font-medium">Default Toast</span>
              <span className="text-xs text-gray-500">Thông báo mặc định</span>
            </Button>

            <Button 
              onClick={showSuccessToast}
              variant="outline"
              className="h-16 flex flex-col items-center justify-center gap-1 border-green-200 hover:bg-green-50"
            >
              <span className="font-medium text-green-700">Success Toast</span>
              <span className="text-xs text-green-600">Thông báo thành công</span>
            </Button>

            <Button 
              onClick={showErrorToast}
              variant="outline"
              className="h-16 flex flex-col items-center justify-center gap-1 border-red-200 hover:bg-red-50"
            >
              <span className="font-medium text-red-700">Error Toast</span>
              <span className="text-xs text-red-600">Thông báo lỗi</span>
            </Button>

            <Button 
              onClick={showWarningToast}
              variant="outline"
              className="h-16 flex flex-col items-center justify-center gap-1 border-yellow-200 hover:bg-yellow-50"
            >
              <span className="font-medium text-yellow-700">Warning Toast</span>
              <span className="text-xs text-yellow-600">Thông báo cảnh báo</span>
            </Button>

            <Button 
              onClick={showInfoToast}
              variant="outline"
              className="h-16 flex flex-col items-center justify-center gap-1 border-blue-200 hover:bg-blue-50"
            >
              <span className="font-medium text-blue-700">Info Toast</span>
              <span className="text-xs text-blue-600">Thông báo thông tin</span>
            </Button>

            <Button 
              onClick={showMultipleToasts}
              variant="default"
              className="h-16 flex flex-col items-center justify-center gap-1"
            >
              <span className="font-medium">Multiple Toasts</span>
              <span className="text-xs opacity-80">Nhiều thông báo</span>
            </Button>
          </div>

          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">Responsive Design Features:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• <strong>Mobile:</strong> Full width, bottom positioning</li>
              <li>• <strong>Tablet/Desktop:</strong> Fixed width, bottom-right corner</li>
              <li>• <strong>Stack limit:</strong> Maximum 3 notifications</li>
              <li>• <strong>Auto dismiss:</strong> 5 seconds timeout</li>
              <li>• <strong>Modern UI:</strong> Glass morphism effect with backdrop blur</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}