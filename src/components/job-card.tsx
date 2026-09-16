import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import type { Job } from "@/types";

function formatSalary(job: Job): string {
  if (job.salaryMin === null && job.salaryMax === null) return "Not disclosed";
  const formatAmount = (amount: number | null) =>
    amount === null ? "-" : `$${amount.toLocaleString()}`;
  return `${formatAmount(job.salaryMin)} - ${formatAmount(job.salaryMax)}`;
}

export function JobCard({ job }: { job: Job }) {
  const remainingSkills = Math.max(job.skills.length - 4, 0);

  return (
    <Link href={`/jobs/${job.id}`} className="group block h-full">
      <Card className="h-full transition-shadow duration-200 group-hover:shadow-md">
        <CardHeader>
          <CardTitle className="text-lg">{job.title}</CardTitle>
          <p className="text-sm text-muted-foreground">
            {job.company} <span aria-hidden="true">&middot;</span> {job.location}
          </p>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{job.jobType}</Badge>
            {job.skills.slice(0, 4).map((skill) => (
              <Badge key={skill} variant="outline">
                {skill}
              </Badge>
            ))}
            {remainingSkills > 0 && (
              <Badge variant="outline">+{remainingSkills} more</Badge>
            )}
          </div>
          <p className="mt-auto text-sm font-medium">{formatSalary(job)}</p>
        </CardContent>
        <CardFooter className="border-t pt-4">
          <span className="text-sm font-medium text-primary group-hover:underline">
            View Details
          </span>
        </CardFooter>
      </Card>
    </Link>
  );
}
