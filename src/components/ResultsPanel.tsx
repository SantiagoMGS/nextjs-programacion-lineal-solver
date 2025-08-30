"use client";
/* eslint @typescript-eslint/no-explicit-any: "off" */
import { useMemo } from "react";
import { Solution } from "@/lib/models";
import { constraintLabel, isNonNegativity } from "@/lib/solver";

type Props = { solution: Solution | null };

export default function ResultsPanel({ solution }: Props) {
  const text = useMemo(() => {
    if (!solution) return 'Configure los datos y presione "RESOLVER PROBLEMA".';
    const lines: string[] = [];
    lines.push("=== RESULTADOS DEL PROBLEMA ===", "");
    lines.push("PROBLEMA PLANTEADO:");
    lines.push(
      `• ${solution.problem.objectiveFunction.optimizationType.toUpperCase()} Z = ${
        solution.problem.objectiveFunction.c1
      }·X₁ + ${solution.problem.objectiveFunction.c2}·X₂`
    );
    lines.push("• Restricciones:");
    solution.problem.constraints.forEach((c) => {
      if (!isNonNegativity(c)) lines.push(`  - ${constraintLabel(c)}`);
    });
    lines.push("  - X₁ ≥ 0, X₂ ≥ 0", "");

    lines.push("=== VÉRTICES DE LA REGIÓN FACTIBLE ===");
    if (solution.vertexEvaluations.length) {
      solution.vertexEvaluations.forEach((e, i) =>
        lines.push(
          `${i + 1}. (${e.point.x1.toFixed(3)}, ${e.point.x2.toFixed(
            3
          )}) → Z = ${e.objectiveValue.toFixed(3)} ✓`
        )
      );
    } else {
      lines.push("No se encontraron vértices factibles.");
    }
    lines.push("");

    lines.push("=== SOLUCIÓN ÓPTIMA ===");
    if (solution.optimalPoint && solution.optimalValue != null) {
      lines.push(
        `Punto óptimo: X₁* = ${solution.optimalPoint.x1.toFixed(
          3
        )}, X₂* = ${solution.optimalPoint.x2.toFixed(3)}`
      );
      lines.push(`Valor óptimo: Z* = ${solution.optimalValue.toFixed(3)}`);
    } else {
      lines.push("No se encontró solución factible.");
    }

    return lines.join("\n");
  }, [solution]);

  return (
    <div className="border border-gray-200 rounded p-4 bg-white shadow-sm text-gray-900">
      <div className="font-semibold mb-2 text-gray-900">
        Resultados Detallados
      </div>
      <pre className="whitespace-pre-wrap text-sm">{text}</pre>
    </div>
  );
}
