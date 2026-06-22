import type { Color, Frame, Layer, Sprite } from "@/types/sprite";
import { MAX_SPRITE_SIZE, MIN_SPRITE_SIZE } from "@/types/sprite";

const SERIALIZATION_VERSION = 1;

interface SerializedLayer {
  id: string;
  name: string;
  visible: boolean;
  opacity: number;
  pixels: string;
}

interface SerializedFrame {
  id: string;
  layers: SerializedLayer[];
  durationMs: number;
}

export interface SerializedSprite {
  v: number;
  id: string;
  name: string;
  width: number;
  height: number;
  palette: Color[];
  frames: SerializedFrame[];
  activeFrameIndex: number;
}

export interface SerializedEditorState {
  v: number;
  sprite: SerializedSprite;
  customColors: Color[];
  activeColor: Color;
}

function uint32ToBase64(u32: Uint32Array): string {
  const u8 = new Uint8Array(u32.buffer as ArrayBuffer, u32.byteOffset, u32.byteLength);
  let bin = "";
  for (let i = 0; i < u8.length; i++) bin += String.fromCharCode(u8[i]);
  return btoa(bin);
}

function base64ToUint32(b64: string): Uint32Array {
  const bin = atob(b64);
  const u8 = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
  return new Uint32Array(u8.buffer);
}

export function serializeSprite(sprite: Sprite): SerializedSprite {
  return {
    v: SERIALIZATION_VERSION,
    id: sprite.id,
    name: sprite.name,
    width: sprite.width,
    height: sprite.height,
    palette: [...sprite.palette],
    activeFrameIndex: sprite.activeFrameIndex,
    frames: sprite.frames.map(
      (f): SerializedFrame => ({
        id: f.id,
        durationMs: f.durationMs,
        layers: f.layers.map(
          (l): SerializedLayer => ({
            id: l.id,
            name: l.name,
            visible: l.visible,
            opacity: l.opacity,
            pixels: uint32ToBase64(l.pixels),
          }),
        ),
      }),
    ),
  };
}

function isPlainObject(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null && !Array.isArray(x);
}

function validateLayer(raw: unknown, expectedSize: number): Layer | null {
  if (!isPlainObject(raw)) return null;
  if (typeof raw.id !== "string" || typeof raw.name !== "string") return null;
  if (typeof raw.visible !== "boolean" || typeof raw.opacity !== "number") return null;
  if (typeof raw.pixels !== "string") return null;
  try {
    const pixels = base64ToUint32(raw.pixels);
    if (pixels.length !== expectedSize) return null;
    return {
      id: raw.id,
      name: raw.name,
      visible: raw.visible,
      opacity: raw.opacity,
      pixels,
    };
  } catch {
    return null;
  }
}

function validateFrame(raw: unknown, expectedPixelCount: number): Frame | null {
  if (!isPlainObject(raw)) return null;
  if (typeof raw.id !== "string" || typeof raw.durationMs !== "number") return null;
  if (!Array.isArray(raw.layers) || raw.layers.length === 0) return null;
  const layers: Layer[] = [];
  for (const l of raw.layers) {
    const layer = validateLayer(l, expectedPixelCount);
    if (!layer) return null;
    layers.push(layer);
  }
  return { id: raw.id, durationMs: raw.durationMs, layers };
}

export function deserializeSprite(raw: unknown): Sprite | null {
  if (!isPlainObject(raw)) return null;
  if (raw.v !== SERIALIZATION_VERSION) return null;
  if (typeof raw.id !== "string" || typeof raw.name !== "string") return null;
  if (typeof raw.width !== "number" || typeof raw.height !== "number") return null;
  if (raw.width < MIN_SPRITE_SIZE || raw.width > MAX_SPRITE_SIZE) return null;
  if (raw.height < MIN_SPRITE_SIZE || raw.height > MAX_SPRITE_SIZE) return null;
  if (!Number.isInteger(raw.width) || !Number.isInteger(raw.height)) return null;
  if (!Array.isArray(raw.palette)) return null;
  if (typeof raw.activeFrameIndex !== "number") return null;
  if (!Array.isArray(raw.frames) || raw.frames.length === 0) return null;

  const pixelCount = raw.width * raw.height;
  const frames: Frame[] = [];
  for (const f of raw.frames) {
    const frame = validateFrame(f, pixelCount);
    if (!frame) return null;
    frames.push(frame);
  }

  return {
    id: raw.id,
    name: raw.name,
    width: raw.width,
    height: raw.height,
    palette: raw.palette as Color[],
    frames,
    activeFrameIndex: Math.max(0, Math.min(frames.length - 1, raw.activeFrameIndex)),
  };
}

export { SERIALIZATION_VERSION };
