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
  undoHotkey: string;
  redoHotkey: string;
  canUndo: boolean;
  canRedo: boolean;
  onToggleGrid: () => void;
  onResetView: () => void;
  onUndo: () => void;
  onRedo: () => void;
}

interface ToolButtonProps {
  label: string;
  hotkey: string;
  pressed?: boolean;
  disabled?: boolean;
  onClick: () => void;
  title: string;
}

function ToolButton({
  label,
  hotkey,
  pressed,
  disabled,
  onClick,
  title,
}: ToolButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
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
  undoHotkey,
  redoHotkey,
  canUndo,
  canRedo,
  onToggleGrid,
  onResetView,
  onUndo,
  onRedo,
}: Props) {
  return (
    <header className={styles.toolbar}>
      <div className={styles.brand}>
        <span className={styles.brandName}>TinySprite</span>
        <span className={styles.brandTag}>milestone 3</span>
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
          label="undo"
          hotkey={undoHotkey}
          disabled={!canUndo}
          onClick={onUndo}
          title="Deshacer último trazo"
        />
        <ToolButton
          label="redo"
          hotkey={redoHotkey}
          disabled={!canRedo}
          onClick={onRedo}
          title="Rehacer trazo"
        />
        <span className={styles.actionsDivider} aria-hidden="true" />
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
