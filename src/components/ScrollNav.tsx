"use client";
import { useEffect, useState } from "react";

type Item = { id: string; label: string };

const items: Item[] = [
  { id: "section-problem", label: "Datos" },
  { id: "section-graph", label: "Gráfico" },
  { id: "section-results", label: "Resultados" },
];

export default function ScrollNav() {
  const [active, setActive] = useState<string>(items[0].id);

  useEffect(() => {
    const handler = () => {
      let current = active;
      items.forEach((it) => {
        const el = document.getElementById(it.id);
        if (!el) return;
        const rect = el.getBoundingClientRect();
        if (rect.top <= 120 && rect.bottom >= 120) current = it.id;
      });
      setActive(current);
    };
    window.addEventListener("scroll", handler, { passive: true } as any);
    handler();
    return () => window.removeEventListener("scroll", handler as any);
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    window.scrollTo({ top: el.offsetTop - 12, behavior: "smooth" });
  };

  return (
    <nav className="hidden sm:block fixed left-3 top-1/2 -translate-y-1/2 z-50">
      <ul className="flex flex-col gap-2 opacity-80 hover:opacity-100 transition">
        {items.map((it) => (
          <li key={it.id}>
            <button
              onClick={() => scrollTo(it.id)}
              className={`px-2 py-1 rounded-full shadow-md border text-xs bg-white hover:bg-gray-50 transition ${
                active === it.id
                  ? "border-blue-500 text-blue-600"
                  : "border-gray-300 text-gray-700"
              }`}
              aria-label={`Ir a ${it.label}`}
            >
              {it.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
