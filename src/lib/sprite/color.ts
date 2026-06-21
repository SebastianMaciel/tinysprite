import type { Color } from "@/types/sprite";

export function packColor(r: number, g: number, b: number, a = 255): Color {
  return (
    ((a & 0xff) << 24) |
    ((b & 0xff) << 16) |
    ((g & 0xff) << 8) |
    (r & 0xff)
  ) >>> 0;
}

export function unpackColor(c: Color): [number, number, number, number] {
  return [c & 0xff, (c >>> 8) & 0xff, (c >>> 16) & 0xff, (c >>> 24) & 0xff];
}

export function hexToColor(hex: string, alpha = 255): Color {
  const h = hex.replace(/^#/, "");
  if (h.length !== 6 && h.length !== 8) {
    throw new Error(`hexToColor: invalid hex ${hex}`);
  }
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  const a = h.length === 8 ? parseInt(h.slice(6, 8), 16) : alpha;
  return packColor(r, g, b, a);
}

export function colorToHex(c: Color): string {
  const [r, g, b, a] = unpackColor(c);
  const hex = (n: number) => n.toString(16).padStart(2, "0");
  return a === 255 ? `#${hex(r)}${hex(g)}${hex(b)}` : `#${hex(r)}${hex(g)}${hex(b)}${hex(a)}`;
}

export function colorToCss(c: Color): string {
  const [r, g, b, a] = unpackColor(c);
  if (a === 0) return "transparent";
  if (a === 255) return `rgb(${r}, ${g}, ${b})`;
  return `rgba(${r}, ${g}, ${b}, ${(a / 255).toFixed(3)})`;
}

export function isTransparent(c: Color): boolean {
  return ((c >>> 24) & 0xff) === 0;
}
