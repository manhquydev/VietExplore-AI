'use client';

import { useState } from 'react';
import { Icon } from '@/components/ui/icon';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface FormData {
  interests: string;
  budget: string;
  duration: number;
}

export default function AiPlanner() {
  const [formData, setFormData] = useState<FormData>({
    interests: '',
    budget: 'medium',
    duration: 7,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Simulate AI processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setResult(`Lịch trình ${formData.duration} ngày được tạo!

Dự kiến chi phí: ${totalBudget.toLocaleString()}đ/người

• Ngày 1-2: Khám phá Hà Nội
  - Hồ Hoàn Kiếm, Phố cổ
  - Văn Miếu, Chùa Một Cột
  - Thưởng thức phở, bún chả

• Ngày 3-4: Vịnh Hạ Long
  - Tour thuyền qua đêm
  - Hang Sửng Sốt, đảo Ti Tốp
  - Kayak khám phá hang động

• Ngày 5-${formData.duration}: Sapa`);
    } catch (error) {
      console.error('AI planning error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section id="ai-planner" aria-labelledby="ai-planner-title">
      <Card className="max-w-4xl mx-auto shadow-card">
        <CardHeader>
          <div className="text-center">
            <CardTitle id="ai-planner-title" className="text-2xl md:text-3xl mb-2">
              <span className="text-primary font-bold">AI</span> Lập kế hoạch Chuyến đi
            </CardTitle>
            <CardDescription>
              Điền vào các tùy chọn bên dưới để tạo lịch trình du lịch được cá nhân hóa của bạn.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <Label htmlFor="interests">Sở thích</Label>
                <Input
                  id="interests"
                  placeholder="ví dụ: lịch sử, ẩm thực, thiên nhiên"
                  value={formData.interests}
                  onChange={(e) => setFormData(prev => ({ ...prev, interests: e.target.value }))}
                />
              </div>
              
              <div>
                <Label htmlFor="budget">Ngân sách</Label>
                <Select
                  value={formData.budget}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, budget: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn ngân sách" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Thấp (1-3 triệu)</SelectItem>
                    <SelectItem value="medium">Trung bình (3-6 triệu)</SelectItem>
                    <SelectItem value="high">Cao (6+ triệu)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="duration">Thời gian (ngày)</Label>
                <Input
                  id="duration"
                  type="number"
                  placeholder="ví dụ: 7"
                  min="1"
                  max="30"
                  value={formData.duration}
                  onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) || 1 }))}
                />
              </div>
            </div>
            
            <Button type="submit" disabled={isLoading} className="w-full md:w-auto" loading={isLoading}>
              {isLoading ? 'Đang tạo...' : 'Tạo Lịch trình'}
            </Button>
          </form>

          {result && (
            <div className="mt-8 pt-6 border-t border-border">
              <h3 className="text-xl font-bold mb-4">
                Lịch trình được đề xuất của bạn
              </h3>
              <Card className="bg-surface">
                <CardContent className="p-6">
                  <pre className="whitespace-pre-wrap text-sm leading-relaxed">
                    {result}
                  </pre>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
