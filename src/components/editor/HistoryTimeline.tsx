"use client";

import { useEffect, useRef } from "react";
import { useEditorStore } from "@/stores/editor";
import styles from "./HistoryTimeline.module.css";

interface ThumbProps {
  pixels: Uint32Array;
  width: number;
  height: number;
  active: boolean;
  previewing: boolean;
  label: string;
  onClick: () => void;
  onHoverIn: () => void;
  onHoverOut: () => void;
}

function HistoryThumb({
  pixels,
  width,
  height,
  active,
  previewing,
  label,
  onClick,
  onHoverIn,
  onHoverOut,
}: ThumbProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const u8 = new Uint8ClampedArray(
      pixels.buffer as ArrayBuffer,
      pixels.byteOffset,
      pixels.byteLength,
    );
    ctx.putImageData(new ImageData(u8, width, height), 0, 0);
  }, [pixels, width, height]);

  const stateClass = active
    ? styles.active
    : previewing
      ? styles.previewing
      : "";

  return (
    <button
      type="button"
      className={`${styles.thumb} ${stateClass}`}
      onClick={onClick}
      onMouseEnter={onHoverIn}
      onMouseLeave={onHoverOut}
      onFocus={onHoverIn}
      onBlur={onHoverOut}
      aria-label={label}
      aria-pressed={active}
    >
      <canvas ref={canvasRef} className={styles.thumbCanvas} />
    </button>
  );
}

export function HistoryTimeline() {
  const history = useEditorStore((s) => s.history);
  const historyIndex = useEditorStore((s) => s.historyIndex);
  const previewIndex = useEditorStore((s) => s.previewIndex);
  const spriteWidth = useEditorStore((s) => s.sprite.width);
  const spriteHeight = useEditorStore((s) => s.sprite.height);
  const jumpToHistory = useEditorStore((s) => s.jumpToHistory);
  const setPreviewIndex = useEditorStore((s) => s.setPreviewIndex);

  if (history.length <= 1) return null;

  return (
    <nav className={styles.timeline} aria-label="History">
      {history.map((pixels, i) => (
        <HistoryThumb
          key={i}
          pixels={pixels}
          width={spriteWidth}
          height={spriteHeight}
          active={i === historyIndex}
          previewing={i === previewIndex}
          label={i === 0 ? "Initial state" : `Stroke ${i}`}
          onClick={() => jumpToHistory(i)}
          onHoverIn={() => setPreviewIndex(i)}
          onHoverOut={() => setPreviewIndex(null)}
        />
      ))}
    </nav>
  );
}
