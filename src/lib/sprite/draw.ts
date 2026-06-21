import type { Color } from "@/types/sprite";

export function paintPixel(
  pixels: Uint32Array,
  width: number,
  height: number,
  x: number,
  y: number,
  color: Color,
): boolean {
  if (x < 0 || y < 0 || x >= width || y >= height) return false;
  const idx = y * width + x;
  if (pixels[idx] === color) return false;
  pixels[idx] = color;
  return true;
}

/**
 * Bresenham line. Paints every pixel between (x0,y0) and (x1,y1) inclusive.
 * Returns true if any pixel actually changed.
 */
export function paintLine(
  pixels: Uint32Array,
  width: number,
  height: number,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  color: Color,
): boolean {
  let changed = false;
  let x = x0;
  let y = y0;
  const dx = Math.abs(x1 - x0);
  const dy = -Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx + dy;
  while (true) {
    if (paintPixel(pixels, width, height, x, y, color)) changed = true;
    if (x === x1 && y === y1) break;
    const e2 = 2 * err;
    if (e2 >= dy) {
      err += dy;
      x += sx;
    }
    if (e2 <= dx) {
      err += dx;
      y += sy;
    }
  }
  return changed;
}
