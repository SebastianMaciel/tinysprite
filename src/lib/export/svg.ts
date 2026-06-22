import type { Sprite } from "@/types/sprite";
import { compositePixels } from "@/lib/sprite/render";

function colorToFill(c: number): string {
  const r = c & 0xff;
  const g = (c >>> 8) & 0xff;
  const b = (c >>> 16) & 0xff;
  const a = (c >>> 24) & 0xff;
  if (a === 255) return `rgb(${r},${g},${b})`;
  return `rgba(${r},${g},${b},${(a / 255).toFixed(3)})`;
}

/**
 * Run-length encode horizontal runs of the same color per row. Reduces
 * the number of <rect> elements significantly for sprites with flat
 * areas (which is most pixel art).
 */
export function exportSvg(sprite: Sprite): string {
  const w = sprite.width;
  const h = sprite.height;
  const pixels = compositePixels(sprite);
  const rects: string[] = [];

  for (let y = 0; y < h; y++) {
    let runStart = 0;
    let runColor = pixels[y * w];
    for (let x = 1; x <= w; x++) {
      const c = x < w ? pixels[y * w + x] : -1;
      if (c !== runColor) {
        const alpha = (runColor >>> 24) & 0xff;
        if (alpha !== 0) {
          const length = x - runStart;
          rects.push(
            `<rect x="${runStart}" y="${y}" width="${length}" height="1" fill="${colorToFill(runColor)}"/>`,
          );
        }
        runStart = x;
        runColor = c;
      }
    }
  }

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" ` +
    `width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" ` +
    `shape-rendering="crispEdges">` +
    rects.join("") +
    `</svg>`
  );
}
