'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { callApi } from '@/lib/client/api';
import { X } from 'lucide-react';

interface SuggestEditModalProps {
  placeId: string;
  placeName: string;
  onClose: () => void;
}

export function SuggestEditModal({ placeId, placeName, onClose }: SuggestEditModalProps) {
  const [suggestion, setSuggestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!suggestion.trim()) {
      setError('Please provide a suggestion.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await callApi(`places/${placeId}/suggestions`, 'POST', {
        proposed: {
          description: suggestion,
        },
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to submit suggestion.');
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

        <h2 className="text-xl font-bold mb-2">Đề xuất chỉnh sửa cho</h2>
        <p className="text-primary mb-4">{placeName}</p>

        {success ? (
          <div className="text-center py-8">
            <p className="text-lg text-green-600 font-semibold mb-4">Cảm ơn bạn!</p>
            <p className="text-gray-700">Đề xuất của bạn đã được gửi đi để kiểm duyệt.</p>
            <Button onClick={onClose} className="mt-6">Đóng</Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="suggestion" className="block text-sm font-medium text-gray-700 mb-1">
                  Mô tả đề xuất của bạn
                </label>
                <Textarea
                  id="suggestion"
                  value={suggestion}
                  onChange={(e) => setSuggestion(e.target.value)}
                  placeholder="Ví dụ: Thông tin về giá vé đã thay đổi, giờ mở cửa không còn chính xác,..."
                  rows={5}
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
              <Button type="submit" disabled={loading}>
                {loading ? 'Đang gửi...' : 'Gửi đề xuất'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
