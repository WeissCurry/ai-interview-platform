import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import ComparisonTable from "../ComparisonTable";
import type { SkillComparison } from "@/types";

describe("ComparisonTable Component", () => {
  it("renders comparisons with expected_level or required_level correctly", () => {
    const mockComparisons: SkillComparison[] = [
      {
        skill_label: "React / Frontend Development",
        expected_level: 3,
        candidate_level: 3,
        result: "match",
        delta: 0,
      },
      {
        skill_label: "System Design",
        expected_level: 4,
        candidate_level: 2,
        result: "gap",
        delta: -2,
        is_override: true,
      },
      {
        skill_label: "Communication",
        expected_level: 3,
        candidate_level: undefined,
        result: "not_assessed",
      },
    ];

    render(<ComparisonTable comparisons={mockComparisons} />);

    // Check skill labels rendered
    expect(screen.getByText("React / Frontend Development")).toBeInTheDocument();
    expect(screen.getByText("System Design")).toBeInTheDocument();
    expect(screen.getByText("Communication")).toBeInTheDocument();

    // Check required/expected level rendered (L3, L4, L3)
    expect(screen.getByText("L4")).toBeInTheDocument();
    const requiredLevels = screen.getAllByText("L3");
    expect(requiredLevels.length).toBeGreaterThanOrEqual(1);

    // Check human override indicator ✏ is displayed for overridden skill
    expect(screen.getByText("✏")).toBeInTheDocument();

    // Check summary section
    expect(screen.getByText(/Match: 1 skill/i)).toBeInTheDocument();
    expect(screen.getByText(/Gap: 1 skill/i)).toBeInTheDocument();
  });
});
