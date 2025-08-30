"use client";
import { useMemo, useState } from "react";
import InputPanel from "@/components/InputPanel";
import GraphPanel from "@/components/GraphPanel";
import ResultsPanel from "@/components/ResultsPanel";
import ScrollNav from "@/components/ScrollNav";
import { LinearProgrammingProblem, Solution } from "@/lib/models";
import { LinearProgrammingSolver } from "@/lib/solver";

export default function Home() {
  const solver = useMemo(() => new LinearProgrammingSolver(), []);
  const [solution, setSolution] = useState<Solution | null>(null);

  const onSolve = (p: LinearProgrammingProblem) => {
    const sol = solver.solve(p);
    setSolution(sol);
  };

  // Los ejemplos ahora se aplican desde el propio InputPanel

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-10 bg-gray-50">
      <ScrollNav />
      <div className="max-w-7xl mx-auto flex flex-col gap-6 scroll-smooth sm:pl-20">
        {/* Panel 1: Datos del Problema */}
        <section id="section-problem">
          <InputPanel onSolve={onSolve} />
        </section>

        {/* Panel 2: Gráfico */}
        <section id="section-graph">
          <GraphPanel solution={solution} />
        </section>

        {/* Panel 3: Resultados Detallados */}
        <section id="section-results">
          <ResultsPanel solution={solution} />
        </section>
      </div>
    </div>
  );
}
