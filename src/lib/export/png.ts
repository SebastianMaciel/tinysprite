import type { Sprite } from "@/types/sprite";
import { compositePixels } from "@/lib/sprite/render";

async function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("canvas.toBlob returned null"));
    }, "image/png");
  });
}

export async function exportPng(sprite: Sprite, scale: number): Promise<Blob> {
  if (typeof document === "undefined") {
    throw new Error("exportPng must run in browser");
  }
  const s = Math.max(1, Math.floor(scale));

  const backing = document.createElement("canvas");
  backing.width = sprite.width;
  backing.height = sprite.height;
  const bctx = backing.getContext("2d");
  if (!bctx) throw new Error("could not get 2d context");

  const pixels = compositePixels(sprite);
  const u8 = new Uint8ClampedArray(
    pixels.buffer as ArrayBuffer,
    pixels.byteOffset,
    pixels.byteLength,
  );
  bctx.putImageData(new ImageData(u8, sprite.width, sprite.height), 0, 0);

  if (s === 1) {
    return canvasToBlob(backing);
  }

  const out = document.createElement("canvas");
  out.width = sprite.width * s;
  out.height = sprite.height * s;
  const ctx = out.getContext("2d");
  if (!ctx) throw new Error("could not get 2d context");
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(backing, 0, 0, out.width, out.height);
  return canvasToBlob(out);
}
