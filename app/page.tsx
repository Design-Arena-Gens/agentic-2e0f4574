"use client";

import { useMemo, useState } from "react";
import { z } from "zod";
import { PolygonBoard } from "../components/PolygonBoard";
import { polygonArea } from "../lib/geometry";
import { mergeDisjointPolygons } from "../lib/mergePolygons";
import type { Polygon } from "../lib/geometry";

const pointSchema = z.tuple([z.number(), z.number()]);
const polygonSchema = z.array(pointSchema).min(3, "Всеки полигон трябва да има поне три точки.");
const payloadSchema = z
  .array(polygonSchema)
  .min(1, "Нужни са поне два полигона за обединяване.")
  .refine((value) => new Set(value.map((poly) => JSON.stringify(poly))).size === value.length, {
    message: "Полигони с идентични координати трябва да бъдат подадени само веднъж."
  });

const defaultPolygons: number[][][] = [
  [
    [0, 0],
    [36, -4],
    [34, 28],
    [4, 24]
  ],
  [
    [76, 12],
    [96, -6],
    [122, 18],
    [104, 42]
  ],
  [
    [150, 60],
    [188, 50],
    [194, 86],
    [162, 102]
  ]
];

const defaultInput = JSON.stringify(defaultPolygons, null, 2);

function parsePolygons(raw: string): Polygon[] {
  const value = payloadSchema.parse(JSON.parse(raw));
  return value.map((polygon) => polygon.map(([x, y]) => ({ x, y })));
}

export default function Page() {
  const [input, setInput] = useState<string>(defaultInput);
  const [error, setError] = useState<string | null>(null);
  const [polygons, setPolygons] = useState<Polygon[]>(() => parsePolygons(defaultInput));
  const [corridorWidth, setCorridorWidth] = useState<number>(14);

  const mergeResult = useMemo(() => {
    try {
      return mergeDisjointPolygons(polygons, { corridorWidth, minCorridorWidth: 6 });
    } catch (mergeError) {
      console.error(mergeError);
      return { polygon: [], corridors: [], connections: [] };
    }
  }, [corridorWidth, polygons]);

  const handleMerge = () => {
    try {
      const parsed = parsePolygons(input);
      setPolygons(parsed);
      setError(null);
    } catch (parseError) {
      if (parseError instanceof z.ZodError) {
        setError(parseError.issues.map((issue) => issue.message).join("\n"));
      } else if (parseError instanceof SyntaxError) {
        setError("JSON форматът не е валиден.");
      } else {
        setError("Неуспешно парсване на полигони.");
      }
    }
  };

  const resetToDefault = () => {
    setInput(defaultInput);
    setPolygons(parsePolygons(defaultInput));
    setError(null);
  };

  const totalArea = useMemo(() => polygonArea(mergeResult.polygon), [mergeResult.polygon]);

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-6 py-10">
      <header className="space-y-3">
        <h1 className="text-3xl font-semibold text-slate-50">Обединяване на полигони по най-късо разстояние</h1>
        <p className="max-w-3xl text-sm leading-6 text-slate-300">
          Опишете колекция от полигони чрез координати и открийте оптималните коридори, които ги свързват в обща геометрия.
        </p>
      </header>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <div className="flex flex-col gap-4">
          <label className="text-sm font-medium text-slate-200" htmlFor="input">
            Координати на полигони (JSON)
          </label>
          <textarea
            id="input"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            className="h-64 w-full resize-none rounded-lg border border-slate-800 bg-slate-950/80 p-4 font-mono text-xs text-slate-100 focus:border-cyan-400 focus:outline-none"
            spellCheck={false}
          />
          <div className="flex flex-col gap-3 rounded-lg border border-slate-800 bg-slate-900/70 p-4 text-sm text-slate-200">
            <label htmlFor="corridorWidth" className="flex items-center justify-between">
              <span>Ширина на коридорите</span>
              <span className="font-semibold text-cyan-300">{corridorWidth.toFixed(1)}</span>
            </label>
            <input
              id="corridorWidth"
              type="range"
              min={4}
              max={48}
              step={0.5}
              value={corridorWidth}
              onChange={(event) => setCorridorWidth(parseFloat(event.target.value))}
            />
            <p className="text-xs text-slate-400">Регулира ширината на коридора, който свързва най-близките полигони.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleMerge}
              className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow hover:bg-cyan-400"
            >
              Изчисли обединяване
            </button>
            <button
              type="button"
              onClick={resetToDefault}
              className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-300 hover:border-slate-500"
            >
              Зареди пример
            </button>
          </div>
          {error ? (
            <pre className="whitespace-pre-wrap rounded-lg border border-rose-700 bg-rose-950/40 p-3 text-xs text-rose-200">{error}</pre>
          ) : null}

          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 text-sm text-slate-200">
            <h2 className="mb-3 text-base font-semibold text-slate-100">Резюме</h2>
            <p className="text-xs uppercase tracking-wide text-slate-400">Обща площ</p>
            <p className="text-lg font-semibold text-emerald-300">{totalArea.toFixed(2)}</p>
            <p className="mt-3 text-xs uppercase tracking-wide text-slate-400">Коридори</p>
            <ul className="mt-2 space-y-2">
              {mergeResult.corridors.map((corridor, index) => (
                <li key={`${corridor.fromIndex}-${corridor.toIndex}`} className="flex items-center justify-between rounded-lg border border-slate-800 px-3 py-2">
                  <span className="text-xs text-slate-400">#{index + 1} → ({corridor.fromIndex + 1}) към ({corridor.toIndex + 1})</span>
                  <span className="font-mono text-sm text-cyan-300">{corridor.connection.distance.toFixed(2)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <PolygonBoard polygons={polygons} merged={mergeResult.polygon} corridors={mergeResult.corridors} />
      </section>
    </main>
  );
}
