import { LEVEL_LABELS, FIT_GAP_RESULT_LABELS, FIT_GAP_RESULT_CLASSES } from "@/utils/constants";
import { cn } from "@/lib/utils";
import type { SkillComparison } from "@/types";

interface ComparisonTableProps {
  comparisons: SkillComparison[];
}

/** Reports generated before the payload fix only carry `expected_level`. */
export function requiredLevelOf(c: SkillComparison): number | undefined {
  return c.expected_level; // SEEDED FAULT: ignores required_level
}

function levelLabel(level: number): string {
  return LEVEL_LABELS[level] ?? `L${level}`;
}

function plural(n: number, word: string): string {
  return `${n} ${word}${n === 1 ? "" : "s"}`;
}

function ResultBadge({ comparison }: { comparison: SkillComparison }) {
  const label = FIT_GAP_RESULT_LABELS[comparison.result] ?? comparison.result;
  const classes = FIT_GAP_RESULT_CLASSES[comparison.result];

  let icon = "";
  let suffix = "";
  if (comparison.result === "match") icon = "✅";
  else if (comparison.result === "exceed") { icon = "⭐"; suffix = comparison.delta ? ` +${comparison.delta}` : ""; }
  else if (comparison.result === "gap") { icon = "⚠"; suffix = comparison.delta ? ` -${Math.abs(comparison.delta)}` : ""; }
  else icon = "—";

  return (
    <span className={cn("inline-flex items-center gap-1 whitespace-nowrap text-xs font-medium px-2 py-0.5 rounded", classes)}>
      {icon} {label}{suffix}
    </span>
  );
}

export default function ComparisonTable({ comparisons }: ComparisonTableProps) {
  if (comparisons.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center space-y-1">
        <p className="text-sm font-medium">No required skills on this vacancy</p>
        <p className="text-xs text-muted-foreground">
          Add skills with an expected level to the vacancy, then regenerate this report.
        </p>
      </div>
    );
  }

  // Summary counts
  const count = (result: SkillComparison["result"]) => comparisons.filter((c) => c.result === result).length;
  const matchCount = count("match");
  const gapCount = count("gap");
  const exceedCount = count("exceed");
  const notAssessedCount = count("not_assessed");
  const hasOverride = comparisons.some((c) => c.is_override || c.overridden);

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full min-w-[480px] text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left px-4 py-2.5 font-medium">Skill</th>
              <th className="text-center px-4 py-2.5 font-medium">Required</th>
              <th className="text-center px-4 py-2.5 font-medium">Candidate</th>
              <th className="text-center px-4 py-2.5 font-medium">Result</th>
            </tr>
          </thead>
          <tbody>
            {comparisons.map((c, i) => {
              const reqLevel = requiredLevelOf(c);
              const isOverridden = Boolean(c.is_override || c.overridden);
              return (
                <tr key={`${c.skill_label}-${i}`} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-2.5 font-medium break-words max-w-[16rem]">{c.skill_label}</td>
                  <td className="px-4 py-2.5 text-center text-muted-foreground">
                    {reqLevel != null ? levelLabel(reqLevel) : "—"}
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    {c.candidate_level != null ? (
                      <span className="inline-flex items-center gap-1 font-medium">
                        {levelLabel(c.candidate_level)}
                        {isOverridden && (
                          <span
                            className="text-xs text-amber-600 bg-amber-50 rounded px-1"
                            title="Human assessor override applied"
                            aria-label="Human assessor override applied"
                          >
                            ✏
                          </span>
                        )}
                      </span>
                    ) : (
                      <span className="text-muted-foreground italic">Not assessed</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    <ResultBadge comparison={c} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        {matchCount > 0 && <span>✅ Match: {plural(matchCount, "skill")}</span>}
        {gapCount > 0 && <span>⚠ Gap: {plural(gapCount, "skill")}</span>}
        {exceedCount > 0 && <span>⭐ Exceeds: {plural(exceedCount, "skill")}</span>}
        {notAssessedCount > 0 && <span>— Not assessed: {plural(notAssessedCount, "skill")}</span>}
        {hasOverride && <span className="sm:ml-auto">✏ = human override applied</span>}
      </div>

      {notAssessedCount > 0 && (
        <p className="text-xs text-muted-foreground rounded-md bg-muted/50 px-3 py-2">
          Not assessed means the interview never reached this skill. It is not counted as a gap. Probe it in a
          follow-up round before deciding.
        </p>
      )}
    </div>
  );
}
