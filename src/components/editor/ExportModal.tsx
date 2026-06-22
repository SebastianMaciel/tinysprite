"use client";

import { useState } from "react";
import type { Sprite } from "@/types/sprite";
import { Modal } from "@/components/ui/Modal";
import { downloadBlob, downloadText } from "@/lib/export/download";
import { exportJson } from "@/lib/export/json";
import { exportPng } from "@/lib/export/png";
import { exportSheet } from "@/lib/export/sheet";
import { exportSvg } from "@/lib/export/svg";
import styles from "./ExportModal.module.css";

type Format = "png" | "svg" | "json" | "sheet";

interface Props {
  open: boolean;
  onClose: () => void;
  sprite: Sprite;
}

const FORMAT_LABELS: Record<Format, string> = {
  png: "PNG",
  svg: "SVG",
  json: "JSON",
  sheet: "Sheet",
};

const SCALES = [1, 2, 4, 8] as const;

function slugify(name: string): string {
  const cleaned = (name || "untitled")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9_-]/g, "");
  return cleaned || "untitled";
}

function defaultFilename(name: string, format: Format, scale: number): string {
  const slug = slugify(name);
  const suffix = scale > 1 ? `@${scale}x` : "";
  switch (format) {
    case "png":
      return `${slug}${suffix}.png`;
    case "json":
      return `${slug}.json`;
    case "svg":
      return `${slug}.svg`;
    case "sheet":
      return `${slug}-sheet${suffix}.png`;
  }
}

export function ExportModal({ open, onClose, sprite }: Props) {
  const [format, setFormat] = useState<Format>("png");
  const [scale, setScale] = useState<number>(1);
  const [filename, setFilename] = useState<string>(() =>
    defaultFilename(sprite.name, "png", 1),
  );
  const [exporting, setExporting] = useState(false);

  const scalable = format === "png" || format === "sheet";

  const changeFormat = (f: Format) => {
    setFormat(f);
    const nextScale = f === "png" || f === "sheet" ? scale : 1;
    setFilename(defaultFilename(sprite.name, f, nextScale));
  };

  const changeScale = (s: number) => {
    setScale(s);
    setFilename(defaultFilename(sprite.name, format, s));
  };

  const handleExport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (exporting) return;
    setExporting(true);
    try {
      const name = filename.trim() || defaultFilename(sprite.name, format, scale);
      switch (format) {
        case "png": {
          const blob = await exportPng(sprite, scale);
          downloadBlob(blob, name);
          break;
        }
        case "svg": {
          downloadText(exportSvg(sprite), name, "image/svg+xml");
          break;
        }
        case "json": {
          downloadText(exportJson(sprite), name, "application/json");
          break;
        }
        case "sheet": {
          const blob = await exportSheet(sprite, scale);
          downloadBlob(blob, name);
          break;
        }
      }
      onClose();
    } catch (err) {
      console.error("TinySprite: export failed", err);
    } finally {
      setExporting(false);
    }
  };

  const outputWidth = sprite.width * (scalable ? scale : 1) *
    (format === "sheet" ? sprite.frames.length : 1);
  const outputHeight = sprite.height * (scalable ? scale : 1);

  return (
    <Modal open={open} onClose={onClose} title="Exportar sprite">
      <form className={styles.form} onSubmit={handleExport}>
        <section className={styles.section}>
          <label className={styles.label}>Formato</label>
          <div className={styles.formats}>
            {(Object.keys(FORMAT_LABELS) as Format[]).map((f) => (
              <button
                key={f}
                type="button"
                className={`${styles.formatBtn} ${format === f ? styles.formatBtnOn : ""}`}
                onClick={() => changeFormat(f)}
                aria-pressed={format === f}
              >
                {FORMAT_LABELS[f]}
              </button>
            ))}
          </div>
        </section>

        {scalable && (
          <section className={styles.section}>
            <label className={styles.label}>Escala</label>
            <div className={styles.scales}>
              {SCALES.map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`${styles.scaleBtn} ${scale === s ? styles.scaleBtnOn : ""}`}
                  onClick={() => changeScale(s)}
                  aria-pressed={scale === s}
                >
                  {s}×
                </button>
              ))}
            </div>
          </section>
        )}

        <section className={styles.section}>
          <label className={styles.label} htmlFor="export-filename">
            Nombre del archivo
          </label>
          <input
            id="export-filename"
            className={styles.filenameInput}
            type="text"
            value={filename}
            onChange={(e) => setFilename(e.target.value)}
            spellCheck={false}
            autoComplete="off"
          />
        </section>

        <div className={styles.footer}>
          <p className={styles.info}>
            salida: {outputWidth} × {outputHeight} px
          </p>
          <div className={styles.buttons}>
            <button
              type="button"
              className={`${styles.btn} ${styles.btnGhost}`}
              onClick={onClose}
              disabled={exporting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={`${styles.btn} ${styles.btnPrimary}`}
              disabled={exporting}
            >
              {exporting ? "Descargando…" : "Descargar"}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
