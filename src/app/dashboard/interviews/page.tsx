"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Loader2, MessagesSquare } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingGrid } from "@/components/shared/loading-grid";
import { PageHeader } from "@/components/shared/page-header";
import { ScoreBar } from "@/components/shared/score-bar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useAuthGuard } from "@/hooks/use-auth-guard";
import { getErrorMessage } from "@/lib/get-error-message";
import { listMyInterviews } from "@/lib/interviews";

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function InterviewsPage() {
  const { user, isReady } = useAuthGuard();
  const interviewsQuery = useQuery({
    queryKey: ["interviews"],
    queryFn: listMyInterviews,
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
          title="Mock Interviews"
          description="Practice interviews for jobs you're interested in and get AI feedback"
        />

        {interviewsQuery.isLoading ? (
          <LoadingGrid count={3} />
        ) : interviewsQuery.isError ? (
          <ErrorState
            message={getErrorMessage(interviewsQuery.error)}
            onRetry={() => interviewsQuery.refetch()}
          />
        ) : interviewsQuery.data.length === 0 ? (
          <EmptyState
            icon={MessagesSquare}
            title="No interviews yet"
            message="Start a mock interview from any job's detail page to practice and get AI feedback."
          />
        ) : (
          <div className="space-y-4">
            {interviewsQuery.data.map((interview) => (
              <Link key={interview.id} href={`/dashboard/interviews/${interview.id}`} className="block">
                <Card className="transition-colors hover:bg-accent/40">
                  <CardContent className="space-y-4 py-5 sm:flex sm:items-center sm:justify-between sm:gap-6 sm:space-y-0">
                    <div className="min-w-0">
                      <h2 className="truncate text-lg font-semibold">{interview.job.title}</h2>
                      <p className="mt-1 text-sm text-muted-foreground">{interview.job.company}</p>
                      <p className="mt-2 text-sm text-muted-foreground">Started {formatDate(interview.createdAt)}</p>
                    </div>
                    <div className="w-full space-y-3 sm:w-56 sm:shrink-0">
                      <div className="flex items-center justify-between gap-3">
                        <Badge
                          variant={interview.status === "COMPLETED" ? "default" : "secondary"}
                          className={interview.status === "COMPLETED" ? "bg-green-600 hover:bg-green-600" : undefined}
                        >
                          {interview.status === "COMPLETED" ? "Completed" : "In Progress"}
                        </Badge>
                        {interview.overallScore !== null && (
                          <span className="text-sm font-medium">{interview.overallScore}%</span>
                        )}
                      </div>
                      {interview.status === "COMPLETED" && interview.overallScore !== null && (
                        <ScoreBar score={interview.overallScore} label="Overall score" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}