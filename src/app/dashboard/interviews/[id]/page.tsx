"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { InterviewProgress } from "@/components/interview/interview-progress";
import { InterviewResultCard } from "@/components/interview/interview-result-card";
import { ErrorState } from "@/components/shared/error-state";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useAuthGuard } from "@/hooks/use-auth-guard";
import { getErrorMessage } from "@/lib/get-error-message";
import { getInterviewById, submitAnswer } from "@/lib/interviews";

export default function InterviewPage() {
  const { id } = useParams<{ id: string }>();
  const { user, isReady } = useAuthGuard();
  const [answerText, setAnswerText] = useState("");
  const queryClient = useQueryClient();
  const interviewQuery = useQuery({
    queryKey: ["interview", id],
    queryFn: () => getInterviewById(id),
    enabled: isReady && Boolean(id),
  });
  const answerMutation = useMutation({ mutationFn: submitAnswer });

  if (!isReady || !user || interviewQuery.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center gap-2 text-muted-foreground">
        <Loader2 className="size-5 animate-spin" aria-hidden="true" />
        <span>Loading...</span>
      </div>
    );
  }

  if (interviewQuery.isError) {
    return (
      <ErrorState
        message={getErrorMessage(interviewQuery.error)}
        onRetry={() => interviewQuery.refetch()}
      />
    );
  }

  const interview = interviewQuery.data;
  if (!interview) return null;

  if (interview.status === "COMPLETED") {
    return (
      <main className="min-h-screen bg-muted/40">
        <div className="mx-auto max-w-3xl space-y-8 px-4 py-8">
          <PageHeader title="Mock Interview Results" description="Review your AI-powered interview feedback" />
          <InterviewResultCard interview={interview} />
        </div>
      </main>
    );
  }

  const answeredCount = interview.questions.filter((question) => question.answer).length;
  const currentQuestion = interview.questions.find((question) => !question.answer);

  if (!currentQuestion) {
    return null;
  }

  const handleSubmit = async () => {
    const trimmedAnswer = answerText.trim();
    if (!trimmedAnswer) return;

    try {
      const result = await answerMutation.mutateAsync({
        interviewId: interview.id,
        input: { questionId: currentQuestion.id, answerText: trimmedAnswer },
      });

      setAnswerText("");
      toast.success(
        result.completed
          ? "Interview completed!"
          : "Answer saved, next question..."
      );
      await queryClient.invalidateQueries({ queryKey: ["interview", id] });
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <main className="min-h-screen bg-muted/40">
      <div className="mx-auto max-w-3xl space-y-8 px-4 py-8">
        <PageHeader title="Mock Interview" description="Answer each question thoughtfully and clearly" />
        <InterviewProgress current={answeredCount + 1} total={interview.questions.length} />
        <Card>
          <CardContent className="space-y-6 py-6">
            <h1 className="text-xl font-semibold">{currentQuestion.questionText}</h1>
            <Textarea
              value={answerText}
              onChange={(event) => setAnswerText(event.target.value)}
              placeholder="Type your answer here..."
              rows={8}
              disabled={answerMutation.isPending}
              aria-label="Your answer"
            />
            <div className="flex justify-end">
              <Button
                onClick={handleSubmit}
                disabled={!answerText.trim() || answerMutation.isPending}
              >
                {answerMutation.isPending ? "Submitting..." : "Submit Answer"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}