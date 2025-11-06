"use client";

import { useMemo } from "react";
import { computeBounds } from "../lib/bounds";
import { Polygon } from "../lib/geometry";
import { Corridor } from "../lib/mergePolygons";

function toSvgPoints(polygon: Polygon): string {
  return polygon.map((point) => `${point.x},${point.y}`).join(" ");
}

function palette(index: number): string {
  const colors = ["#38bdf8", "#f97316", "#22c55e", "#c084fc", "#facc15"];
  return colors[index % colors.length];
}

type PolygonBoardProps = {
  polygons: Polygon[];
  merged: Polygon | null;
  corridors: Corridor[];
};

export function PolygonBoard({ polygons, merged, corridors }: PolygonBoardProps) {
  const viewBox = useMemo(() => {
    const shapes = [
      ...polygons,
      ...(merged ? [merged] : []),
      ...corridors.map((corridor) => corridor.points)
    ];
    const bounds = computeBounds(shapes);
    const pad = Math.max(bounds.width, bounds.height) * 0.1 + 20;
    const vb = `${bounds.minX - pad} ${bounds.minY - pad} ${bounds.width + pad * 2} ${bounds.height + pad * 2}`;
    return vb;
  }, [corridors, merged, polygons]);

  return (
    <div className="relative flex-1 overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur">
      <svg className="h-full w-full" viewBox={viewBox} aria-label="Визуализация на полигони">
        <rect x="0" y="0" width="100%" height="100%" fill="rgba(15, 23, 42, 0.8)" />
        {corridors.map((corridor, index) => (
          <polygon
            key={`corridor-${corridor.fromIndex}-${corridor.toIndex}`}
            points={toSvgPoints(corridor.points)}
            fill="rgba(250, 204, 21, 0.3)"
            stroke="#facc15"
            strokeWidth={1}
            strokeDasharray="6 4"
          />
        ))}
        {polygons.map((polygon, index) => (
          <polygon
            key={`poly-${index}`}
            points={toSvgPoints(polygon)}
            fill={`${palette(index)}30`}
            stroke={palette(index)}
            strokeWidth={2}
          />
        ))}
        {merged ? (
          <polygon
            points={toSvgPoints(merged)}
            fill="rgba(15, 118, 110, 0.25)"
            stroke="#0f766e"
            strokeWidth={3}
            strokeLinejoin="round"
          />
        ) : null}
      </svg>
    </div>
  );
}
