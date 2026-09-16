"use client";

import { useState } from "react";
import { AlertCircle, CheckCircle2, ChevronDown } from "lucide-react";

import { ScoreBar } from "@/components/shared/score-bar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Interview } from "@/types";

interface InterviewResultCardProps {
  interview: Interview;
}

function ResultScore({ label, score }: { label: string; score: number | null }) {
  return <ScoreBar label={label} score={score ?? 0} />;
}

export function InterviewResultCard({ interview }: InterviewResultCardProps) {
  const [showQuestions, setShowQuestions] = useState(false);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Interview Results</CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        <ResultScore label="Overall Score" score={interview.overallScore} />

        <div className="grid gap-5 sm:grid-cols-2">
          <ResultScore label="Technical Skills" score={interview.technicalScore} />
          <ResultScore label="Communication" score={interview.communicationScore} />
          <ResultScore label="Problem Solving" score={interview.problemSolvingScore} />
          <ResultScore label="Confidence" score={interview.confidenceScore} />
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <section>
            <h3 className="mb-3 font-semibold">Strengths</h3>
            {interview.strengths.length > 0 ? (
              <ul className="space-y-2">
                {interview.strengths.map((strength) => (
                  <li key={strength} className="flex gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-green-600" aria-hidden="true" />
                    <span>{strength}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No strengths were recorded.</p>
            )}
          </section>
          <section>
            <h3 className="mb-3 font-semibold">Areas to Improve</h3>
            {interview.improvements.length > 0 ? (
              <ul className="space-y-2">
                {interview.improvements.map((improvement) => (
                  <li key={improvement} className="flex gap-2 text-sm text-muted-foreground">
                    <AlertCircle className="mt-0.5 size-4 shrink-0 text-amber-600" aria-hidden="true" />
                    <span>{improvement}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No improvement areas were recorded.</p>
            )}
          </section>
        </div>

        <section className="border-t pt-6">
          <button
            type="button"
            className="flex w-full items-center justify-between text-left font-semibold"
            onClick={() => setShowQuestions((visible) => !visible)}
            aria-expanded={showQuestions}
          >
            Review Questions &amp; Answers
            <ChevronDown
              className={`size-4 transition-transform ${showQuestions ? "rotate-180" : ""}`}
              aria-hidden="true"
            />
          </button>
          {showQuestions && (
            <div className="mt-4 space-y-4">
              {interview.questions.map((question) => (
                <div key={question.id} className="space-y-2">
                  <p className="font-medium">{question.questionText}</p>
                  <p className="rounded-md bg-muted/60 p-3 text-sm text-muted-foreground">
                    {question.answer?.answerText || "No answer recorded."}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </CardContent>
    </Card>
  );
}