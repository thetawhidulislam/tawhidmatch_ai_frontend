import { cn } from "@/lib/utils";

interface ScoreBarProps {
  score: number;
  label?: string;
}

export function ScoreBar({ score, label }: ScoreBarProps) {
  const normalizedScore = Math.max(0, Math.min(100, score));
  const colorClass =
    normalizedScore >= 70
      ? "bg-green-500"
      : normalizedScore >= 40
        ? "bg-yellow-500"
        : "bg-red-500";

  return (
    <div className="space-y-2">
      {label && (
        <div className="flex items-center justify-between text-sm">
          <span>{label}</span>
          <span className="font-medium">{normalizedScore}%</span>
        </div>
      )}
      <div
        className="h-2 overflow-hidden rounded-full bg-muted"
        aria-label={`${label ? `${label}: ` : ""}${normalizedScore}%`}
      >
        <div
          className={cn("h-full rounded-full transition-all", colorClass)}
          style={{ width: `${normalizedScore}%` }}
        />
      </div>
    </div>
  );
}
