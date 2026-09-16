interface InterviewProgressProps {
  current: number;
  total: number;
}

export function InterviewProgress({ current, total }: InterviewProgressProps) {
  const progress = total > 0 ? Math.min(100, (current / total) * 100) : 0;

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">
        Question {current} of {total}
      </p>
      <div
        className="h-2 overflow-hidden rounded-full bg-muted"
        aria-label={`Question ${current} of ${total}`}
      >
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}