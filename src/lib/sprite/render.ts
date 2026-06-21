import type { Sprite } from "@/types/sprite";
import { compositeFrame } from "./create";

export interface CanvasView {
  zoom: number;
  panX: number;
  panY: number;
}

export interface RenderOptions {
  showGrid: boolean;
  checkerA: string;
  checkerB: string;
  gridColor: string;
  borderColor: string;
}

const CHECKER_CELL_PX = 8;
const GRID_MIN_ZOOM = 4;

function createBackingCanvas(width: number, height: number): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = width;
  c.height = height;
  return c;
}

interface RenderArgs {
  ctx: CanvasRenderingContext2D;
  cssWidth: number;
  cssHeight: number;
  dpr: number;
  sprite: Sprite;
  view: CanvasView;
  options: RenderOptions;
  backingCanvas: HTMLCanvasElement;
  pixels: Uint32Array;
}

export function render({
  ctx,
  cssWidth,
  cssHeight,
  dpr,
  sprite,
  view,
  options,
  backingCanvas,
  pixels,
}: RenderArgs): void {
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, cssWidth, cssHeight);

  const drawW = sprite.width * view.zoom;
  const drawH = sprite.height * view.zoom;
  const drawX = view.panX;
  const drawY = view.panY;

  drawChecker(ctx, drawX, drawY, drawW, drawH, options);
  drawPixels(ctx, backingCanvas, pixels, sprite.width, sprite.height, drawX, drawY, drawW, drawH);

  if (options.showGrid && view.zoom >= GRID_MIN_ZOOM) {
    drawGrid(ctx, drawX, drawY, view.zoom, sprite.width, sprite.height, options.gridColor);
  }

  drawBorder(ctx, drawX, drawY, drawW, drawH, options.borderColor);
}

function drawChecker(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  options: RenderOptions,
): void {
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  ctx.fillStyle = options.checkerA;
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = options.checkerB;
  const cell = CHECKER_CELL_PX;
  const cols = Math.ceil(w / cell);
  const rows = Math.ceil(h / cell);
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if ((row + col) % 2 === 0) continue;
      ctx.fillRect(x + col * cell, y + row * cell, cell, cell);
    }
  }
  ctx.restore();
}

function drawPixels(
  ctx: CanvasRenderingContext2D,
  backing: HTMLCanvasElement,
  pixels: Uint32Array,
  spriteW: number,
  spriteH: number,
  x: number,
  y: number,
  w: number,
  h: number,
): void {
  const bctx = backing.getContext("2d");
  if (!bctx) return;
  const u8 = new Uint8ClampedArray(
    pixels.buffer as ArrayBuffer,
    pixels.byteOffset,
    pixels.byteLength,
  );
  const img = new ImageData(u8, spriteW, spriteH);
  bctx.putImageData(img, 0, 0);

  const prev = ctx.imageSmoothingEnabled;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(backing, x, y, w, h);
  ctx.imageSmoothingEnabled = prev;
}

function drawGrid(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  zoom: number,
  spriteW: number,
  spriteH: number,
  color: string,
): void {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let i = 1; i < spriteW; i++) {
    const lx = Math.round(x + i * zoom) + 0.5;
    ctx.moveTo(lx, y);
    ctx.lineTo(lx, y + spriteH * zoom);
  }
  for (let j = 1; j < spriteH; j++) {
    const ly = Math.round(y + j * zoom) + 0.5;
    ctx.moveTo(x, ly);
    ctx.lineTo(x + spriteW * zoom, ly);
  }
  ctx.stroke();
  ctx.restore();
}

function drawBorder(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string,
): void {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.strokeRect(Math.round(x) - 0.5, Math.round(y) - 0.5, Math.round(w) + 1, Math.round(h) + 1);
  ctx.restore();
}

export function compositePixels(sprite: Sprite): Uint32Array {
  return compositeFrame(sprite, sprite.activeFrameIndex);
}

export { createBackingCanvas };
