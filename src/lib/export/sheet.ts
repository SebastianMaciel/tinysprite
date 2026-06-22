import type { Sprite } from "@/types/sprite";
import { compositeFrame } from "@/lib/sprite/create";

async function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("canvas.toBlob returned null"));
    }, "image/png");
  });
}

/**
 * Sprite sheet: all frames arranged in a horizontal strip.
 * For single-frame sprites this is identical to exportPng. The strip
 * layout becomes meaningful once animation frames are added.
 */
export async function exportSheet(sprite: Sprite, scale: number): Promise<Blob> {
  if (typeof document === "undefined") {
    throw new Error("exportSheet must run in browser");
  }
  const s = Math.max(1, Math.floor(scale));
  const tileW = sprite.width;
  const tileH = sprite.height;
  const frameCount = sprite.frames.length;

  const backing = document.createElement("canvas");
  backing.width = tileW * frameCount;
  backing.height = tileH;
  const bctx = backing.getContext("2d");
  if (!bctx) throw new Error("could not get 2d context");

  for (let i = 0; i < frameCount; i++) {
    const pixels = compositeFrame(sprite, i);
    const u8 = new Uint8ClampedArray(
      pixels.buffer as ArrayBuffer,
      pixels.byteOffset,
      pixels.byteLength,
    );
    bctx.putImageData(new ImageData(u8, tileW, tileH), i * tileW, 0);
  }

  if (s === 1) {
    return canvasToBlob(backing);
  }

  const out = document.createElement("canvas");
  out.width = backing.width * s;
  out.height = backing.height * s;
  const ctx = out.getContext("2d");
  if (!ctx) throw new Error("could not get 2d context");
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(backing, 0, 0, out.width, out.height);
  return canvasToBlob(out);
}
