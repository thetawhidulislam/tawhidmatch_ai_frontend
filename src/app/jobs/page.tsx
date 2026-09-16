"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { SearchX } from "lucide-react";

import { JobCard } from "@/components/job-card";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingGrid } from "@/components/shared/loading-grid";
import { PaginationControls } from "@/components/shared/pagination-controls";
import { Input } from "@/components/ui/input";
import { getErrorMessage } from "@/lib/get-error-message";
import { listJobs } from "@/lib/jobs";
import type { JobType } from "@/types";

const jobTypes: Array<{ label: string; value: JobType | "" }> = [
  { label: "All job types", value: "" },
  { label: "Remote", value: "REMOTE" },
  { label: "On-site", value: "ONSITE" },
  { label: "Hybrid", value: "HYBRID" },
];

const sortOptions = [
  { label: "Newest", value: "newest" },
  { label: "Salary: high to low", value: "salary_high" },
  { label: "Salary: low to high", value: "salary_low" },
] as const;

export default function JobsPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [jobType, setJobType] = useState<JobType | "">("");
  const [sortBy, setSortBy] = useState<(typeof sortOptions)[number]["value"]>(
    "newest"
  );
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 400);

    return () => window.clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [jobType, sortBy]);

  const query = useQuery({
    queryKey: ["jobs", { page, search: debouncedSearch, jobType, sortBy }],
    queryFn: () =>
      listJobs({
        page,
        limit: 20,
        search: debouncedSearch || undefined,
        jobType: jobType || undefined,
        sortBy,
      }),
  });

  const jobs = query.data?.jobs ?? [];
  const pagination = query.data?.pagination;

  return (
    <main className="min-h-screen bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-sm font-medium text-primary">TawhidMatch AI</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">Find your next opportunity</h1>
          <p className="mt-2 text-muted-foreground">
            Browse roles matched to the skills you want to put to work.
          </p>
        </div>

        <div className="mb-8 grid gap-3 rounded-xl border bg-background p-4 md:grid-cols-[minmax(0,1fr)_200px_220px]">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by title or company"
            aria-label="Search jobs"
          />
          <select
            value={jobType}
            onChange={(event) => setJobType(event.target.value as JobType | "")}
            aria-label="Filter by job type"
            className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
          >
            {jobTypes.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <select
            value={sortBy}
            onChange={(event) =>
              setSortBy(event.target.value as (typeof sortOptions)[number]["value"])
            }
            aria-label="Sort jobs"
            className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {query.isLoading ? (
          <LoadingGrid />
        ) : query.isError ? (
          <ErrorState
            message={getErrorMessage(query.error)}
            onRetry={() => query.refetch()}
          />
        ) : jobs.length === 0 ? (
          <EmptyState
            icon={SearchX}
            title="No jobs found"
            message="Try a different search or remove one of your filters."
          />
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {jobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
            {pagination && pagination.totalPages > 0 && (
              <PaginationControls
                page={pagination.page}
                limit={pagination.limit}
                total={pagination.total}
                totalPages={pagination.totalPages}
                onPageChange={setPage}
              />
            )}
          </>
        )}
      </div>
    </main>
  );
}
