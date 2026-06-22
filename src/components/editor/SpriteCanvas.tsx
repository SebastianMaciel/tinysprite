"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Sprite } from "@/types/sprite";
import type { View } from "@/hooks/useCanvasView";
import { useTheme } from "@/hooks/useTheme";
import { compositePixels, createBackingCanvas, render } from "@/lib/sprite/render";
import styles from "./SpriteCanvas.module.css";

interface Props {
  sprite: Sprite;
  view: View;
  dpr: number;
  containerSize: { w: number; h: number };
  showGrid: boolean;
  isSpaceDown: boolean;
  canPan: boolean;
  onWheel: (dir: 1 | -1, cursorX: number, cursorY: number) => void;
  onPan: (dx: number, dy: number) => void;
  onPaintStart: (x: number, y: number) => void;
  onPaintMove: (fromX: number, fromY: number, toX: number, toY: number) => void;
  onPaintEnd: () => void;
}

interface DragState {
  pointerId: number;
  mode: "pan" | "brush";
  lastClientX: number;
  lastClientY: number;
  lastSpriteX: number;
  lastSpriteY: number;
}

function readThemeColors() {
  const cs = getComputedStyle(document.documentElement);
  const v = (name: string, fallback: string) => {
    const val = cs.getPropertyValue(name).trim();
    return val || fallback;
  };
  return {
    checkerA: v("--canvas-checker-a", "#f0e8da"),
    checkerB: v("--canvas-checker-b", "#faf3e7"),
    gridColor: v("--grid-line", "rgba(74,59,71,0.18)"),
    borderColor: v("--border-strong", "#c9b69a"),
  };
}

function clientToSprite(
  clientX: number,
  clientY: number,
  rect: DOMRect,
  view: View,
) {
  const cssX = clientX - rect.left;
  const cssY = clientY - rect.top;
  return {
    x: Math.floor((cssX - view.panX) / view.zoom),
    y: Math.floor((cssY - view.panY) / view.zoom),
  };
}

export function SpriteCanvas({
  sprite,
  view,
  dpr,
  containerSize,
  showGrid,
  isSpaceDown,
  canPan,
  onWheel,
  onPan,
  onPaintStart,
  onPaintMove,
  onPaintEnd,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isPainting, setIsPainting] = useState(false);
  const dragRef = useRef<DragState | null>(null);
  const { theme } = useTheme();

  const backingCanvas = useMemo(() => {
    if (typeof document === "undefined") return null;
    return createBackingCanvas(sprite.width, sprite.height);
  }, [sprite.width, sprite.height]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !backingCanvas || containerSize.w === 0 || containerSize.h === 0) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    canvas.width = Math.round(containerSize.w * dpr);
    canvas.height = Math.round(containerSize.h * dpr);
    canvas.style.width = `${containerSize.w}px`;
    canvas.style.height = `${containerSize.h}px`;

    canvas.dataset.theme = theme;
    const colors = readThemeColors();
    const pixels = compositePixels(sprite);

    render({
      ctx,
      cssWidth: containerSize.w,
      cssHeight: containerSize.h,
      dpr,
      sprite,
      view,
      backingCanvas,
      pixels,
      options: {
        showGrid,
        ...colors,
      },
    });
  }, [sprite, view, dpr, containerSize.w, containerSize.h, showGrid, backingCanvas, theme]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const handler = (e: WheelEvent) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;
      onWheel(e.deltaY < 0 ? 1 : -1, cx, cy);
    };
    canvas.addEventListener("wheel", handler, { passive: false });
    return () => canvas.removeEventListener("wheel", handler);
  }, [onWheel]);

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (e.button !== 0) return;
    const canvas = e.currentTarget;
    const rect = canvas.getBoundingClientRect();

    if (isSpaceDown && canPan) {
      e.preventDefault();
      canvas.setPointerCapture(e.pointerId);
      dragRef.current = {
        pointerId: e.pointerId,
        mode: "pan",
        lastClientX: e.clientX,
        lastClientY: e.clientY,
        lastSpriteX: 0,
        lastSpriteY: 0,
      };
      setIsDragging(true);
      return;
    }

    const { x, y } = clientToSprite(e.clientX, e.clientY, rect, view);
    if (x < 0 || y < 0 || x >= sprite.width || y >= sprite.height) return;

    e.preventDefault();
    canvas.setPointerCapture(e.pointerId);
    dragRef.current = {
      pointerId: e.pointerId,
      mode: "brush",
      lastClientX: e.clientX,
      lastClientY: e.clientY,
      lastSpriteX: x,
      lastSpriteY: y,
    };
    setIsPainting(true);
    onPaintStart(x, y);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;

    if (drag.mode === "pan") {
      const dx = e.clientX - drag.lastClientX;
      const dy = e.clientY - drag.lastClientY;
      drag.lastClientX = e.clientX;
      drag.lastClientY = e.clientY;
      onPan(dx, dy);
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const { x, y } = clientToSprite(e.clientX, e.clientY, rect, view);
    if (x === drag.lastSpriteX && y === drag.lastSpriteY) return;
    onPaintMove(drag.lastSpriteX, drag.lastSpriteY, x, y);
    drag.lastSpriteX = x;
    drag.lastSpriteY = y;
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;
    e.currentTarget.releasePointerCapture(e.pointerId);
    if (drag.mode === "brush") {
      onPaintEnd();
      setIsPainting(false);
    } else {
      setIsDragging(false);
    }
    dragRef.current = null;
  };

  const cursor = isDragging
    ? "grabbing"
    : isSpaceDown && canPan
      ? "grab"
      : isPainting
        ? "crosshair"
        : "crosshair";

  return (
    <canvas
      ref={canvasRef}
      className={styles.canvas}
      style={{ cursor }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    />
  );
}
