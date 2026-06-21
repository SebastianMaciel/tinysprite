"use client";

import styles from "./Toolbar.module.css";

interface Props {
  spriteWidth: number;
  spriteHeight: number;
  zoom: number;
  showGrid: boolean;
  onToggleGrid: () => void;
  onResetView: () => void;
}

export function Toolbar({
  spriteWidth,
  spriteHeight,
  zoom,
  showGrid,
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
      </div>
      <div className={styles.actions}>
        <button
          type="button"
          onClick={onResetView}
          className={styles.button}
          title="Fit sprite to viewport"
        >
          fit
        </button>
        <button
          type="button"
          onClick={onToggleGrid}
          className={`${styles.button} ${showGrid ? styles.buttonOn : ""}`}
          aria-pressed={showGrid}
          title="Toggle grid (visible at zoom ≥ 4×)"
        >
          grid
        </button>
      </div>
    </header>
  );
}
