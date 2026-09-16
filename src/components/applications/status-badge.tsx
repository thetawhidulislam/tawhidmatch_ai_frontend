import { Badge } from "@/components/ui/badge";
import type { ApplicationStatus } from "@/types";

const statusConfig: Record<
  ApplicationStatus,
  { label: string; variant: "default" | "secondary" | "outline"; className?: string }
> = {
  APPLIED: { label: "Applied", variant: "secondary" },
  SHORTLISTED: {
    label: "Shortlisted",
    variant: "outline",
    className: "border-blue-500 text-blue-600",
  },
  INTERVIEW: {
    label: "Interview",
    variant: "outline",
    className: "border-amber-500 text-amber-600",
  },
  REJECTED: {
    label: "Rejected",
    variant: "outline",
    className: "border-red-500 text-red-600",
  },
  HIRED: {
    label: "Hired",
    variant: "default",
    className: "bg-green-600 hover:bg-green-600",
  },
};

export function StatusBadge({ status }: { status: ApplicationStatus }) {
  const config = statusConfig[status];

  return (
    <Badge variant={config.variant} className={config.className}>
      {config.label}
    </Badge>
  );
}