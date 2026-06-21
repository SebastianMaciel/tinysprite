/**
 * RGBA packed in a single 32-bit integer. Little-endian byte order
 * matches the in-memory layout of ImageData so a Uint32Array can be
 * reinterpreted as a Uint8ClampedArray without copying.
 *
 * As Uint32: 0xAABBGGRR
 * Byte 0 = R, byte 1 = G, byte 2 = B, byte 3 = A
 */
export type Color = number;

export const TRANSPARENT: Color = 0x00000000;

export interface Layer {
  id: string;
  name: string;
  visible: boolean;
  opacity: number;
  pixels: Uint32Array;
}

export interface Frame {
  id: string;
  layers: Layer[];
  durationMs: number;
}

export interface Sprite {
  id: string;
  name: string;
  width: number;
  height: number;
  palette: Color[];
  frames: Frame[];
  activeFrameIndex: number;
}

export const MAX_SPRITE_SIZE = 128;
export const MIN_SPRITE_SIZE = 1;
export const SIZE_PRESETS = [8, 16, 32, 64] as const;
