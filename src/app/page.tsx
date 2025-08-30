"use client";
import { useMemo, useState } from "react";
import InputPanel from "@/components/InputPanel";
import GraphPanel from "@/components/GraphPanel";
import { LinearProgrammingProblem, Solution } from "@/lib/models";
import { LinearProgrammingSolver } from "@/lib/solver";

export default function Home() {
  const solver = useMemo(() => new LinearProgrammingSolver(), []);
  const [solution, setSolution] = useState<Solution | null>(null);

  const onSolve = (p: LinearProgrammingProblem) => {
    const sol = solver.solve(p);
    setSolution(sol);
  };

  const loadStartup = () => {
    const problem: LinearProgrammingProblem = {
      objectiveFunction: { c1: 250, c2: 300, optimizationType: "maximizar" },
      constraints: [
        { a1: 20, a2: 15, inequalityType: "≤", b: 600 },
        { a1: 10, a2: 15, inequalityType: "≤", b: 450 },
      ],
    };
    setSolution(solver.solve(problem));
  };

  const loadProduction = () => {
    const problem: LinearProgrammingProblem = {
      objectiveFunction: { c1: 400, c2: 300, optimizationType: "maximizar" },
      constraints: [
        { a1: 2, a2: 1, inequalityType: "≤", b: 100 },
        { a1: 1, a2: 2, inequalityType: "≤", b: 80 },
      ],
    };
    setSolution(solver.solve(problem));
  };

  const loadMix = () => {
    const problem: LinearProgrammingProblem = {
      objectiveFunction: { c1: 20, c2: 30, optimizationType: "minimizar" },
      constraints: [
        { a1: 1, a2: 1, inequalityType: "≥", b: 40 },
        { a1: 2, a2: 1, inequalityType: "≤", b: 80 },
      ],
    };
    setSolution(solver.solve(problem));
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-10 bg-gray-50">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-6 items-stretch lg:items-start">
        <InputPanel
          onSolve={onSolve}
          onLoadStartup={loadStartup}
          onLoadProduction={loadProduction}
          onLoadMix={loadMix}
        />
        <GraphPanel solution={solution} />
      </div>
    </div>
  );
}
