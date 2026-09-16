"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { UploadCloud } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingGrid } from "@/components/shared/loading-grid";
import { PageHeader } from "@/components/shared/page-header";
import { ResumeAnalysisCard } from "@/components/resume/resume-analysis-card";
import { ResumeListItem } from "@/components/resume/resume-list-item";
import { ResumeUploadCard } from "@/components/resume/resume-upload-card";
import { getErrorMessage } from "@/lib/get-error-message";
import {
  analyzeResume,
  deleteResume,
  listResumes,
  uploadResume,
} from "@/lib/resumes";
import { useAuthStore } from "@/store/auth-store";

export default function ResumesPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const [analyzingResumeId, setAnalyzingResumeId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) router.replace("/login");
  }, [user, router]);

  const resumesQuery = useQuery({
    queryKey: ["resumes"],
    queryFn: listResumes,
    enabled: Boolean(user),
  });

  const uploadMutation = useMutation({
    mutationFn: uploadResume,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["resumes"] });
      toast.success("Resume uploaded successfully.");
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteResume,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["resumes"] });
      toast.success("Resume deleted successfully.");
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });

  const analyzeMutation = useMutation({
    mutationFn: analyzeResume,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["resumes"] });
      toast.success("Resume analysis completed.");
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });

  if (!user) return null;

  const handleUpload = async (file: File) => {
    await uploadMutation.mutateAsync(file);
  };

  const handleAnalyze = (id: string) => {
    setAnalyzingResumeId(id);
    analyzeMutation.mutate(id, {
      onSettled: () => setAnalyzingResumeId(null),
    });
  };

  return (
    <main className="min-h-screen bg-muted/40">
      <div className="mx-auto max-w-5xl space-y-8 px-4 py-8">
        <PageHeader
          title="My Resumes"
          description="Upload your CV and get AI-powered feedback"
        />
        <ResumeUploadCard onUpload={handleUpload} />

        {resumesQuery.isLoading ? (
          <LoadingGrid count={2} />
        ) : resumesQuery.isError ? (
          <ErrorState
            message={getErrorMessage(resumesQuery.error)}
            onRetry={() => resumesQuery.refetch()}
          />
        ) : resumesQuery.data?.length === 0 ? (
          <EmptyState
            icon={UploadCloud}
            title="No resumes yet"
            message="Upload your CV to get personalized AI-powered feedback."
          />
        ) : (
          <div className="space-y-6">
            {resumesQuery.data?.map((resume) => (
              <ResumeListItem
                key={resume.id}
                resume={resume}
                onAnalyze={handleAnalyze}
                onDelete={(id) => deleteMutation.mutate(id)}
                isAnalyzing={analyzingResumeId === resume.id}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
