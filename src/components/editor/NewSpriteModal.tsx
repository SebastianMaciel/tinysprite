"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { MAX_SPRITE_SIZE, MIN_SPRITE_SIZE, SIZE_PRESETS } from "@/types/sprite";
import styles from "./NewSpriteModal.module.css";

interface Props {
  open: boolean;
  onClose: () => void;
  onCreate: (width: number, height: number, name: string) => void;
}

function clampSize(n: number): number {
  if (!Number.isFinite(n)) return MIN_SPRITE_SIZE;
  return Math.max(MIN_SPRITE_SIZE, Math.min(MAX_SPRITE_SIZE, Math.floor(n)));
}

export function NewSpriteModal({ open, onClose, onCreate }: Props) {
  const [width, setWidth] = useState<number>(16);
  const [height, setHeight] = useState<number>(16);
  const [name, setName] = useState<string>("untitled");

  const matchingPreset = width === height
    ? (SIZE_PRESETS as readonly number[]).find((p) => p === width)
    : undefined;

  const handlePreset = (n: number) => {
    setWidth(n);
    setHeight(n);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const w = clampSize(width);
    const h = clampSize(height);
    onCreate(w, h, name.trim() || "untitled");
  };

  return (
    <Modal open={open} onClose={onClose} title="New sprite">
      <form className={styles.form} onSubmit={handleSubmit}>
        <section className={styles.section}>
          <label className={styles.label}>Size</label>
          <div className={styles.presets}>
            {SIZE_PRESETS.map((p) => (
              <button
                key={p}
                type="button"
                className={`${styles.preset} ${matchingPreset === p ? styles.presetOn : ""}`}
                onClick={() => handlePreset(p)}
                aria-pressed={matchingPreset === p}
              >
                {p}
              </button>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <label className={styles.label}>Custom</label>
          <div className={styles.customRow}>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>W</span>
              <input
                className={styles.numInput}
                type="number"
                min={MIN_SPRITE_SIZE}
                max={MAX_SPRITE_SIZE}
                value={width}
                onChange={(e) => setWidth(clampSize(parseInt(e.target.value, 10) || 0))}
              />
            </label>
            <span className={styles.times} aria-hidden="true">×</span>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>H</span>
              <input
                className={styles.numInput}
                type="number"
                min={MIN_SPRITE_SIZE}
                max={MAX_SPRITE_SIZE}
                value={height}
                onChange={(e) => setHeight(clampSize(parseInt(e.target.value, 10) || 0))}
              />
            </label>
          </div>
          <p className={styles.hint}>max {MAX_SPRITE_SIZE} per side.</p>
        </section>

        <section className={styles.section}>
          <label className={styles.label} htmlFor="new-sprite-name">
            Name
          </label>
          <input
            id="new-sprite-name"
            className={styles.nameInput}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="untitled"
            maxLength={40}
            autoComplete="off"
            spellCheck={false}
          />
        </section>

        <div className={styles.footer}>
          <p className={styles.warning}>
            this replaces the current sprite without confirmation.
          </p>
          <div className={styles.buttons}>
            <button
              type="button"
              className={`${styles.btn} ${styles.btnGhost}`}
              onClick={onClose}
            >
              Cancel
            </button>
            <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`}>
              Create
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
