/**
 * Users List Component
 * Displays table of users with management actions
 */

'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/app/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/app/components/ui/table';
import { Badge } from '@/app/components/ui/badge';
import { PageLoading } from '@/app/components/ui/loading';
import { Alert } from '@/app/components/ui/alert';
import { Button } from '@/app/components/ui/button';
import { getUsers, type User } from '@/lib/api/users.service';
import { formatDate } from '@/lib/utils/format';
import { Edit, Trash2 } from 'lucide-react';

export function UsersList() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getUsers();
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <PageLoading />;
  }

  if (error) {
    return (
      <Alert variant="error">
        {error}
        <Button onClick={loadUsers} variant="outline" className="ml-4">
          Retry
        </Button>
      </Alert>
    );
  }

  if (users.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-gray-600">No users found.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name || 'N/A'}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.phone || '-'}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    {user.isSuperAdmin && (
                      <Badge variant="destructive">Super Admin</Badge>
                    )}
                    {user.isAdmin && !user.isSuperAdmin && (
                      <Badge variant="default">Admin</Badge>
                    )}
                    {!user.isAdmin && <Badge variant="secondary">User</Badge>}
                  </div>
                </TableCell>
                <TableCell>{formatDate(user.createdAt)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

