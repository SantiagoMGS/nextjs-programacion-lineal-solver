import {
  Constraint,
  InequalityType,
  LinearProgrammingProblem,
  Point,
  Solution,
  VertexEvaluation,
  evalObjective,
  constraintSatisfied,
} from "./models";

export class LinearProgrammingSolver {
  constructor(private tolerance = 1e-10) {}

  solve(problem: LinearProgrammingProblem): Solution {
    const p: LinearProgrammingProblem = {
      ...problem,
      constraints: this.addNonNegativity(problem.constraints),
    };

    const intersections = this.calculateIntersections(p.constraints);
    const feasibleVertices = intersections
      .filter((pt) =>
        p.constraints.every((c) =>
          constraintSatisfied(c, pt.x1, pt.x2, this.tolerance)
        )
      )
      .filter(this.uniqueWithTolerance());

    const vertexEvaluations: VertexEvaluation[] = feasibleVertices.map(
      (pt) => ({
        point: pt,
        objectiveValue: evalObjective(p.objectiveFunction, pt.x1, pt.x2),
        isFeasible: true,
      })
    );

    const { optimalPoint, optimalValue } = this.findOptimal(
      vertexEvaluations,
      p
    );
    return {
      problem: p,
      intersectionPoints: intersections,
      feasibleVertices,
      vertexEvaluations,
      optimalPoint,
      optimalValue,
      isFeasible: feasibleVertices.length > 0,
    };
  }

  getConstraintLinePoints(
    constraint: Constraint,
    xMin = 0,
    xMax = 50,
    n = 1000
  ) {
    const xs = Array.from(
      { length: n },
      (_, i) => xMin + (i * (xMax - xMin)) / (n - 1)
    );
    if (Math.abs(constraint.a2) < this.tolerance) {
      if (Math.abs(constraint.a1) > this.tolerance) {
        const xLine = constraint.b / constraint.a1;
        const X = xs.map(() => xLine);
        return { x: X, y: xs };
      }
      return { x: xs, y: xs.map(() => 0) };
    } else {
      const ys = xs.map(
        (x) => (constraint.b - constraint.a1 * x) / constraint.a2
      );
      return { x: xs, y: ys };
    }
  }

  private addNonNegativity(constraints: Constraint[]): Constraint[] {
    const hasX1 = constraints.some(
      (c) => c.a1 === 1 && c.a2 === 0 && c.inequalityType === "≥" && c.b === 0
    );
    const hasX2 = constraints.some(
      (c) => c.a1 === 0 && c.a2 === 1 && c.inequalityType === "≥" && c.b === 0
    );
    const base = [...constraints];
    if (!hasX1)
      base.push({ a1: 1, a2: 0, inequalityType: "≥" as InequalityType, b: 0 });
    if (!hasX2)
      base.push({ a1: 0, a2: 1, inequalityType: "≥" as InequalityType, b: 0 });
    return base;
  }

  private calculateIntersections(constraints: Constraint[]): Point[] {
    const matrixForm = constraints.map((c) =>
      c.inequalityType === "≥"
        ? { a1: -c.a1, a2: -c.a2, b: -c.b }
        : { a1: c.a1, a2: c.a2, b: c.b }
    );
    const pts: Point[] = [];
    for (let i = 0; i < matrixForm.length; i++) {
      for (let j = i + 1; j < matrixForm.length; j++) {
        const p = this.solve2x2(matrixForm[i], matrixForm[j]);
        if (p) pts.push(p);
      }
    }
    return pts;
  }

  private solve2x2(
    eq1: { a1: number; a2: number; b: number },
    eq2: { a1: number; a2: number; b: number }
  ): Point | null {
    const { a1, a2, b } = eq1;
    const { a1: c1, a2: c2, b: d } = eq2;
    const det = a1 * c2 - c1 * a2;
    if (Math.abs(det) < this.tolerance) return null;
    const x1 = (b * c2 - d * a2) / det;
    const x2 = (a1 * d - c1 * b) / det;
    return { x1, x2 };
  }

  private findOptimal(
    evals: VertexEvaluation[],
    problem: LinearProgrammingProblem
  ) {
    if (evals.length === 0) return { optimalPoint: null, optimalValue: null };
    const opt =
      problem.objectiveFunction.optimizationType === "maximizar"
        ? evals.reduce((a, b) => (b.objectiveValue > a.objectiveValue ? b : a))
        : evals.reduce((a, b) => (b.objectiveValue < a.objectiveValue ? b : a));
    return { optimalPoint: opt.point, optimalValue: opt.objectiveValue };
  }

  private uniqueWithTolerance(tol = 1e-6) {
    const seen = new Set<string>();
    return (p: Point) => {
      const key = `${Math.round(p.x1 / tol)}:${Math.round(p.x2 / tol)}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    };
  }
}

export const isNonNegativity = (c: Constraint) =>
  ((c.a1 === 1 && c.a2 === 0) || (c.a1 === 0 && c.a2 === 1)) && c.b === 0;

export const constraintLabel = (c: Constraint) =>
  `${c.a1.toFixed(0)}X₁ + ${c.a2.toFixed(0)}X₂ ${
    c.inequalityType
  } ${c.b.toFixed(0)}`;

export function linspace(min: number, max: number, n: number) {
  return Array.from({ length: n }, (_, i) => min + (i * (max - min)) / (n - 1));
}

export function hexWithAlpha(hex: string, alpha: number) {
  const a = Math.round(alpha * 255)
    .toString(16)
    .padStart(2, "0");
  const clean = hex.replace("#", "");
  return `#${clean}${a}`;
}

export const COLORS = [
  "#ef4444",
  "#3b82f6",
  "#22c55e",
  "#f97316",
  "#a855f7",
  "#8b5cf6",
  "#f43f5e",
  "#6b7280",
];
