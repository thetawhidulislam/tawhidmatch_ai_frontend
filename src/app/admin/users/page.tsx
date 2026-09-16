"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Search } from "lucide-react";
import { toast } from "sonner";

import { ErrorState } from "@/components/shared/error-state";
import { LoadingGrid } from "@/components/shared/loading-grid";
import { PageHeader } from "@/components/shared/page-header";
import { PaginationControls } from "@/components/shared/pagination-controls";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { listUsers, updateUserRole } from "@/lib/admin";
import { getErrorMessage } from "@/lib/get-error-message";
import type { Role } from "@/types";

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"ALL" | Role>("ALL");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 400);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const usersQuery = useQuery({
    queryKey: ["admin-users", page, search, roleFilter],
    queryFn: () => listUsers({ page, limit: 10, search: search || undefined, role: roleFilter === "ALL" ? undefined : roleFilter }),
  });
  const roleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: Role }) => updateUserRole(id, role),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("User role updated");
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
    onSettled: () => setUpdatingId(null),
  });

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        <PageHeader title="Manage Users" />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Search users..." className="pl-9" />
          </div>
          <Select value={roleFilter} onValueChange={(value) => { setRoleFilter(value as "ALL" | Role); setPage(1); }}>
            <SelectTrigger className="w-full sm:w-36"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="ALL">All roles</SelectItem><SelectItem value="USER">User</SelectItem><SelectItem value="ADMIN">Admin</SelectItem></SelectContent>
          </Select>
        </div>
        {usersQuery.isLoading ? (
          <LoadingGrid count={3} />
        ) : usersQuery.isError ? (
          <ErrorState message={getErrorMessage(usersQuery.error)} onRetry={() => usersQuery.refetch()} />
        ) : usersQuery.data ? (
          <>
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Role</TableHead><TableHead>Joined</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {usersQuery.data.users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Select value={user.role} onValueChange={(value) => { setUpdatingId(user.id); roleMutation.mutate({ id: user.id, role: value as Role }); }} disabled={updatingId === user.id}>
                              <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
                              <SelectContent><SelectItem value="USER">User</SelectItem><SelectItem value="ADMIN">Admin</SelectItem></SelectContent>
                            </Select>
                            {updatingId === user.id && <Loader2 className="size-4 animate-spin text-muted-foreground" aria-label="Updating" />}
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{formatDate(user.createdAt)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {usersQuery.data.users.length === 0 && <p className="p-8 text-center text-sm text-muted-foreground">No users found.</p>}
              </CardContent>
            </Card>
            <PaginationControls {...usersQuery.data.pagination} onPageChange={setPage} />
          </>
        ) : null}
      </div>
    </main>
  );
}