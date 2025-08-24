'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { callApi } from '@/lib/client/api';
import { X } from 'lucide-react';

interface ReportViolationModalProps {
  targetId: string;
  targetType: 'place' | 'itinerary' | 'user' | 'comment';
  targetName: string;
  onClose: () => void;
}

const reportReasons = [
    { value: 'spam', label: 'Spam hoặc quảng cáo' },
    { value: 'hateful', label: 'Nội dung gây thù ghét' },
    { value: 'inaccurate', label: 'Thông tin không chính xác' },
    { value: 'copyright', label: 'Vi phạm bản quyền' },
    { value: 'other', label: 'Lý do khác' },
];

export function ReportViolationModal({ targetId, targetType, targetName, onClose }: ReportViolationModalProps) {
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason) {
      setError('Please select a reason for the report.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await callApi('reports', 'POST', {
        targetId,
        targetType,
        reason,
        description,
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to submit report.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg relative">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-500 hover:text-gray-800">
            <X size={20} />
        </button>

        <h2 className="text-xl font-bold mb-2">Báo cáo vi phạm</h2>
        <p className="text-muted mb-4">Nội dung: {targetName}</p>

        {success ? (
          <div className="text-center py-8">
            <p className="text-lg text-green-600 font-semibold mb-4">Cảm ơn bạn đã báo cáo!</p>
            <p className="text-gray-700">Chúng tôi đã nhận được báo cáo của bạn và sẽ xem xét sớm nhất có thể.</p>
            <Button onClick={onClose} className="mt-6">Đóng</Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
                  Lý do báo cáo
                </label>
                <Select onValueChange={setReason} value={reason} disabled={loading}>
                    <SelectTrigger>
                        <SelectValue placeholder="Chọn lý do..." />
                    </SelectTrigger>
                    <SelectContent>
                        {reportReasons.map(r => (
                            <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Mô tả thêm (tùy chọn)
                </label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Cung cấp thêm thông tin chi tiết về vi phạm..."
                  rows={4}
                  disabled={loading}
                  className="w-full"
                />
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
                Hủy
              </Button>
              <Button type="submit" variant="danger" disabled={loading || !reason}>
                {loading ? 'Đang gửi...' : 'Gửi báo cáo'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
