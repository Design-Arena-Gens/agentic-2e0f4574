declare module "polygon-clipping" {
  export type Pair = [number, number];
  export type Ring = Pair[];
  export type Polygon = Ring[];
  export type MultiPolygon = Polygon[];
  export function union(...geom: (Polygon | MultiPolygon)[]): MultiPolygon;
  const martinez: {
    union: typeof union;
  };
  export default martinez;
}
