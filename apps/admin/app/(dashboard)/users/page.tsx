/**
 * Users Management Page
 * List and manage users
 */

import { UsersList } from '@/app/components/features/users/users-list';

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Users</h1>
        <p className="mt-2 text-sm text-gray-600">
          Manage user accounts and permissions
        </p>
      </div>

      <UsersList />
    </div>
  );
}

