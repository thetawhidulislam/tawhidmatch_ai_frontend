"use client";

import { Loader2, Trash2 } from "lucide-react";

import { ResumeAnalysisCard } from "@/components/resume/resume-analysis-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Resume } from "@/types";

function formatFileSize(fileSize: number): string {
  if (fileSize < 1024 * 1024) return `${Math.max(1, Math.round(fileSize / 1024))} KB`;
  return `${(fileSize / (1024 * 1024)).toFixed(1)} MB`;
}

function formatUploadedDate(createdAt: string): string {
  return `Uploaded ${new Date(createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })}`;
}

interface ResumeListItemProps {
  resume: Resume;
  onAnalyze: (id: string) => void;
  onDelete: (id: string) => void;
  isAnalyzing: boolean;
}

export function ResumeListItem({
  resume,
  onAnalyze,
  onDelete,
  isAnalyzing,
}: ResumeListItemProps) {
  const handleDelete = () => {
    if (window.confirm(`Delete ${resume.fileName}?`)) onDelete(resume.id);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="truncate font-medium">{resume.fileName}</p>
              {resume.isActive && <Badge variant="secondary">Active</Badge>}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {formatUploadedDate(resume.createdAt)} · {formatFileSize(resume.fileSize)}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {!resume.aiAnalysis && (
              <Button
                variant="outline"
                onClick={() => onAnalyze(resume.id)}
                disabled={isAnalyzing}
              >
                {isAnalyzing && <Loader2 className="animate-spin" aria-hidden="true" />}
                {isAnalyzing ? "Analyzing..." : "Analyze with AI"}
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDelete}
              title={`Delete ${resume.fileName}`}
              aria-label={`Delete ${resume.fileName}`}
            >
              <Trash2 aria-hidden="true" />
            </Button>
          </div>
        </CardContent>
      </Card>
      {resume.aiAnalysis && <ResumeAnalysisCard analysis={resume.aiAnalysis} />}
    </div>
  );
}
