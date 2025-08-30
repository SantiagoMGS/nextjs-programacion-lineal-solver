export type OptimizationType = "maximizar" | "minimizar";
export type InequalityType = "≤" | "≥" | "=";

export interface Constraint {
  a1: number;
  a2: number;
  inequalityType: InequalityType;
  b: number;
}

export interface ObjectiveFunction {
  c1: number;
  c2: number;
  optimizationType: OptimizationType;
}

export interface LinearProgrammingProblem {
  objectiveFunction: ObjectiveFunction;
  constraints: Constraint[];
}

export interface Point {
  x1: number;
  x2: number;
}

export interface VertexEvaluation {
  point: Point;
  objectiveValue: number;
  isFeasible: boolean;
}

export interface Solution {
  problem: LinearProgrammingProblem;
  intersectionPoints: Point[];
  feasibleVertices: Point[];
  vertexEvaluations: VertexEvaluation[];
  optimalPoint?: Point | null;
  optimalValue?: number | null;
  isFeasible: boolean;
}

export const evalObjective = (obj: ObjectiveFunction, x1: number, x2: number) =>
  obj.c1 * x1 + obj.c2 * x2;

export const evalConstraint = (c: Constraint, x1: number, x2: number) =>
  c.a1 * x1 + c.a2 * x2;

export const constraintSatisfied = (
  c: Constraint,
  x1: number,
  x2: number,
  tol = 1e-10
) => {
  const v = evalConstraint(c, x1, x2);
  if (c.inequalityType === "≤") return v <= c.b + tol;
  if (c.inequalityType === "≥") return v >= c.b - tol;
  return Math.abs(v - c.b) <= tol;
};
