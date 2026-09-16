import { AlertCircle, CheckCircle2, Lightbulb } from "lucide-react";

import { ScoreBar } from "@/components/shared/score-bar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AIAnalysis, Skill } from "@/types";

function skillVariant(level: Skill["level"]): "default" | "secondary" | "outline" {
  if (level === "Strong") return "default";
  if (level === "Intermediate") return "secondary";
  return "outline";
}

interface ResumeAnalysisCardProps {
  analysis: AIAnalysis;
}

export function ResumeAnalysisCard({ analysis }: ResumeAnalysisCardProps) {
  return (
    <Card className="bg-muted/30">
      <CardHeader>
        <CardTitle className="text-lg">AI analysis</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <ScoreBar score={analysis.score} label="Overall Score" />
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Level</span>
          <Badge variant="secondary">{analysis.level}</Badge>
        </div>

        <section>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Skills</h3>
          <div className="flex flex-wrap gap-2">
            {analysis.skills.map((skill) => (
              <Badge key={skill.name} variant={skillVariant(skill.level)}>
                {skill.name} ({skill.level})
              </Badge>
            ))}
          </div>
        </section>

        <AnalysisList
          title="Strengths"
          items={analysis.strengths}
          icon={<CheckCircle2 className="mt-0.5 size-4 shrink-0 text-green-600" aria-hidden="true" />}
        />
        <AnalysisList
          title="Missing Skills"
          items={analysis.missingSkills}
          icon={<AlertCircle className="mt-0.5 size-4 shrink-0 text-amber-600" aria-hidden="true" />}
        />
        <AnalysisList
          title="Recommendations"
          items={analysis.recommendations}
          icon={<Lightbulb className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />}
        />
      </CardContent>
    </Card>
  );
}

function AnalysisList({
  title,
  items,
  icon,
}: {
  title: string;
  items: string[];
  icon: React.ReactNode;
}) {
  return (
    <section>
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">{title}</h3>
      <ul className="space-y-2 text-sm">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2">
            {icon}
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
