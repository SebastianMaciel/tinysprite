"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useEditorStore } from "@/stores/editor";
import styles from "./HistoryTimeline.module.css";

const CLOSE_DELAY_MS = 2000;

interface ThumbProps {
  index: number;
  pixels: Uint32Array;
  width: number;
  height: number;
  active: boolean;
  previewing: boolean;
  label: string;
  onClick: () => void;
  onFocusPreview: () => void;
  onBlurPreview: () => void;
}

function HistoryThumb({
  index,
  pixels,
  width,
  height,
  active,
  previewing,
  label,
  onClick,
  onFocusPreview,
  onBlurPreview,
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
      data-thumb-index={index}
      className={`${styles.thumb} ${stateClass}`}
      onClick={onClick}
      onFocus={onFocusPreview}
      onBlur={onBlurPreview}
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

  const handleTimelineMouseMove = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      const target = e.target as HTMLElement | null;
      const thumbEl = target?.closest<HTMLElement>("[data-thumb-index]");
      if (!thumbEl) return;
      const raw = thumbEl.dataset.thumbIndex;
      if (raw === undefined) return;
      const idx = Number(raw);
      if (Number.isNaN(idx)) return;
      if (idx === historyIndex) {
        if (previewIndex !== null) setPreviewIndex(null);
        return;
      }
      if (idx === previewIndex) return;
      setPreviewIndex(idx);
    },
    [historyIndex, previewIndex, setPreviewIndex],
  );

  const handleTimelineMouseLeave = useCallback(() => {
    setPreviewIndex(null);
    scheduleClose();
  }, [setPreviewIndex, scheduleClose]);

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
        onMouseMove={handleTimelineMouseMove}
        onMouseLeave={handleTimelineMouseLeave}
      >
        {history.map((pixels, i) => (
          <HistoryThumb
            key={i}
            index={i}
            pixels={pixels}
            width={spriteWidth}
            height={spriteHeight}
            active={i === historyIndex}
            previewing={i === previewIndex}
            label={i === 0 ? "Initial state" : `Stroke ${i}`}
            onClick={() => jumpToHistory(i)}
            onFocusPreview={() => {
              if (i !== historyIndex) setPreviewIndex(i);
            }}
            onBlurPreview={() => setPreviewIndex(null)}
          />
        ))}
      </nav>
    </>
  );
}
