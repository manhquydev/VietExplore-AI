/**
 * Notification Preferences Component
 * Allows users to manage their notification settings
 */

"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Bell, 
  Mail, 
  Phone, 
  Clock, 
  Settings, 
  Heart, 
  MapPin, 
  Shield,
  Loader2,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { useNotificationPreferences } from "@/hooks/use-notification-preferences";
import { toastService } from "@/lib/ui/toast-service";
import { cn } from "@/lib/utils";

const channelIcons = {
  inApp: Bell,
  push: Bell,
  email: Mail,
  sms: Phone
};

const channelLabels = {
  inApp: "Trong ứng dụng",
  push: "Thông báo đẩy",
  email: "Email",
  sms: "SMS"
};

const categoryIcons = {
  places: MapPin,
  interactions: Heart,
  system: Settings,
  moderation: Shield
};

const categoryLabels = {
  places: "Địa điểm",
  interactions: "Tương tác",
  system: "Hệ thống",
  moderation: "Kiểm duyệt"
};

const frequencyOptions = [
  { value: 'realtime', label: 'Ngay lập tức', description: 'Nhận thông báo ngay khi có' },
  { value: 'hourly', label: 'Mỗi giờ', description: 'Gộp thông báo theo giờ' },
  { value: 'daily', label: 'Hàng ngày', description: 'Tổng hợp thông báo hàng ngày' },
  { value: 'weekly', label: 'Hàng tuần', description: 'Báo cáo tổng hợp hàng tuần' }
];

