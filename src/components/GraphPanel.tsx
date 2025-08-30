"use client";
/* eslint @typescript-eslint/no-explicit-any: "off" */
import dynamic from "next/dynamic";
import { useMemo } from "react";
import { Solution } from "@/lib/models";
import {
  constraintLabel,
  isNonNegativity,
  LinearProgrammingSolver,
  linspace,
  hexWithAlpha,
  COLORS,
} from "@/lib/solver";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

type Props = { solution: Solution | null };

export default function GraphPanel({ solution }: Props) {
  const solver = useMemo(() => new LinearProgrammingSolver(), []);

  const { data, layout } = useMemo(() => {
    const traces: any[] = [];
    const xMax = calcMax(solution?.feasibleVertices?.map((v) => v.x1));
    const yMax = calcMax(solution?.feasibleVertices?.map((v) => v.x2));
    const XMAX = xMax ?? 50;
    const YMAX = yMax ?? 50;

    solution?.problem.constraints.forEach((c, i) => {
      if (isNonNegativity(c)) return;
      const { x, y } = solver.getConstraintLinePoints(c, 0, XMAX, 500);
      const color = COLORS[i % COLORS.length];

      const valid = x
        .map((xi, idx) => ({ xi, yi: y[idx] }))
        .filter((p) => p.yi >= 0 && p.yi <= YMAX);
      const xL = valid.map((p) => p.xi);
      const yL = valid.map((p) => p.yi);
      if (xL.length < 2) return;

      traces.push({
        x: xL,
        y: yL,
        mode: "lines",
        name: constraintLabel(c),
        line: { color, width: 2 },
      });

      if (c.inequalityType === "≤") {
        traces.push({
          x: xL,
          y: yL,
          fill: "tozeroy",
          name: undefined,
          fillcolor: hexWithAlpha(color, 0.12),
          line: { color: "rgba(0,0,0,0)" },
          showlegend: false,
        });
      } else if (c.inequalityType === "≥") {
        traces.push({
          x: [0, XMAX],
          y: [YMAX, YMAX],
          mode: "lines",
          line: { color: "rgba(0,0,0,0)" },
          showlegend: false,
        });
        traces.push({
          x: xL,
          y: yL,
          mode: "lines",
          fill: "tonexty",
          fillcolor: hexWithAlpha(color, 0.12),
          line: { color: "rgba(0,0,0,0)" },
          showlegend: false,
        });
      }
    });

    if (solution?.intersectionPoints?.length) {
      const pts = solution.intersectionPoints.filter(
        (p) => p.x1 >= 0 && p.x2 >= 0
      );
      traces.push({
        x: pts.map((p) => p.x1),
        y: pts.map((p) => p.x2),
        mode: "markers",
        name: "Intersecciones",
        marker: { color: "gray", size: 6, opacity: 0.7 },
      });
    }

    if (solution?.feasibleVertices?.length) {
      traces.push({
        x: solution.feasibleVertices.map((v) => v.x1),
        y: solution.feasibleVertices.map((v) => v.x2),
        mode: "markers+text",
        name: "Vértices Factibles",
        marker: { color: "black", size: 10 },
        text: solution.feasibleVertices.map(
          (v) => `(${v.x1.toFixed(1)}, ${v.x2.toFixed(1)})`
        ),
        textposition: "top right",
        textfont: { size: 10, weight: "bold" },
      });
    }

    if (solution?.optimalPoint && solution.optimalValue != null) {
      const p = solution.optimalPoint;
      traces.push({
        x: [p.x1],
        y: [p.x2],
        mode: "markers",
        name: `Óptimo (${p.x1.toFixed(1)}, ${p.x2.toFixed(1)})`,
        marker: { color: "red", size: 14, symbol: "star" },
      });

      const obj = solution.problem.objectiveFunction;
      if (Math.abs(obj.c2) > 1e-10) {
        const xs = linspace(0, XMAX, 500);
        const ys = xs.map(
          (x) => (solution.optimalValue! - obj.c1 * x) / obj.c2
        );
        const valid = xs
          .map((x, i) => ({ x, y: ys[i] }))
          .filter((p) => p.y >= 0 && p.y <= YMAX);
        traces.push({
          x: valid.map((p) => p.x),
          y: valid.map((p) => p.y),
          mode: "lines",
          name: `Función Objetivo (Z = ${solution.optimalValue!.toFixed(1)})`,
          line: { color: "red", width: 2, dash: "dash" },
        });
      }
    }

    const layout = {
      autosize: true,
      height: 520,
      margin: { l: 50, r: 20, t: 40, b: 50 },
      xaxis: {
        title: "X₁",
        range: [0, Math.min((XMAX ?? 50) * 1.3, 200)],
        zeroline: true,
      },
      yaxis: {
        title: "X₂",
        range: [0, Math.min((YMAX ?? 50) * 1.3, 200)],
        zeroline: true,
      },
      title: "Región Factible y Solución Óptima",
      legend: { orientation: "h" as const },
    };
    return { data: traces, layout };
  }, [solution, solver]);

  const resultText = useMemo(() => {
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

    lines.push("=== ANÁLISIS MATEMÁTICO ===");
    lines.push(`Puntos de intersección: ${solution.intersectionPoints.length}`);
    solution.intersectionPoints.slice(0, 10).forEach((p, i) => {
      const feas = solution.feasibleVertices.some(
        (v) => Math.abs(v.x1 - p.x1) < 1e-6 && Math.abs(v.x2 - p.x2) < 1e-6
      );
      lines.push(
        `  ${i + 1}. (${p.x1.toFixed(3)}, ${p.x2.toFixed(3)}) ${
          feas ? "✓" : "✗"
        }`
      );
    });
    if (solution.intersectionPoints.length > 10)
      lines.push(
        `  ... y ${solution.intersectionPoints.length - 10} puntos más`,
        ""
      );

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
    <div className="flex-1 flex flex-col gap-4 relative z-0">
      <div className="w-full bg-white border border-gray-200 rounded shadow-sm p-2">
        <Plot
          data={data}
          layout={layout as any}
          style={{ width: "100%" }}
          config={{ displayModeBar: true }}
        />
      </div>
      <div className="border border-gray-200 rounded p-4 bg-white shadow-sm text-gray-900">
        <div className="font-semibold mb-2 text-gray-900">
          Resultados Detallados
        </div>
        <pre className="whitespace-pre-wrap text-sm">{resultText}</pre>
      </div>
    </div>
  );
}

function calcMax(values?: number[]) {
  if (!values || values.length === 0) return null;
  const m = Math.max(...values);
  return Math.max(m * 1.3, 10);
}
