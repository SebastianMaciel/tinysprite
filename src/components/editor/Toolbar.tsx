"use client";

import { formatCombo } from "@/lib/hotkeys";
import styles from "./Toolbar.module.css";

interface Props {
  spriteWidth: number;
  spriteHeight: number;
  zoom: number;
  showGrid: boolean;
  isPanMode: boolean;
  fitHotkey: string;
  gridHotkey: string;
  onToggleGrid: () => void;
  onResetView: () => void;
}

interface ToolButtonProps {
  label: string;
  hotkey: string;
  pressed?: boolean;
  onClick: () => void;
  title: string;
}

function ToolButton({ label, hotkey, pressed, onClick, title }: ToolButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${styles.button} ${pressed ? styles.buttonOn : ""}`}
      aria-pressed={pressed}
      aria-label={title}
      aria-keyshortcuts={hotkey}
    >
      <span className={styles.buttonLabel}>{label}</span>
      <kbd className={styles.buttonKey} aria-hidden="true">
        {formatCombo(hotkey)}
      </kbd>
      <span className={styles.tooltip} role="tooltip">
        {title}
      </span>
    </button>
  );
}

export function Toolbar({
  spriteWidth,
  spriteHeight,
  zoom,
  showGrid,
  isPanMode,
  fitHotkey,
  gridHotkey,
  onToggleGrid,
  onResetView,
}: Props) {
  return (
    <header className={styles.toolbar}>
      <div className={styles.brand}>
        <span className={styles.brandName}>TinySprite</span>
        <span className={styles.brandTag}>milestone 2</span>
      </div>
      <div className={styles.meta}>
        <span className={styles.size}>
          {spriteWidth} × {spriteHeight}
        </span>
        <span className={styles.divider} aria-hidden="true">·</span>
        <span className={styles.zoom}>{Math.round(zoom * 100)}%</span>
        {isPanMode && (
          <span className={styles.modeChip} aria-live="polite">PAN</span>
        )}
      </div>
      <div className={styles.actions}>
        <ToolButton
          label="fit"
          hotkey={fitHotkey}
          onClick={onResetView}
          title="Fit sprite to viewport"
        />
        <ToolButton
          label="grid"
          hotkey={gridHotkey}
          pressed={showGrid}
          onClick={onToggleGrid}
          title="Toggle grid"
        />
      </div>
    </header>
  );
}
