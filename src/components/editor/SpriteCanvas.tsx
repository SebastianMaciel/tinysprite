"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Sprite } from "@/types/sprite";
import type { View } from "@/hooks/useCanvasView";
import { compositePixels, createBackingCanvas, render } from "@/lib/sprite/render";
import styles from "./SpriteCanvas.module.css";

interface Props {
  sprite: Sprite;
  view: View;
  dpr: number;
  containerSize: { w: number; h: number };
  showGrid: boolean;
  isSpaceDown: boolean;
  onWheel: (dir: 1 | -1, cursorX: number, cursorY: number) => void;
  onPan: (dx: number, dy: number) => void;
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

export function SpriteCanvas({
  sprite,
  view,
  dpr,
  containerSize,
  showGrid,
  isSpaceDown,
  onWheel,
  onPan,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStateRef = useRef<{ pointerId: number; lastX: number; lastY: number } | null>(null);

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
  }, [sprite, view, dpr, containerSize.w, containerSize.h, showGrid, backingCanvas]);

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
    if (!isSpaceDown) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    dragStateRef.current = { pointerId: e.pointerId, lastX: e.clientX, lastY: e.clientY };
    setIsDragging(true);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const drag = dragStateRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;
    const dx = e.clientX - drag.lastX;
    const dy = e.clientY - drag.lastY;
    drag.lastX = e.clientX;
    drag.lastY = e.clientY;
    onPan(dx, dy);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const drag = dragStateRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;
    e.currentTarget.releasePointerCapture(e.pointerId);
    dragStateRef.current = null;
    setIsDragging(false);
  };

  const cursor = isDragging
    ? "grabbing"
    : isSpaceDown
      ? "grab"
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
