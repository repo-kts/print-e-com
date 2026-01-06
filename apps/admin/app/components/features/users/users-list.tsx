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
import {
    getUsers,
    type User,
    type PaginatedResponse,
} from '@/lib/api/users.service';
import { formatDate } from '@/lib/utils/format';
import { Edit, Trash2 } from 'lucide-react';
import { useDebouncedValue } from '@/lib/hooks/use-debounced-value';

export function UsersList() {
    const [users, setUsers] = useState<User[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchInput, setSearchInput] = useState('');
    const debouncedSearch = useDebouncedValue(searchInput, 400);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

    useEffect(() => {
        loadUsers(page, debouncedSearch);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, debouncedSearch]);

    const loadUsers = async (pageParam = 1, searchParam = '') => {
        try {
            setIsLoading(true);
            setError(null);
            const data: PaginatedResponse<User> = await getUsers({
                page: pageParam,
                limit: 20,
                search: searchParam || undefined,
            });
            setUsers(data.items);
            setTotalPages(data.pagination.totalPages);
      setHasLoadedOnce(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load users');
        } finally {
            setIsLoading(false);
        }
    };

  // Full-page loading only on very first load
  if (!hasLoadedOnce && isLoading) {
    return <PageLoading />;
  }

    return (
        <Card>
            <CardContent className="p-0">
        {/* Header: search + pagination always visible */}
        <div className="flex items-center justify-between px-4 py-3 gap-4">
          <input
            className="w-full max-w-sm rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
            placeholder="Search by name, email, or phone..."
            value={searchInput}
            onChange={(e) => {
              setPage(1);
              setSearchInput(e.target.value);
            }}
          />
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>
              Page {page} of {Math.max(totalPages, 1)}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1 || isLoading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages || isLoading}
              onClick={() => setPage((p) => Math.min(totalPages || 1, p + 1))}
            >
              Next
            </Button>
          </div>
        </div>

        {/* Inline error, keeps search visible */}
        {error && (
          <div className="px-4 pb-2">
            <Alert variant="error">
              {error}
              <Button
                onClick={() => loadUsers(page, debouncedSearch)}
                variant="outline"
                size="sm"
                className="ml-4"
              >
                Retry
              </Button>
            </Alert>
          </div>
        )}

        {/* Table / empty state */}
        <div className="relative">
          {isLoading && hasLoadedOnce && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/5 text-xs text-gray-100 transition-opacity">
              Updating results...
            </div>
          )}

          {users.length === 0 && !isLoading && !error ? (
            <div className="px-4 pb-6">
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-gray-600">
                    No users found. Try adjusting your search or filters.
                  </p>
                </CardContent>
              </Card>
            </div>
          ) : (
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
          )}
        </div>
            </CardContent>
        </Card>
    );
}

