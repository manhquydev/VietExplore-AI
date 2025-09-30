"use client"

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Activity, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Database,
  Wifi,
  WifiOff,
  RefreshCw
} from 'lucide-react';
import { 
  useAdminRealtime,
  useModerationRealtime, 
  useAnalyticsRealtime,
  useAutoSyncHealth 
} from '@/hooks/use-admin-realtime';
import { useAuth } from '@/components/auth/auth-provider';

export default function AutoSyncDemoPage() {
  const { user } = useAuth();
  const {
    adminStats,
    isConnected,
    lastUpdateTime,
    manualSync,
    serviceStatus
  } = useAdminRealtime();
  
  const {
    pendingItems,
    totalPending,
    isConnected: moderationConnected
  } = useModerationRealtime();
  
  const {
    analytics,
    isConnected: analyticsConnected
  } = useAnalyticsRealtime();
  
  const serviceHealth = useAutoSyncHealth();

  if (!user || !['admin', 'moderator'].includes(user.role)) {
    return (
      <div className="p-6">
        <div className="text-center text-gray-500">
          Chỉ admin và moderator mới có thể truy cập trang này.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Auto-Sync System Demo</h1>
          <p className="text-gray-600">
            Real-time demonstration của hệ thống đồng bộ tự động
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {isConnected ? (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <Wifi className="w-3 h-3 mr-1" />
              Connected
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
              <WifiOff className="w-3 h-3 mr-1" />
              Disconnected
            </Badge>
          )}
        </div>
      </div>

      {/* Service Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Service Status</p>
                <p className="text-lg font-semibold">
                  {serviceHealth.healthy ? 'Healthy' : 'Unhealthy'}
                </p>
              </div>
              {serviceHealth.healthy ? (
                <CheckCircle className="w-8 h-8 text-green-500" />
              ) : (
                <AlertCircle className="w-8 h-8 text-red-500" />
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Connections</p>
                <p className="text-lg font-semibold">{serviceHealth.activeConnections}</p>
              </div>
              <Activity className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Last Update</p>
                <p className="text-lg font-semibold">
                  {lastUpdateTime ? lastUpdateTime.toLocaleTimeString() : 'N/A'}
                </p>
              </div>
              <Clock className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Initialized</p>
                <p className="text-lg font-semibold">
                  {serviceHealth.initialized ? 'Yes' : 'No'}
                </p>
              </div>
              <Database className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Real-time Data Demo */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Admin Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Admin Statistics (Real-time)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Users:</span>
                <span className="font-semibold">{adminStats?.totalUsers || 'Loading...'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Places:</span>
                <span className="font-semibold">{adminStats?.totalPlaces || 'Loading...'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Pending Moderation:</span>
                <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                  {adminStats?.pendingModeration || 0}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">System Health:</span>
                <Badge variant="outline" className="bg-green-50 text-green-700">
                  {adminStats?.systemHealth ? `${adminStats.systemHealth}%` : 'N/A'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Moderation Queue */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Moderation Queue (Real-time)
              <div className={`h-2 w-2 rounded-full ${moderationConnected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Pending Items:</span>
                <Badge variant="outline" className={`${totalPending > 0 ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                  {totalPending}
                </Badge>
              </div>
              
              {pendingItems.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium mb-2">Recent Pending Items:</p>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {pendingItems.slice(0, 3).map((item) => (
                      <div key={item.id} className="flex items-center justify-between text-xs p-2 bg-gray-50 rounded">
                        <span className="truncate">{item.type}</span>
                        <Badge variant="outline" className="text-xs">
                          {item.priority}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Demo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Analytics (Real-time)
            <div className={`h-2 w-2 rounded-full ${analyticsConnected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{analytics?.totalViews || 0}</p>
              <p className="text-sm text-gray-600">Total Views</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{analytics?.totalLikes || 0}</p>
              <p className="text-sm text-gray-600">Total Likes</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{analytics?.totalSaves || 0}</p>
              <p className="text-sm text-gray-600">Total Saves</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">{analytics?.topPlaces?.length || 0}</p>
              <p className="text-sm text-gray-600">Top Places</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Manual Sync Fallback */}
      <Card>
        <CardHeader>
          <CardTitle>Manual Sync (Fallback Only)</CardTitle>
          <p className="text-sm text-gray-600">
            Chỉ sử dụng khi auto-sync gặp vấn đề. Trong điều kiện bình thường, 
            tất cả dữ liệu đã được đồng bộ tự động.
          </p>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={manualSync}
            variant="outline"
            className="w-full"
            disabled={isConnected && serviceHealth.healthy}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Manual Sync (Emergency Only)
          </Button>
        </CardContent>
      </Card>

      {/* Service Debug Info */}
      <Card>
        <CardHeader>
          <CardTitle>Service Debug Information</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-gray-50 p-4 rounded-lg text-xs overflow-auto">
            {JSON.stringify(serviceStatus, null, 2)}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}