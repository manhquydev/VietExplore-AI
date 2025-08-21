// src/components/admin/UserManagement.tsx - Admin User Management Dashboard
'use client';

import { useState, useEffect } from 'react';
import { User, Shield, Eye, UserX, UserCheck, ChevronDown, Search, Filter } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { hasPermission, getUserRole, UserRole, getRoleDisplayName } from '@/lib/rbac';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase';

interface UserData {
  id: string;
  email: string;
  displayName?: string;
  role: UserRole;
  status: 'active' | 'suspended';
  createdAt: any;
  lastLoginAt?: any;
  verifiedContributor?: boolean;
  partnerId?: string;
}

const getAllUsers = httpsCallable(functions, 'getAllUsers');
const assignUserRole = httpsCallable(functions, 'assignUserRole');
const toggleUserStatus = httpsCallable(functions, 'toggleUserStatus');
const promoteUser = httpsCallable(functions, 'promoteUser');

export default function UserManagement() {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended'>('all');

  const userRole = getUserRole(user);
  const canManageUsers = hasPermission(userRole, 'admin.manage_roles');

  useEffect(() => {
    if (canManageUsers) {
      loadUsers();
    }
  }, [canManageUsers, roleFilter, statusFilter]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const result = await getAllUsers({
        limit: 50,
        role: roleFilter === 'all' ? undefined : roleFilter,
        status: statusFilter === 'all' ? undefined : statusFilter
      });
      
      if (result.data.success) {
        setUsers(result.data.users);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignRole = async (targetUserId: string, newRole: UserRole, reason: string) => {
    try {
      const result = await assignUserRole({
        targetUserId,
        newRole,
        reason
      });
      
      if (result.data.success) {
        await loadUsers(); // Reload users
        setShowRoleModal(false);
        setSelectedUser(null);
      }
    } catch (error) {
      console.error('Error assigning role:', error);
      alert('Lỗi khi gán quyền: ' + (error as any).message);
    }
  };

  const handleToggleStatus = async (targetUserId: string, action: 'suspend' | 'activate', reason: string) => {
    try {
      const result = await toggleUserStatus({
        targetUserId,
        action,
        reason
      });
      
      if (result.data.success) {
        await loadUsers(); // Reload users
        setShowStatusModal(false);
        setSelectedUser(null);
      }
    } catch (error) {
      console.error('Error toggling status:', error);
      alert('Lỗi khi thay đổi trạng thái: ' + (error as any).message);
    }
  };

  const handlePromoteUser = async (targetUserId: string, reason: string) => {
    try {
      const result = await promoteUser({
        targetUserId,
        reason
      });
      
      if (result.data.success) {
        await loadUsers(); // Reload users
      }
    } catch (error) {
      console.error('Error promoting user:', error);
      alert('Lỗi khi thăng cấp: ' + (error as any).message);
    }
  };

  const filteredUsers = users.filter(userData => {
    const matchesSearch = !searchTerm || 
      userData.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      userData.displayName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const getRoleColor = (role: UserRole) => {
    const colors: Record<UserRole, string> = {
      guest: 'bg-gray-100 text-gray-800',
      traveler: 'bg-blue-100 text-blue-800',
      contributor: 'bg-green-100 text-green-800',
      partner: 'bg-purple-100 text-purple-800',
      moderator: 'bg-orange-100 text-orange-800',
      admin: 'bg-red-100 text-red-800'
    };
    return colors[role] || colors.guest;
  };

  const getStatusColor = (status: string) => {
    return status === 'active' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  };

  if (!canManageUsers) {
    return (
      <div className="p-8 text-center">
        <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Không có quyền truy cập</h2>
        <p className="text-gray-600">Chỉ Admin mới có quyền quản lý người dùng.</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Người dùng</h1>
          <p className="text-gray-600">Quản lý vai trò và quyền hạn người dùng</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-500">
            Tổng: {filteredUsers.length} người dùng
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-wrap gap-4">
          {/* Search */}
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm theo email hoặc tên..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Role Filter */}
          <div className="relative">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as UserRole | 'all')}
              className="appearance-none bg-white border rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tất cả vai trò</option>
              <option value="traveler">Du khách</option>
              <option value="contributor">Cộng tác viên</option>
              <option value="partner">Đối tác</option>
              <option value="moderator">Kiểm duyệt viên</option>
              <option value="admin">Quản trị viên</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'suspended')}
              className="appearance-none bg-white border rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Hoạt động</option>
              <option value="suspended">Bị khóa</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>

          <button
            onClick={loadUsers}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <Filter className="w-4 h-4" />
            <span>Làm mới</span>
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-2 text-gray-600">Đang tải...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Người dùng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vai trò
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày tạo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((userData) => (
                  <tr key={userData.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <User className="w-5 h-5 text-gray-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {userData.displayName || 'Chưa có tên'}
                          </div>
                          <div className="text-sm text-gray-500">{userData.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(userData.role)}`}>
                        {getRoleDisplayName(userData.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(userData.status)}`}>
                        {userData.status === 'active' ? 'Hoạt động' : 'Bị khóa'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {userData.createdAt?.toDate?.()?.toLocaleDateString('vi-VN') || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => {
                          setSelectedUser(userData);
                          setShowRoleModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Đổi vai trò
                      </button>
                      <button
                        onClick={() => {
                          setSelectedUser(userData);
                          setShowStatusModal(true);
                        }}
                        className={userData.status === 'active' 
                          ? "text-red-600 hover:text-red-900" 
                          : "text-green-600 hover:text-green-900"
                        }
                      >
                        {userData.status === 'active' ? 'Khóa' : 'Kích hoạt'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Role Assignment Modal */}
      {showRoleModal && selectedUser && (
        <RoleAssignmentModal
          user={selectedUser}
          onAssign={handleAssignRole}
          onClose={() => {
            setShowRoleModal(false);
            setSelectedUser(null);
          }}
        />
      )}

      {/* Status Toggle Modal */}
      {showStatusModal && selectedUser && (
        <StatusToggleModal
          user={selectedUser}
          onToggle={handleToggleStatus}
          onClose={() => {
            setShowStatusModal(false);
            setSelectedUser(null);
          }}
        />
      )}
    </div>
  );
}

// Role Assignment Modal Component
function RoleAssignmentModal({ 
  user, 
  onAssign, 
  onClose 
}: { 
  user: UserData;
  onAssign: (userId: string, role: UserRole, reason: string) => void;
  onClose: () => void;
}) {
  const [selectedRole, setSelectedRole] = useState<UserRole>(user.role);
  const [reason, setReason] = useState('');

  const roles: { value: UserRole; label: string; description: string }[] = [
    { value: 'traveler', label: 'Du khách', description: 'Người dùng cơ bản' },
    { value: 'contributor', label: 'Cộng tác viên', description: 'Có thể tạo nội dung' },
    { value: 'partner', label: 'Đối tác', description: 'Đối tác cộng đồng' },
    { value: 'moderator', label: 'Kiểm duyệt viên', description: 'Kiểm duyệt nội dung' },
    { value: 'admin', label: 'Quản trị viên', description: 'Quản lý hệ thống' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">Gán vai trò cho {user.email}</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vai trò hiện tại: {getRoleDisplayName(user.role)}
            </label>
            <div className="space-y-2">
              {roles.map((role) => (
                <label key={role.value} className="flex items-center space-x-3">
                  <input
                    type="radio"
                    value={role.value}
                    checked={selectedRole === role.value}
                    onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                    className="h-4 w-4 text-blue-600"
                  />
                  <div>
                    <div className="font-medium">{role.label}</div>
                    <div className="text-sm text-gray-500">{role.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lý do thay đổi
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Nhập lý do thay đổi vai trò..."
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Hủy
          </button>
          <button
            onClick={() => onAssign(user.id, selectedRole, reason)}
            disabled={!reason.trim() || selectedRole === user.role}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Gán vai trò
          </button>
        </div>
      </div>
    </div>
  );
}

// Status Toggle Modal Component
function StatusToggleModal({ 
  user, 
  onToggle, 
  onClose 
}: { 
  user: UserData;
  onToggle: (userId: string, action: 'suspend' | 'activate', reason: string) => void;
  onClose: () => void;
}) {
  const [reason, setReason] = useState('');
  const action = user.status === 'active' ? 'suspend' : 'activate';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">
          {action === 'suspend' ? 'Khóa' : 'Kích hoạt'} tài khoản {user.email}
        </h3>
        
        <div className="space-y-4">
          <p className="text-gray-600">
            {action === 'suspend' 
              ? 'Tài khoản sẽ bị khóa và không thể đăng nhập.'
              : 'Tài khoản sẽ được kích hoạt và có thể đăng nhập trở lại.'
            }
          </p>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lý do {action === 'suspend' ? 'khóa' : 'kích hoạt'}
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={`Nhập lý do ${action === 'suspend' ? 'khóa' : 'kích hoạt'} tài khoản...`}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Hủy
          </button>
          <button
            onClick={() => onToggle(user.id, action, reason)}
            disabled={!reason.trim()}
            className={`px-4 py-2 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed ${
              action === 'suspend' 
                ? 'bg-red-600 hover:bg-red-700' 
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {action === 'suspend' ? 'Khóa tài khoản' : 'Kích hoạt tài khoản'}
          </button>
        </div>
      </div>
    </div>
  );
}
