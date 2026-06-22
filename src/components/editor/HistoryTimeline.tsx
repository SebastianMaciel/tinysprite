"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useEditorStore } from "@/stores/editor";
import styles from "./HistoryTimeline.module.css";

const CLOSE_DELAY_MS = 2000;

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

  const [isOpen, setIsOpen] = useState(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timelineRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const container = timelineRef.current;
    if (!container) return;
    const target = container.querySelector<HTMLElement>(`.${styles.active}`);
    if (target) {
      target.scrollIntoView({ behavior: "auto", block: "nearest", inline: "center" });
    }
  }, [isOpen, historyIndex]);

  const cancelClose = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const open = useCallback(() => {
    cancelClose();
    setIsOpen(true);
  }, [cancelClose]);

  const scheduleClose = useCallback(() => {
    cancelClose();
    closeTimerRef.current = setTimeout(() => {
      setIsOpen(false);
      setPreviewIndex(null);
      closeTimerRef.current = null;
    }, CLOSE_DELAY_MS);
  }, [cancelClose, setPreviewIndex]);

  useEffect(() => () => cancelClose(), [cancelClose]);

  if (history.length <= 1) return null;

  return (
    <>
      <button
        type="button"
        className={`${styles.trigger} ${isOpen ? styles.triggerHidden : ""}`}
        onMouseEnter={open}
        onMouseLeave={scheduleClose}
        onFocus={open}
        onBlur={scheduleClose}
        aria-expanded={isOpen}
        aria-controls="history-timeline"
      >
        time travel
      </button>
      <nav
        ref={timelineRef}
        id="history-timeline"
        className={`${styles.timeline} ${isOpen ? styles.timelineOpen : ""}`}
        aria-label="History timeline"
        onMouseEnter={open}
        onMouseLeave={scheduleClose}
      >
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
    </>
  );
}
