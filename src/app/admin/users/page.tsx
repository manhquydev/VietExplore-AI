// src/app/admin/users/page.tsx
import UserManagement from '@/components/admin/UserManagement';

export default function UsersPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <UserManagement />
    </div>
  );
}

export const metadata = {
  title: 'User Management - VietExplore AI Admin',
  description: 'Manage users and roles in VietExplore AI system',
};
