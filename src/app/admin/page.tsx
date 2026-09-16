"use client";

import { useQuery } from "@tanstack/react-query";
import { BriefcaseBusiness, FileText, FolderKanban, UserRound, Users, Video } from "lucide-react";

import { ErrorState } from "@/components/shared/error-state";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { getErrorMessage } from "@/lib/get-error-message";
import { getDashboardStats } from "@/lib/admin";

const statCards = [
  { key: "totalUsers", label: "Total Users", icon: Users },
  { key: "totalJobs", label: "Total Jobs", icon: BriefcaseBusiness },
  { key: "openJobs", label: "Open Jobs", icon: FolderKanban },
  { key: "totalApplications", label: "Total Applications", icon: UserRound },
  { key: "completedInterviews", label: "Completed Interviews", icon: Video },
  { key: "totalResumes", label: "Total Resumes", icon: FileText },
] as const;

export default function AdminDashboardPage() {
  const statsQuery = useQuery({
    queryKey: ["admin-stats"],
    queryFn: getDashboardStats,
  });

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        <PageHeader title="Admin Dashboard" />
        {statsQuery.isLoading ? (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
            {statCards.map((stat) => <Card key={stat.key} className="h-32 animate-pulse bg-muted" />)}
          </div>
        ) : statsQuery.isError ? (
          <ErrorState message={getErrorMessage(statsQuery.error)} onRetry={() => statsQuery.refetch()} />
        ) : statsQuery.data ? (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
            {statCards.map(({ key, label, icon: Icon }) => (
              <Card key={key}>
                <CardContent className="flex items-center gap-4 py-6">
                  <div className="rounded-md bg-primary/10 p-2 text-primary">
                    <Icon className="size-5" aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-2xl font-semibold">{statsQuery.data[key]}</p>
                    <p className="text-sm text-muted-foreground">{label}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : null}
      </div>
    </main>
  );
}