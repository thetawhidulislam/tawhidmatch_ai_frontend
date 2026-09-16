import Link from "next/link";

import { StatusBadge } from "@/components/applications/status-badge";
import { Card, CardContent } from "@/components/ui/card";
import type { Application } from "@/types";

interface ApplicationRowProps {
  application: Application;
}

function formatAppliedDate(date: string): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function ApplicationRow({ application }: ApplicationRowProps) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <Link href={`/jobs/${application.jobId}`} className="group block">
            <h2 className="truncate text-lg font-semibold group-hover:text-primary">
              {application.job.title}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {application.job.company} <span aria-hidden="true">·</span> {application.job.location}
            </p>
          </Link>
        </div>
        <div className="flex items-center justify-between gap-4 sm:shrink-0 sm:flex-col sm:items-end sm:gap-2">
          <StatusBadge status={application.status} />
          <p className="text-sm text-muted-foreground">
            Applied {formatAppliedDate(application.appliedAt)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}