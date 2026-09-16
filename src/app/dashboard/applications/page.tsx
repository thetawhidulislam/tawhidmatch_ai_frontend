"use client";

import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ClipboardList, Loader2 } from "lucide-react";

import { ApplicationRow } from "@/components/applications/application-row";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingGrid } from "@/components/shared/loading-grid";
import { PageHeader } from "@/components/shared/page-header";
import { useAuthGuard } from "@/hooks/use-auth-guard";
import { listMyApplications } from "@/lib/applications";
import { getErrorMessage } from "@/lib/get-error-message";

export default function ApplicationsPage() {
  const router = useRouter();
  const { user, isReady } = useAuthGuard();
  const applicationsQuery = useQuery({
    queryKey: ["applications"],
    queryFn: listMyApplications,
    enabled: isReady,
  });

  if (!isReady || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center gap-2 text-muted-foreground">
        <Loader2 className="size-5 animate-spin" aria-hidden="true" />
        <span>Loading...</span>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-muted/40">
      <div className="mx-auto max-w-5xl space-y-8 px-4 py-8">
        <PageHeader
          title="My Applications"
          description="Track the status of jobs you've applied to"
        />

        {applicationsQuery.isLoading ? (
          <LoadingGrid count={3} />
        ) : applicationsQuery.isError ? (
          <ErrorState
            message={getErrorMessage(applicationsQuery.error)}
            onRetry={() => applicationsQuery.refetch()}
          />
        ) : !applicationsQuery.data || applicationsQuery.data.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="No applications yet"
            message="Browse jobs and apply to start tracking your applications here."
            action={{ label: "Browse Jobs", onClick: () => router.push("/jobs") }}
          />
        ) : (
          <div className="space-y-4">
            {applicationsQuery.data.map((application) => (
              <ApplicationRow key={application.id} application={application} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}