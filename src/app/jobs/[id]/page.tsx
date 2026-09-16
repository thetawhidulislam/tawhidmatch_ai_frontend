"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { ArrowLeft, BriefcaseBusiness, MapPin } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ApplyDialog } from "@/components/jobs/apply-dialog";
import { ScoreBar } from "@/components/shared/score-bar";
import { getErrorMessage } from "@/lib/get-error-message";
import { getJobById, getJobMatch } from "@/lib/jobs";
import { useAuthStore } from "@/store/auth-store";
import type { ApiError, Job } from "@/types";

function formatSalary(job: Job): string {
  if (job.salaryMin === null && job.salaryMax === null) return "Not disclosed";
  const formatAmount = (amount: number | null) =>
    amount === null ? "-" : `$${amount.toLocaleString()}`;
  return `${formatAmount(job.salaryMin)} - ${formatAmount(job.salaryMax)}`;
}

function isNoActiveResumeError(error: unknown): boolean {
  if (!(error instanceof AxiosError)) return false;
  const data = error.response?.data as ApiError | undefined;
  return data?.code === "NO_ACTIVE_RESUME";
}

function MatchScore({ jobId }: { jobId: string }) {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["job-match", jobId],
    queryFn: () => getJobMatch(jobId),
  });

  if (isLoading) {
    return <div className="h-48 animate-pulse rounded-xl bg-muted" />;
  }

  if (isError && isNoActiveResumeError(error)) {
    return (
      <Card>
        <CardContent className="py-6">
          <p className="font-medium">Your match score is almost ready.</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Upload and analyze a resume to see your match score for this job.
          </p>
          <Link href="/dashboard" className="mt-4 inline-block text-sm font-medium text-primary hover:underline">
            Go to your dashboard
          </Link>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardContent className="py-6">
          <p className="font-medium">We couldn&apos;t calculate your match score.</p>
          <p className="mt-1 text-sm text-muted-foreground">{getErrorMessage(error)}</p>
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  const score = Math.max(0, Math.min(100, data.matchScore));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between gap-4">
          <span>Your match score</span>
          <span>{score}%</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <ScoreBar score={score} label="Match score" />
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <h3 className="mb-3 text-sm font-semibold text-green-700">Matched skills</h3>
            <div className="flex flex-wrap gap-2">
              {data.matched.length > 0 ? data.matched.map((skill) => (
                <Badge key={skill} className="bg-green-100 text-green-800 hover:bg-green-100">
                  {skill}
                </Badge>
              )) : <span className="text-sm text-muted-foreground">No matched skills yet.</span>}
            </div>
          </div>
          <div>
            <h3 className="mb-3 text-sm font-semibold text-red-700">Missing skills</h3>
            <div className="flex flex-wrap gap-2">
              {data.missing.length > 0 ? data.missing.map((skill) => (
                <Badge key={skill} variant="outline" className="border-red-200 text-red-700">
                  {skill}
                </Badge>
              )) : <span className="text-sm text-muted-foreground">No missing skills reported.</span>}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const user = useAuthStore((state) => state.user);
  const [applyDialogOpen, setApplyDialogOpen] = useState(false);
  const jobQuery = useQuery({
    queryKey: ["job", id],
    queryFn: () => getJobById(id),
    enabled: Boolean(id),
  });

  if (jobQuery.isLoading) {
    return <main className="mx-auto min-h-screen max-w-4xl px-4 py-12"><div className="h-96 animate-pulse rounded-xl bg-muted" /></main>;
  }

  if (jobQuery.isError || !jobQuery.data) {
    return (
      <main className="mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center px-4 py-12 text-center">
        <h1 className="text-xl font-semibold">We couldn&apos;t find that job.</h1>
        <p className="mt-2 text-sm text-muted-foreground">{getErrorMessage(jobQuery.error)}</p>
        <Button asChild className="mt-6"><Link href="/jobs">Back to jobs</Link></Button>
      </main>
    );
  }

  const job = jobQuery.data;

  return (
    <main className="min-h-screen bg-muted/30">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <Link href="/jobs" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to jobs
        </Link>

        <Card>
          <CardHeader className="gap-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <CardTitle className="text-3xl">{job.title}</CardTitle>
                <p className="mt-2 text-lg text-muted-foreground">{job.company}</p>
              </div>
              <Badge variant={job.status === "OPEN" ? "secondary" : "destructive"}>{job.status}</Badge>
            </div>
            <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2"><MapPin className="size-4" aria-hidden="true" />{job.location}</span>
              <span className="inline-flex items-center gap-2"><BriefcaseBusiness className="size-4" aria-hidden="true" />{job.jobType}</span>
              <span>{job.experienceLevel}</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-8">
            <section>
              <h2 className="mb-3 text-lg font-semibold">About the role</h2>
              <p className="whitespace-pre-wrap leading-7 text-muted-foreground">{job.description}</p>
            </section>
            <section>
              <h2 className="mb-3 text-lg font-semibold">Skills</h2>
              <div className="flex flex-wrap gap-2">
                {job.skills.map((skill) => <Badge key={skill} variant="outline">{skill}</Badge>)}
              </div>
            </section>
            <section>
              <h2 className="mb-2 text-lg font-semibold">Salary</h2>
              <p className="text-muted-foreground">{formatSalary(job)}</p>
            </section>
            {user ? <MatchScore jobId={job.id} /> : (
              <Card className="bg-muted/40">
                <CardContent className="py-6">
                  <p className="font-medium">Sign in to see how well you match this job</p>
                  <Link href="/login" className="mt-2 inline-block text-sm font-medium text-primary hover:underline">Sign in</Link>
                </CardContent>
              </Card>
            )}
          </CardContent>
          <CardFooter className="border-t pt-6">
            <Button
              className="w-full sm:w-auto"
              disabled={job.status === "CLOSED"}
              title={job.status === "CLOSED" ? "This position is closed" : undefined}
              onClick={() => {
                if (!user) {
                  toast.info("Please sign in to apply");
                  return;
                }
                if (job.status !== "CLOSED") setApplyDialogOpen(true);
              }}
            >
              {job.status === "CLOSED" ? "This position is closed" : "Apply Now"}
            </Button>
          </CardFooter>
        </Card>
      </div>
      <ApplyDialog
        jobId={job.id}
        jobTitle={job.title}
        open={applyDialogOpen}
        onOpenChange={setApplyDialogOpen}
      />
    </main>
  );
}
