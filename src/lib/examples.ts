import { LinearProgrammingProblem } from "./models";

export const exampleStartup: LinearProgrammingProblem = {
  objectiveFunction: { c1: 250, c2: 300, optimizationType: "maximizar" },
  constraints: [
    { a1: 20, a2: 15, inequalityType: "≤", b: 600 },
    { a1: 10, a2: 15, inequalityType: "≤", b: 450 },
  ],
};

export const exampleProduction: LinearProgrammingProblem = {
  objectiveFunction: { c1: 400, c2: 300, optimizationType: "maximizar" },
  constraints: [
    { a1: 2, a2: 1, inequalityType: "≤", b: 100 },
    { a1: 1, a2: 2, inequalityType: "≤", b: 80 },
  ],
};

export const exampleMix: LinearProgrammingProblem = {
  objectiveFunction: { c1: 20, c2: 30, optimizationType: "minimizar" },
  constraints: [
    { a1: 1, a2: 1, inequalityType: "≥", b: 40 },
    { a1: 2, a2: 1, inequalityType: "≤", b: 80 },
  ],
};