export function NotificationPreferences() {
  const {
    preferences,
    loading,
    error,
    updating,
    toggleChannel,
    toggleCategory,
    toggleNotificationType,
    updateFrequency,
    updateQuietHours,
    updateDigestSettings,
    isChannelEnabled,
    isCategoryEnabled,
    isNotificationTypeEnabled
  } = useNotificationPreferences();

  const [localQuietHours, setLocalQuietHours] = React.useState({
    enabled: false,
    start: "22:00",
    end: "08:00"
  });

  // Sync local quiet hours with preferences
  React.useEffect(() => {
    if (preferences?.quietHours) {
      setLocalQuietHours({
        enabled: preferences.quietHours.enabled,
        start: preferences.quietHours.start,
        end: preferences.quietHours.end
      });
    }
  }, [preferences]);

  const handleChannelToggle = async (channel: keyof typeof channelIcons) => {
    const result = await toggleChannel(channel);
    if (result.success) {
      toastService.success('Thành công', `Đã ${isChannelEnabled(channel) ? 'tắt' : 'bật'} thông báo ${channelLabels[channel].toLowerCase()}`);
    } else {
      toastService.error('Lỗi', result.error || 'Có lỗi xảy ra');
    }
  };

  const handleCategoryToggle = async (category: keyof typeof categoryIcons) => {
    const result = await toggleCategory(category);
    if (result.success) {
      toastService.success('Thành công', `Đã ${isCategoryEnabled(category) ? 'tắt' : 'bật'} thông báo ${categoryLabels[category].toLowerCase()}`);
    } else {
      toastService.error('Lỗi', result.error || 'Có lỗi xảy ra');
    }
  };

  const handleFrequencyChange = async (frequency: string) => {
    const result = await updateFrequency(frequency as any);
    if (result.success) {
      toastService.success('Thành công', 'Đã cập nhật tần suất thông báo');
    } else {
      toastService.error('Lỗi', result.error || 'Có lỗi xảy ra');
    }
  };

  const handleQuietHoursUpdate = async () => {
    const result = await updateQuietHours(localQuietHours);
    if (result.success) {
      toastService.success('Thành công', 'Đã cập nhật giờ im lặng');
    } else {
      toastService.error('Lỗi', result.error || 'Có lỗi xảy ra');
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin mr-2" />
          <span>Đang tải cài đặt thông báo...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <AlertCircle className="h-8 w-8 text-red-500 mr-2" />
          <span className="text-red-600">{error}</span>
        </CardContent>
      </Card>
    );
  }

  if (!preferences) {
    return null;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Cài đặt Thông báo
          </CardTitle>
          <CardDescription>
            Quản lý cách bạn nhận thông báo từ Du Lịch Việt
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="channels" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="channels">Kênh thông báo</TabsTrigger>
          <TabsTrigger value="categories">Danh mục</TabsTrigger>
          <TabsTrigger value="timing">Thời gian</TabsTrigger>
          <TabsTrigger value="advanced">Nâng cao</TabsTrigger>
        </TabsList>

        <TabsContent value="channels">
          <Card>
            <CardHeader>
              <CardTitle>Kênh nhận thông báo</CardTitle>
              <CardDescription>
                Chọn cách bạn muốn nhận thông báo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(channelIcons).map(([channel, Icon]) => (
                <div key={channel} className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5 text-gray-600" />
                    <div>
                      <Label className="text-sm font-medium">
                        {channelLabels[channel as keyof typeof channelLabels]}
                      </Label>
                      <p className="text-xs text-gray-500">
                        {channel === 'inApp' && 'Thông báo hiển thị trong ứng dụng'}
                        {channel === 'push' && 'Thông báo đẩy đến thiết bị'}
                        {channel === 'email' && 'Gửi thông báo qua email'}
                        {channel === 'sms' && 'Gửi tin nhắn SMS (sắp có)'}
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={isChannelEnabled(channel as keyof typeof channelIcons)}
                    onCheckedChange={() => handleChannelToggle(channel as keyof typeof channelIcons)}
                    disabled={updating || channel === 'sms'}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories">
          <Card>
            <CardHeader>
              <CardTitle>Danh mục thông báo</CardTitle>
              <CardDescription>
                Chọn loại thông báo bạn muốn nhận
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {Object.entries(categoryIcons).map(([category, Icon]) => {
                const categoryData = preferences.categories[category as keyof typeof preferences.categories];
                if (!categoryData) return null;

                return (
                  <div key={category} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Icon className="h-5 w-5 text-gray-600" />
                        <div>
                          <Label className="text-sm font-medium">
                            {categoryLabels[category as keyof typeof categoryLabels]}
                          </Label>
                          <p className="text-xs text-gray-500">
                            {category === 'places' && 'Thông báo về địa điểm của bạn'}
                            {category === 'interactions' && 'Thông báo về tương tác với nội dung'}
                            {category === 'system' && 'Thông báo hệ thống và cập nhật'}
                            {category === 'moderation' && 'Thông báo kiểm duyệt (dành cho moderator)'}
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={isCategoryEnabled(category as keyof typeof categoryIcons)}
                        onCheckedChange={() => handleCategoryToggle(category as keyof typeof categoryIcons)}
                        disabled={updating}
                      />
                    </div>

                    {isCategoryEnabled(category as keyof typeof categoryIcons) && categoryData.types && (
                      <div className="ml-8 space-y-2 border-l pl-4">
                        {Object.entries(categoryData.types).map(([type, enabled]) => (
                          <div key={type} className="flex items-center justify-between py-1">
                            <Label className="text-sm">
                              {type === 'approved' && 'Địa điểm được duyệt'}
                              {type === 'rejected' && 'Địa điểm bị từ chối'}
                              {type === 'published' && 'Địa điểm được xuất bản'}
                              {type === 'featured' && 'Địa điểm được nổi bật'}
                              {type === 'milestone' && 'Cột mốc lượt xem/thích'}
                              {type === 'liked' && 'Có người thích'}
                              {type === 'saved' && 'Có người lưu'}
                              {type === 'reviewed' && 'Có đánh giá mới'}
                              {type === 'commented' && 'Có phản hồi bình luận'}
                              {type === 'maintenance' && 'Bảo trì hệ thống'}
                              {type === 'security' && 'Cảnh báo bảo mật'}
                              {type === 'features' && 'Tính năng mới'}
                              {type === 'weekly' && 'Tổng kết hàng tuần'}
                              {type === 'newItems' && 'Mục kiểm duyệt mới'}
                              {type === 'escalated' && 'Mục được chuyển lên'}
                              {type === 'slaWarning' && 'Cảnh báo SLA'}
                              {type === 'queueOverload' && 'Hàng đợi quá tải'}
                            </Label>
                            <Switch
                              checked={enabled as boolean}
                              onCheckedChange={() => toggleNotificationType(
                                category as keyof typeof categoryIcons, 
                                type
                              )}
                              disabled={updating}
                              size="sm"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timing">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Tần suất thông báo</CardTitle>
                <CardDescription>
                  Chọn tần suất nhận thông báo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Select
                  value={preferences.frequency}
                  onValueChange={handleFrequencyChange}
                  disabled={updating}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {frequencyOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        <div>
                          <div className="font-medium">{option.label}</div>
                          <div className="text-xs text-gray-500">{option.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Giờ im lặng</CardTitle>
                <CardDescription>
                  Tạm dừng thông báo trong khung giờ nhất định
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Bật giờ im lặng</Label>
                  <Switch
                    checked={localQuietHours.enabled}
                    onCheckedChange={(enabled) => 
                      setLocalQuietHours(prev => ({ ...prev, enabled }))
                    }
                    disabled={updating}
                  />
                </div>

                {localQuietHours.enabled && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs">Bắt đầu</Label>
                        <Input
                          type="time"
                          value={localQuietHours.start}
                          onChange={(e) => 
                            setLocalQuietHours(prev => ({ ...prev, start: e.target.value }))
                          }
                          disabled={updating}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Kết thúc</Label>
                        <Input
                          type="time"
                          value={localQuietHours.end}
                          onChange={(e) => 
                            setLocalQuietHours(prev => ({ ...prev, end: e.target.value }))
                          }
                          disabled={updating}
                        />
                      </div>
                    </div>
                    <Button
                      onClick={handleQuietHoursUpdate}
                      disabled={updating}
                      size="sm"
                      variant="outline"
                    >
                      {updating ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <CheckCircle className="h-4 w-4 mr-2" />
                      )}
                      Cập nhật
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="advanced">
          <Card>
            <CardHeader>
              <CardTitle>Cài đặt nâng cao</CardTitle>
              <CardDescription>
                Tùy chỉnh nâng cao cho trải nghiệm thông báo tối ưu
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2">
                  <div>
                    <Label className="text-sm font-medium">Gộp thông báo tương tự</Label>
                    <p className="text-xs text-gray-500">
                      Gộp nhiều thông báo cùng loại thành một thông báo duy nhất
                    </p>
                  </div>
                  <Switch
                    checked={preferences.advanced?.batchSimilar ?? true}
                    disabled={updating}
                  />
                </div>

                <div className="flex items-center justify-between py-2">
                  <div>
                    <Label className="text-sm font-medium">Thông báo thông minh</Label>
                    <p className="text-xs text-gray-500">
                      Sử dụng AI để chọn thời điểm gửi thông báo tối ưu
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">Sắp có</Badge>
                    <Switch
                      checked={preferences.advanced?.smartTiming ?? false}
                      disabled={true}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between py-2">
                  <div>
                    <Label className="text-sm font-medium">Giới hạn tần suất</Label>
                    <p className="text-xs text-gray-500">
                      Tự động giới hạn số lượng thông báo theo tần suất đã chọn
                    </p>
                  </div>
                  <Switch
                    checked={preferences.advanced?.limitFrequency ?? true}
                    disabled={updating}
                  />
                </div>

                <div className="flex items-center justify-between py-2">
                  <div>
                    <Label className="text-sm font-medium">Ưu tiên trong giờ bận</Label>
                    <p className="text-xs text-gray-500">
                      Chỉ hiển thị thông báo ưu tiên cao khi bạn đang bận
                    </p>
                  </div>
                  <Switch
                    checked={preferences.advanced?.priorityFiltering ?? false}
                    disabled={updating}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <Label className="text-sm font-medium">Tổng kết định kỳ</Label>
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Bật tổng kết</Label>
                  <Switch
                    checked={preferences.digest?.enabled ?? false}
                    onCheckedChange={(enabled) => 
                      updateDigestSettings({ enabled })
                    }
                    disabled={updating}
                  />
                </div>
                
                {preferences.digest?.enabled && (
                  <Select
                    value={preferences.digest.frequency}
                    onValueChange={(frequency) => 
                      updateDigestSettings({ frequency: frequency as 'daily' | 'weekly' })
                    }
                    disabled={updating}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Hàng ngày</SelectItem>
                      <SelectItem value="weekly">Hàng tuần</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}