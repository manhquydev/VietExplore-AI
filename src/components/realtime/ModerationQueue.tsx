// src/components/realtime/ModerationQueue.tsx
'use client';

import { useState, useEffect } from 'react';
import { useModerationQueue, useQueueSummary } from '@/hooks/usePresence';
import { collection, getDocs, query, where, documentId } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Clock, AlertTriangle, Users } from 'lucide-react';

interface ModerationRequest {
  id: string;
  submitter: string;
  submitterRole: string;
  status: string;
  priority: 'low' | 'normal' | 'high';
  dueAt: any;
  createdAt: any;
  ref: {
    collection: string;
    id: string;
  };
}

export default function ModerationQueue() {
  const { requestIds: highPriorityIds, loading: loadingHigh } = useModerationQueue('high');
  const { requestIds: normalPriorityIds, loading: loadingNormal } = useModerationQueue('normal');
  const { summary, loading: loadingSummary } = useQueueSummary();
  
  const [highPriorityRequests, setHighPriorityRequests] = useState<ModerationRequest[]>([]);
  const [normalPriorityRequests, setNormalPriorityRequests] = useState<ModerationRequest[]>([]);

  // Fetch detailed request data từ Firestore khi có IDs từ RTDB
  useEffect(() => {
    async function fetchRequests(ids: string[], setter: (requests: ModerationRequest[]) => void) {
      if (ids.length === 0) {
        setter([]);
        return;
      }

      try {
        // Firestore 'in' query có limit 10 items
        const chunks = [];
        for (let i = 0; i < ids.length; i += 10) {
          chunks.push(ids.slice(i, i + 10));
        }

        const allRequests: ModerationRequest[] = [];
        
        for (const chunk of chunks) {
          const q = query(
            collection(db, 'moderation/requests/items'),
            where(documentId(), 'in', chunk)
          );
          
          const snapshot = await getDocs(q);
          const requests = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          } as ModerationRequest));
          
          allRequests.push(...requests);
        }

        // Sort by dueAt (soonest first)
        allRequests.sort((a, b) => a.dueAt.toMillis() - b.dueAt.toMillis());
        setter(allRequests);
      } catch (error) {
        console.error('Error fetching requests:', error);
        setter([]);
      }
    }

    if (!loadingHigh && highPriorityIds.length > 0) {
      fetchRequests(highPriorityIds, setHighPriorityRequests);
    } else if (!loadingHigh) {
      setHighPriorityRequests([]);
    }

    if (!loadingNormal && normalPriorityIds.length > 0) {
      fetchRequests(normalPriorityIds, setNormalPriorityRequests);
    } else if (!loadingNormal) {
      setNormalPriorityRequests([]);
    }
  }, [highPriorityIds, normalPriorityIds, loadingHigh, loadingNormal]);

  const formatTimeRemaining = (dueAt: any) => {
    const now = Date.now();
    const due = dueAt.toMillis();
    const diff = due - now;
    
    if (diff < 0) return 'Overdue';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
    }
    
    return `${hours}h ${minutes}m`;
  };

  const getPriorityColor = (priority: string, isOverdue: boolean) => {
    if (isOverdue) return 'text-red-600 bg-red-50';
    switch (priority) {
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'normal': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (loadingSummary) {
    return (
      <div className="p-6 bg-white rounded-lg shadow animate-pulse">
        <div className="h-6 bg-gray-200 rounded mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Queue Summary */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Users className="w-5 h-5 mr-2" />
          Moderation Queue Summary
        </h2>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{summary.totalQueued}</div>
            <div className="text-sm text-blue-600">Total Queued</div>
          </div>
          
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">{summary.highPriority}</div>
            <div className="text-sm text-orange-600">High Priority</div>
          </div>
          
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{summary.overdue}</div>
            <div className="text-sm text-red-600">Overdue</div>
          </div>
        </div>
      </div>

      {/* High Priority Queue */}
      {highPriorityRequests.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b bg-orange-50">
            <h3 className="text-lg font-semibold text-orange-800 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2" />
              High Priority ({highPriorityRequests.length})
            </h3>
          </div>
          
          <div className="divide-y">
            {highPriorityRequests.map((request) => {
              const isOverdue = request.dueAt.toMillis() < Date.now();
              
              return (
                <div key={request.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(request.priority, isOverdue)}`}>
                          {request.priority.toUpperCase()}
                        </span>
                        <span className="text-sm text-gray-600">
                          {request.submitterRole}
                        </span>
                      </div>
                      
                      <div className="mt-1">
                        <span className="text-sm font-medium">Request #{request.id.slice(-6)}</span>
                        <span className="text-sm text-gray-500 ml-2">
                          {request.ref.collection}/{request.ref.id}
                        </span>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className={`text-sm font-medium ${isOverdue ? 'text-red-600' : 'text-gray-900'}`}>
                        <Clock className="w-4 h-4 inline mr-1" />
                        {formatTimeRemaining(request.dueAt)}
                      </div>
                      <div className="text-xs text-gray-500">
                        Created {new Date(request.createdAt.toMillis()).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Normal Priority Queue */}
      {normalPriorityRequests.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b bg-blue-50">
            <h3 className="text-lg font-semibold text-blue-800 flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              Normal Priority ({normalPriorityRequests.length})
            </h3>
          </div>
          
          <div className="divide-y max-h-96 overflow-y-auto">
            {normalPriorityRequests.slice(0, 10).map((request) => {
              const isOverdue = request.dueAt.toMillis() < Date.now();
              
              return (
                <div key={request.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(request.priority, isOverdue)}`}>
                          {request.priority.toUpperCase()}
                        </span>
                        <span className="text-sm text-gray-600">
                          {request.submitterRole}
                        </span>
                      </div>
                      
                      <div className="mt-1">
                        <span className="text-sm font-medium">Request #{request.id.slice(-6)}</span>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className={`text-sm ${isOverdue ? 'text-red-600' : 'text-gray-600'}`}>
                        {formatTimeRemaining(request.dueAt)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {normalPriorityRequests.length > 10 && (
              <div className="p-4 text-center text-gray-500">
                ... and {normalPriorityRequests.length - 10} more
              </div>
            )}
          </div>
        </div>
      )}

      {/* Empty State */}
      {highPriorityRequests.length === 0 && normalPriorityRequests.length === 0 && !loadingHigh && !loadingNormal && (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No pending requests</h3>
          <p className="text-gray-500">All moderation requests have been processed.</p>
        </div>
      )}
    </div>
  );
}
