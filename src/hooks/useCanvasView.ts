"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export interface View {
  zoom: number;
  panX: number;
  panY: number;
}

const ZOOM_LEVELS = [0.5, 1, 2, 3, 4, 6, 8, 12, 16, 24, 32, 48, 64];
const MIN_ZOOM = ZOOM_LEVELS[0];
const MAX_ZOOM = ZOOM_LEVELS[ZOOM_LEVELS.length - 1];
const VIEWPORT_PADDING = 32;

function clampZoom(z: number): number {
  return Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, z));
}

function nextZoomStep(current: number, dir: 1 | -1): number {
  if (dir > 0) {
    return ZOOM_LEVELS.find((z) => z > current + 0.001) ?? MAX_ZOOM;
  }
  for (let i = ZOOM_LEVELS.length - 1; i >= 0; i--) {
    if (ZOOM_LEVELS[i] < current - 0.001) return ZOOM_LEVELS[i];
  }
  return MIN_ZOOM;
}

function computeFitView(
  containerW: number,
  containerH: number,
  spriteW: number,
  spriteH: number,
): View {
  if (containerW === 0 || containerH === 0) {
    return { zoom: 1, panX: 0, panY: 0 };
  }
  const availW = Math.max(1, containerW - VIEWPORT_PADDING * 2);
  const availH = Math.max(1, containerH - VIEWPORT_PADDING * 2);
  const raw = Math.min(availW / spriteW, availH / spriteH);
  const zoom = clampZoom(raw >= 1 ? Math.floor(raw) : raw);
  return {
    zoom,
    panX: (containerW - spriteW * zoom) / 2,
    panY: (containerH - spriteH * zoom) / 2,
  };
}

function readClientDpr(): number {
  return typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
}

export interface UseCanvasViewResult {
  containerRef: React.RefObject<HTMLDivElement | null>;
  containerSize: { w: number; h: number };
  dpr: number;
  view: View;
  isSpaceDown: boolean;
  zoomAtCursor: (dir: 1 | -1, cursorX: number, cursorY: number) => void;
  panBy: (dx: number, dy: number) => void;
  resetView: () => void;
}

export function useCanvasView(spriteW: number, spriteH: number): UseCanvasViewResult {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [containerSize, setContainerSize] = useState({ w: 0, h: 0 });
  const [dpr, setDpr] = useState<number>(readClientDpr);
  const [userView, setUserView] = useState<{ view: View; spriteKey: string } | null>(null);
  const [isSpaceDown, setIsSpaceDown] = useState(false);

  useEffect(() => {
    const handler = () => setDpr(readClientDpr());
    const mq = window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
    mq.addEventListener?.("change", handler);
    return () => mq.removeEventListener?.("change", handler);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const cr = entry.contentRect;
        setContainerSize({ w: cr.width, h: cr.height });
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const isEditableTarget = (t: EventTarget | null): boolean => {
      if (!(t instanceof HTMLElement)) return false;
      const tag = t.tagName;
      return tag === "INPUT" || tag === "TEXTAREA" || t.isContentEditable;
    };
    const down = (e: KeyboardEvent) => {
      if (e.code !== "Space" || isEditableTarget(e.target)) return;
      e.preventDefault();
      setIsSpaceDown(true);
    };
    const up = (e: KeyboardEvent) => {
      if (e.code !== "Space") return;
      setIsSpaceDown(false);
    };
    const blur = () => setIsSpaceDown(false);
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", blur);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", blur);
    };
  }, []);

  const spriteKey = `${spriteW}x${spriteH}`;

  const fitView = useMemo(
    () => computeFitView(containerSize.w, containerSize.h, spriteW, spriteH),
    [containerSize.w, containerSize.h, spriteW, spriteH],
  );

  const view: View = userView?.spriteKey === spriteKey ? userView.view : fitView;

  const zoomAtCursor = useCallback(
    (dir: 1 | -1, cursorX: number, cursorY: number) => {
      setUserView((prev) => {
        const current = prev?.spriteKey === spriteKey ? prev.view : fitView;
        const newZoom = nextZoomStep(current.zoom, dir);
        if (newZoom === current.zoom) return prev;
        const sx = (cursorX - current.panX) / current.zoom;
        const sy = (cursorY - current.panY) / current.zoom;
        return {
          view: {
            zoom: newZoom,
            panX: cursorX - sx * newZoom,
            panY: cursorY - sy * newZoom,
          },
          spriteKey,
        };
      });
    },
    [fitView, spriteKey],
  );

  const panBy = useCallback(
    (dx: number, dy: number) => {
      setUserView((prev) => {
        const current = prev?.spriteKey === spriteKey ? prev.view : fitView;
        return {
          view: { ...current, panX: current.panX + dx, panY: current.panY + dy },
          spriteKey,
        };
      });
    },
    [fitView, spriteKey],
  );

  const resetView = useCallback(() => setUserView(null), []);

  return {
    containerRef,
    containerSize,
    dpr,
    view,
    isSpaceDown,
    zoomAtCursor,
    panBy,
    resetView,
  };
}
