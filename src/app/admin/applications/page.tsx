"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { ErrorState } from "@/components/shared/error-state";
import { LoadingGrid } from "@/components/shared/loading-grid";
import { PageHeader } from "@/components/shared/page-header";
import { PaginationControls } from "@/components/shared/pagination-controls";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { listApplicationsAdmin, updateApplicationStatus } from "@/lib/admin";
import { getErrorMessage } from "@/lib/get-error-message";
import type { ApplicationStatus } from "@/types";

const statuses: Array<{ value: ApplicationStatus; label: string }> = [
  { value: "APPLIED", label: "Applied" },
  { value: "SHORTLISTED", label: "Shortlisted" },
  { value: "INTERVIEW", label: "Interview" },
  { value: "REJECTED", label: "Rejected" },
  { value: "HIRED", label: "Hired" },
];

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function statusLabel(status: ApplicationStatus): string {
  return statuses.find((item) => item.value === status)?.label ?? status;
}

export default function AdminApplicationsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<"ALL" | ApplicationStatus>("ALL");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const applicationsQuery = useQuery({
    queryKey: ["admin-applications", page, statusFilter],
    queryFn: () => listApplicationsAdmin({ page, limit: 10, status: statusFilter === "ALL" ? undefined : statusFilter }),
  });
  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: ApplicationStatus }) => updateApplicationStatus(id, status),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-applications"] });
      toast.success("Application status updated");
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
    onSettled: () => setUpdatingId(null),
  });

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        <PageHeader title="Manage Applications" />
        <div className="flex max-w-xs items-center gap-3">
          <span className="text-sm font-medium">Status</span>
          <Select value={statusFilter} onValueChange={(value) => { setStatusFilter(value as "ALL" | ApplicationStatus); setPage(1); }}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All</SelectItem>
              {statuses.map((status) => <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        {applicationsQuery.isLoading ? (
          <LoadingGrid count={3} />
        ) : applicationsQuery.isError ? (
          <ErrorState message={getErrorMessage(applicationsQuery.error)} onRetry={() => applicationsQuery.refetch()} />
        ) : applicationsQuery.data ? (
          <>
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader><TableRow><TableHead>Applicant</TableHead><TableHead>Job</TableHead><TableHead>Status</TableHead><TableHead>Applied</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {applicationsQuery.data.applications.map((application) => (
                      <TableRow key={application.id}>
                        <TableCell><p className="font-medium">{application.user.name}</p><p className="text-xs text-muted-foreground">{application.user.email}</p></TableCell>
                        <TableCell><p className="font-medium">{application.job.title}</p><p className="text-xs text-muted-foreground">{application.job.company}</p></TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Select value={application.status} onValueChange={(value) => { setUpdatingId(application.id); statusMutation.mutate({ id: application.id, status: value as ApplicationStatus }); }} disabled={updatingId === application.id}>
                              <SelectTrigger className="w-36"><SelectValue>{statusLabel(application.status)}</SelectValue></SelectTrigger>
                              <SelectContent>{statuses.map((status) => <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>)}</SelectContent>
                            </Select>
                            {updatingId === application.id && <Loader2 className="size-4 animate-spin text-muted-foreground" aria-label="Updating" />}
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{formatDate(application.appliedAt)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {applicationsQuery.data.applications.length === 0 && <p className="p-8 text-center text-sm text-muted-foreground">No applications found.</p>}
              </CardContent>
            </Card>
            <PaginationControls {...applicationsQuery.data.pagination} onPageChange={setPage} />
          </>
        ) : null}
      </div>
    </main>
  );
}