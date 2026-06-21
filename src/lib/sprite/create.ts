import type { Color, Frame, Layer, Sprite } from "@/types/sprite";
import { MAX_SPRITE_SIZE, MIN_SPRITE_SIZE, TRANSPARENT } from "@/types/sprite";
import { hexToColor } from "./color";

const COZY_PALETTE: Color[] = [
  hexToColor("#4a3b47"),
  hexToColor("#7a6a6e"),
  hexToColor("#d89ba0"),
  hexToColor("#8eaa7f"),
  hexToColor("#d8a888"),
  hexToColor("#a890c8"),
  hexToColor("#faf3e7"),
  hexToColor("#ffffff"),
];

function randomId(): string {
  return Math.random().toString(36).slice(2, 10);
}

export function createLayer(width: number, height: number, name = "layer 1"): Layer {
  return {
    id: randomId(),
    name,
    visible: true,
    opacity: 1,
    pixels: new Uint32Array(width * height),
  };
}

export function createFrame(width: number, height: number, durationMs = 100): Frame {
  return {
    id: randomId(),
    layers: [createLayer(width, height)],
    durationMs,
  };
}

export function createSprite(
  width: number,
  height: number,
  name = "untitled",
): Sprite {
  if (
    !Number.isInteger(width) ||
    !Number.isInteger(height) ||
    width < MIN_SPRITE_SIZE ||
    height < MIN_SPRITE_SIZE ||
    width > MAX_SPRITE_SIZE ||
    height > MAX_SPRITE_SIZE
  ) {
    throw new Error(
      `createSprite: width and height must be integers in [${MIN_SPRITE_SIZE}, ${MAX_SPRITE_SIZE}]`,
    );
  }
  return {
    id: randomId(),
    name,
    width,
    height,
    palette: [...COZY_PALETTE],
    frames: [createFrame(width, height)],
    activeFrameIndex: 0,
  };
}

export function activeFrame(sprite: Sprite): Frame {
  return sprite.frames[sprite.activeFrameIndex] ?? sprite.frames[0];
}

export function compositeFrame(sprite: Sprite, frameIndex: number): Uint32Array {
  const frame = sprite.frames[frameIndex];
  const out = new Uint32Array(sprite.width * sprite.height);
  if (!frame) return out;

  for (const layer of frame.layers) {
    if (!layer.visible) continue;
    const px = layer.pixels;
    for (let i = 0; i < px.length; i++) {
      const c = px[i];
      const a = (c >>> 24) & 0xff;
      if (a === 0) continue;
      if (a === 255 && layer.opacity === 1) {
        out[i] = c;
        continue;
      }
      const layerA = (a / 255) * layer.opacity;
      const dstC = out[i];
      const dstA = ((dstC >>> 24) & 0xff) / 255;
      const outA = layerA + dstA * (1 - layerA);
      if (outA === 0) {
        out[i] = 0;
        continue;
      }
      const blend = (src: number, dst: number) =>
        Math.round((src * layerA + dst * dstA * (1 - layerA)) / outA);
      const r = blend(c & 0xff, dstC & 0xff);
      const g = blend((c >>> 8) & 0xff, (dstC >>> 8) & 0xff);
      const b = blend((c >>> 16) & 0xff, (dstC >>> 16) & 0xff);
      out[i] =
        (((Math.round(outA * 255) & 0xff) << 24) |
          ((b & 0xff) << 16) |
          ((g & 0xff) << 8) |
          (r & 0xff)) >>>
        0;
    }
  }
  return out;
}

export { TRANSPARENT };
