"use client";
/* eslint @typescript-eslint/no-explicit-any: "off" */
import { useState } from "react";
import {
  Constraint,
  InequalityType,
  LinearProgrammingProblem,
  ObjectiveFunction,
  OptimizationType,
} from "@/lib/models";
import { exampleStartup, exampleProduction, exampleMix } from "@/lib/examples";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Props = {
  onSolve: (p: LinearProgrammingProblem) => void;
};

export default function InputPanel({ onSolve }: Props) {
  const [optimizationType, setOpt] = useState<OptimizationType>("maximizar");
  const [c1, setC1] = useState("250");
  const [c2, setC2] = useState("300");
  const [constraints, setConstraints] = useState<
    Array<{ a1: string; a2: string; ineq: InequalityType; b: string }>
  >([
    { a1: "20", a2: "15", ineq: "≤", b: "600" },
    { a1: "10", a2: "15", ineq: "≤", b: "450" },
  ]);

  const addConstraint = () =>
    setConstraints((cs) => [...cs, { a1: "0", a2: "0", ineq: "≤", b: "0" }]);
  const removeConstraint = (i: number) =>
    setConstraints((cs) => cs.filter((_, idx) => idx !== i));

  const toProblem = (): LinearProgrammingProblem => {
    const obj: ObjectiveFunction = {
      c1: parseFloat(c1),
      c2: parseFloat(c2),
      optimizationType,
    };
    const cons: Constraint[] = constraints.map((c) => ({
      a1: parseFloat(c.a1),
      a2: parseFloat(c.a2),
      inequalityType: c.ineq,
      b: parseFloat(c.b),
    }));
    if (!cons.length) throw new Error("Debe ingresar al menos una restricción");
    if ([c1, c2].some((v) => v.trim() === "" || isNaN(Number(v))))
      throw new Error("Coeficientes de Z inválidos");
    return { objectiveFunction: obj, constraints: cons };
  };

  const handleSolve = () => {
    try {
      onSolve(toProblem());
      // Desplazar suavemente hacia el gráfico
      setTimeout(() => {
        const el = document.getElementById("section-graph");
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 50);
    } catch (e: any) {
      alert(e.message ?? "Error en los datos");
    }
  };

  const applyProblem = (p: LinearProgrammingProblem) => {
    setOpt(p.objectiveFunction.optimizationType);
    setC1(String(p.objectiveFunction.c1));
    setC2(String(p.objectiveFunction.c2));
    setConstraints(
      p.constraints.map((c) => ({
        a1: String(c.a1),
        a2: String(c.a2),
        ineq: c.inequalityType,
        b: String(c.b),
      }))
    );
    onSolve(p);
    setTimeout(() => {
      const el = document.getElementById("section-graph");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }, 50);
  };

  return (
    <Card className="w-full relative z-10">
      <CardHeader>
        <CardTitle>Datos del Problema</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="font-semibold text-gray-900">Función Objetivo</div>
        <div className="mb-2">
          <label className="block text-sm text-gray-700">Tipo</label>
          <select
            value={optimizationType}
            onChange={(e) => setOpt(e.target.value as OptimizationType)}
            className="border px-2 py-1 w-full"
          >
            <option value="maximizar">maximizar</option>
            <option value="minimizar">minimizar</option>
          </select>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span>Z =</span>
          <input
            value={c1}
            onChange={(e) => setC1(e.target.value)}
            className="border w-20 px-2 py-1 flex-shrink-0"
          />
          <span>*X₁ +</span>
          <input
            value={c2}
            onChange={(e) => setC2(e.target.value)}
            className="border w-20 px-2 py-1 flex-shrink-0"
          />
          <span>*X₂</span>
        </div>
        <div className="font-semibold text-gray-900">Restricciones</div>
        <div className="space-y-3 max-h-[340px] overflow-auto pr-1">
          {constraints.map((c, i) => (
            <div
              key={i}
              className="grid grid-cols-[1fr_auto_1fr_auto_1fr_auto_auto] gap-2 items-center"
            >
              <input
                value={c.a1}
                onChange={(e) => {
                  const v = e.target.value;
                  setConstraints((cs) =>
                    cs.map((x, idx) => (idx === i ? { ...x, a1: v } : x))
                  );
                }}
                className="border px-2 py-1"
              />
              <span>*X₁ +</span>
              <input
                value={c.a2}
                onChange={(e) => {
                  const v = e.target.value;
                  setConstraints((cs) =>
                    cs.map((x, idx) => (idx === i ? { ...x, a2: v } : x))
                  );
                }}
                className="border px-2 py-1"
              />
              <span>*X₂</span>
              <select
                value={c.ineq}
                onChange={(e) => {
                  const v = e.target.value as InequalityType;
                  setConstraints((cs) =>
                    cs.map((x, idx) => (idx === i ? { ...x, ineq: v } : x))
                  );
                }}
                className="border px-2 py-1"
              >
                <option value="≤">≤</option>
                <option value="≥">≥</option>
                <option value="=">=</option>
              </select>
              <input
                value={c.b}
                onChange={(e) => {
                  const v = e.target.value;
                  setConstraints((cs) =>
                    cs.map((x, idx) => (idx === i ? { ...x, b: v } : x))
                  );
                }}
                className="border px-2 py-1"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => removeConstraint(i)}
              >
                ✕
              </Button>
            </div>
          ))}
        </div>
        <div className="mt-2 flex gap-2">
          <Button variant="outline" onClick={addConstraint}>
            Agregar Restricción
          </Button>
          <Button variant="outline" onClick={() => setConstraints([])}>
            Limpiar Todo
          </Button>
        </div>
        <Button className="w-full" onClick={handleSolve}>
          RESOLVER PROBLEMA
        </Button>

        <div className="flex flex-wrap gap-2 pt-1">
          <Button
            variant="outline"
            onClick={() => applyProblem(exampleStartup)}
          >
            Startup
          </Button>
          <Button
            variant="outline"
            onClick={() => applyProblem(exampleProduction)}
          >
            Producción
          </Button>
          <Button variant="outline" onClick={() => applyProblem(exampleMix)}>
            Mezcla
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
