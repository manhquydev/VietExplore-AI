// src/components/admin/AdminSetup.tsx - Initial Admin Setup Component
'use client';

import { useState, useEffect } from 'react';
import { Shield, CheckCircle, AlertCircle, Key, Users } from 'lucide-react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase';
import { useAuth } from '@/lib/auth';

const checkSetupStatus = httpsCallable(functions, 'checkSetupStatus');
const createFirstAdmin = httpsCallable(functions, 'createFirstAdmin');

interface SetupStatus {
  needsSetup: boolean;
  hasAdmin: boolean;
  totalUsers: number;
  roleStats: Record<string, number>;
  setupComplete: boolean;
}

export default function AdminSetup() {
  const { user } = useAuth();
  const [setupStatus, setSetupStatus] = useState<SetupStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [setupLoading, setSetupLoading] = useState(false);
  const [setupKey, setSetupKey] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadSetupStatus();
  }, []);

  const loadSetupStatus = async () => {
    try {
      setLoading(true);
      const result = await checkSetupStatus();
      
      if (result.data.success) {
        setSetupStatus(result.data as SetupStatus);
        
        // Pre-fill email if user is logged in
        if (user?.email) {
          setEmail(user.email);
        }
      }
    } catch (error) {
      console.error('Error checking setup status:', error);
      setError('Lỗi khi kiểm tra trạng thái hệ thống');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFirstAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !setupKey) {
      setError('Vui lòng nhập đầy đủ thông tin');
      return;
    }
    
    try {
      setSetupLoading(true);
      setError('');
      setMessage('');
      
      const result = await createFirstAdmin({
        email,
        setupKey
      });
      
      if (result.data.success) {
        setMessage(result.data.message);
        await loadSetupStatus(); // Reload status
      }
    } catch (error: any) {
      console.error('Error creating first admin:', error);
      setError(error.message || 'Lỗi khi tạo admin');
    } finally {
      setSetupLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Đang kiểm tra trạng thái hệ thống...</p>
        </div>
      </div>
    );
  }

  if (!setupStatus) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Lỗi hệ thống</h2>
          <p className="text-gray-600 mb-4">Không thể kiểm tra trạng thái hệ thống</p>
          <button
            onClick={loadSetupStatus}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  // System already setup
  if (setupStatus.setupComplete && setupStatus.hasAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Hệ thống đã sẵn sàng</h2>
          <p className="text-gray-600 mb-6">VietExplore AI đã được thiết lập hoàn chỉnh</p>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Thống kê hệ thống</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-gray-500">Tổng người dùng</div>
                <div className="font-semibold">{setupStatus.totalUsers}</div>
              </div>
              <div>
                <div className="text-gray-500">Admin</div>
                <div className="font-semibold">{setupStatus.roleStats.admin || 0}</div>
              </div>
              <div>
                <div className="text-gray-500">Moderator</div>
                <div className="font-semibold">{setupStatus.roleStats.moderator || 0}</div>
              </div>
              <div>
                <div className="text-gray-500">Contributor</div>
                <div className="font-semibold">{setupStatus.roleStats.contributor || 0}</div>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <a
              href="/admin/dashboard"
              className="block w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Vào Admin Dashboard
            </a>
            <a
              href="/"
              className="block w-full px-4 py-2 text-blue-600 hover:text-blue-800 transition-colors"
            >
              Về trang chủ
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Needs initial setup
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Shield className="w-16 h-16 text-blue-600 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-900">Thiết lập VietExplore AI</h2>
          <p className="mt-2 text-gray-600">
            Tạo tài khoản Admin đầu tiên để bắt đầu sử dụng hệ thống
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Current Status */}
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
              <span className="text-sm font-medium text-yellow-800">
                Hệ thống chưa có Admin
              </span>
            </div>
            <p className="mt-1 text-sm text-yellow-700">
              Cần tạo tài khoản Admin đầu tiên để quản lý hệ thống
            </p>
          </div>

          {/* Setup Form */}
          <form onSubmit={handleCreateFirstAdmin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Users className="w-4 h-4 inline mr-1" />
                Email Admin
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                Email này phải đã đăng ký tài khoản trong hệ thống
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Key className="w-4 h-4 inline mr-1" />
                Setup Key
              </label>
              <input
                type="password"
                value={setupKey}
                onChange={(e) => setSetupKey(e.target.value)}
                placeholder="Nhập setup key..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                Setup key được cung cấp bởi nhà phát triển
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {message && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-600">{message}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={setupLoading || !email || !setupKey}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {setupLoading ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  Đang tạo Admin...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4 mr-2" />
                  Tạo Admin đầu tiên
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Lưu ý bảo mật:</h3>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• Setup key chỉ sử dụng một lần để tạo admin đầu tiên</li>
              <li>• Email phải đã đăng ký và xác minh trong hệ thống</li>
              <li>• Admin có toàn quyền quản lý hệ thống</li>
              <li>• Sau khi tạo, có thể tạo thêm admin khác từ dashboard</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
