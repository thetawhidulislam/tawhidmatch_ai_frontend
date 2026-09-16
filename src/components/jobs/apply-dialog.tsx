"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { applyToJob } from "@/lib/applications";
import { getErrorMessage } from "@/lib/get-error-message";
import { listResumes } from "@/lib/resumes";
import type { ApiError } from "@/types";

interface ApplyDialogProps {
  jobId: string;
  jobTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function getApplicationErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const data = error.response?.data as ApiError | undefined;
    if (error.response?.status === 409 || data?.code === "APPLICATION_EXISTS") {
      return "You have already applied to this job";
    }
    if (error.response?.status === 400 || data?.code === "JOB_NOT_OPEN") {
      return "This job is no longer accepting applications";
    }
    if (error.response?.status === 403) {
      return "You cannot apply with this resume";
    }
  }
  return getErrorMessage(error);
}

export function ApplyDialog({ jobId, jobTitle, open, onOpenChange }: ApplyDialogProps) {
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);
  const resumesQuery = useQuery({
    queryKey: ["resumes"],
    queryFn: listResumes,
    enabled: open,
  });
  const applyMutation = useMutation({
    mutationFn: applyToJob,
    onSuccess: () => {
      toast.success("Application submitted!");
      onOpenChange(false);
    },
    onError: (error: unknown) => toast.error(getApplicationErrorMessage(error)),
  });

  useEffect(() => {
    const activeResume = resumesQuery.data?.find((resume) => resume.isActive);
    if (activeResume) setSelectedResumeId(activeResume.id);
  }, [resumesQuery.data]);

  const handleSubmit = () => {
    if (!selectedResumeId) return;
    applyMutation.mutate({ jobId, resumeId: selectedResumeId });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Apply to {jobTitle}</DialogTitle>
          <DialogDescription>Select the resume you want to submit with your application.</DialogDescription>
        </DialogHeader>

        {resumesQuery.isLoading && (
          <div className="flex justify-center py-8" aria-label="Loading resumes">
            <div className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        )}

        {resumesQuery.isError && (
          <p className="py-4 text-sm text-destructive">{getErrorMessage(resumesQuery.error)}</p>
        )}

        {resumesQuery.data && resumesQuery.data.length === 0 && (
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">You need to upload a resume before applying</p>
            <Button asChild onClick={() => onOpenChange(false)}>
              <Link href="/dashboard/resumes">Go to Resumes</Link>
            </Button>
          </div>
        )}

        {resumesQuery.data && resumesQuery.data.length > 0 && (
          <div className="space-y-3">
            {resumesQuery.data.map((resume) => {
              const selected = selectedResumeId === resume.id;
              return (
                <button
                  key={resume.id}
                  type="button"
                  className={`flex w-full items-center justify-between rounded-md border p-3 text-left transition-colors ${
                    selected ? "border-primary bg-primary/5" : "border-border hover:bg-accent"
                  }`}
                  onClick={() => setSelectedResumeId(resume.id)}
                  aria-pressed={selected}
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <span className={`size-4 shrink-0 rounded-full border-4 ${selected ? "border-primary" : "border-muted-foreground/40"}`} />
                    <span className="truncate text-sm font-medium">{resume.fileName}</span>
                  </span>
                  {resume.isActive && <Badge variant="secondary">Active</Badge>}
                </button>
              );
            })}
          </div>
        )}

        {resumesQuery.data && resumesQuery.data.length > 0 && (
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button disabled={!selectedResumeId || applyMutation.isPending} onClick={handleSubmit}>
              {applyMutation.isPending ? "Submitting..." : "Confirm Application"}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}