"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import type { Color } from "@/types/sprite";
import { packColor, unpackColor } from "@/lib/sprite/color";
import { hsvToRgb, hueToRgb, rgbToHsv } from "@/lib/color/hsv";
import styles from "./ColorPicker.module.css";

interface Props {
  initialColor: Color;
  onApply: (color: Color) => void;
  onCancel: () => void;
}

interface PickerState {
  h: number;
  s: number;
  v: number;
  r: number;
  g: number;
  b: number;
  hexInput: string;
}

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

function toHexPair(n: number) {
  return n.toString(16).padStart(2, "0");
}

function rgbToHexStr(r: number, g: number, b: number) {
  return `#${toHexPair(r)}${toHexPair(g)}${toHexPair(b)}`;
}

function parseHex(input: string): [number, number, number] | null {
  const m = input.replace(/^#/, "").match(/^[0-9a-fA-F]{6}$/);
  if (!m) return null;
  const h = m[0];
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

function fromHsv(h: number, s: number, v: number, prevHexInput?: string): PickerState {
  const [r, g, b] = hsvToRgb(h, s, v);
  const hex = rgbToHexStr(r, g, b);
  return { h, s, v, r, g, b, hexInput: prevHexInput ?? hex };
}

function initialState(color: Color): PickerState {
  const [r, g, b] = unpackColor(color);
  const [h, s, v] = rgbToHsv(r, g, b);
  return { h, s, v, r, g, b, hexInput: rgbToHexStr(r, g, b) };
}

export function ColorPicker({ initialColor, onApply, onCancel }: Props) {
  const [state, setState] = useState<PickerState>(() => initialState(initialColor));
  const svRef = useRef<HTMLDivElement>(null);
  const hueRef = useRef<HTMLDivElement>(null);

  const currentColor = useMemo(() => packColor(state.r, state.g, state.b, 255), [state.r, state.g, state.b]);
  const currentHex = useMemo(() => rgbToHexStr(state.r, state.g, state.b), [state.r, state.g, state.b]);
  const [hueR, hueG, hueB] = hueToRgb(state.h);

  const updateSv = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const s = clamp01((e.clientX - rect.left) / rect.width);
    const v = 1 - clamp01((e.clientY - rect.top) / rect.height);
    setState((prev) => fromHsv(prev.h, s, v));
  }, []);

  const updateHue = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const h = clamp01((e.clientX - rect.left) / rect.width);
    setState((prev) => fromHsv(h, prev.s, prev.v));
  }, []);

  const handleSvDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    updateSv(e);
  };
  const handleSvMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
    updateSv(e);
  };

  const handleHueDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    updateHue(e);
  };
  const handleHueMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
    updateHue(e);
  };

  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const trimmed = raw.startsWith("#") ? raw : `#${raw}`;
    const parsed = parseHex(trimmed);
    if (parsed) {
      const [r, g, b] = parsed;
      const [h, s, v] = rgbToHsv(r, g, b);
      setState({ h, s, v, r, g, b, hexInput: trimmed });
    } else {
      setState((prev) => ({ ...prev, hexInput: raw }));
    }
  };

  const handleHexBlur = () => {
    setState((prev) => ({ ...prev, hexInput: rgbToHexStr(prev.r, prev.g, prev.b) }));
  };

  const handleRgbChange = (channel: "r" | "g" | "b") =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const n = Math.max(0, Math.min(255, parseInt(e.target.value || "0", 10) || 0));
      setState((prev) => {
        const r = channel === "r" ? n : prev.r;
        const g = channel === "g" ? n : prev.g;
        const b = channel === "b" ? n : prev.b;
        const [h, s, v] = rgbToHsv(r, g, b);
        return { h, s, v, r, g, b, hexInput: rgbToHexStr(r, g, b) };
      });
    };

  const initialRgb = useMemo(() => unpackColor(initialColor), [initialColor]);

  return (
    <div className={styles.picker}>
      <div
        ref={svRef}
        className={styles.svBox}
        style={{ background: `rgb(${hueR}, ${hueG}, ${hueB})` }}
        onPointerDown={handleSvDown}
        onPointerMove={handleSvMove}
      >
        <div className={styles.svSaturation} />
        <div className={styles.svValue} />
        <div
          className={styles.svHandle}
          style={{
            left: `${state.s * 100}%`,
            top: `${(1 - state.v) * 100}%`,
          }}
        />
      </div>

      <div
        ref={hueRef}
        className={styles.hueSlider}
        onPointerDown={handleHueDown}
        onPointerMove={handleHueMove}
      >
        <div
          className={styles.hueHandle}
          style={{ left: `${state.h * 100}%` }}
        />
      </div>

      <div className={styles.inputs}>
        <label className={styles.field}>
          <span className={styles.fieldLabel}>HEX</span>
          <input
            className={styles.hexInput}
            value={state.hexInput}
            onChange={handleHexChange}
            onBlur={handleHexBlur}
            spellCheck={false}
            autoComplete="off"
            maxLength={7}
          />
        </label>
        <div className={styles.rgbRow}>
          {(["r", "g", "b"] as const).map((c) => (
            <label key={c} className={styles.field}>
              <span className={styles.fieldLabel}>{c.toUpperCase()}</span>
              <input
                className={styles.rgbInput}
                type="number"
                min={0}
                max={255}
                value={state[c]}
                onChange={handleRgbChange(c)}
              />
            </label>
          ))}
        </div>
      </div>

      <div className={styles.footer}>
        <div className={styles.compare}>
          <span
            className={styles.compareSwatch}
            style={{ background: rgbToHexStr(initialRgb[0], initialRgb[1], initialRgb[2]) }}
            aria-label="Color anterior"
          />
          <span className={styles.compareArrow} aria-hidden="true">→</span>
          <span
            className={styles.compareSwatch}
            style={{ background: currentHex }}
            aria-label="Color nuevo"
          />
        </div>
        <div className={styles.buttons}>
          <button
            type="button"
            className={`${styles.btn} ${styles.btnGhost}`}
            onClick={onCancel}
          >
            Cancelar
          </button>
          <button
            type="button"
            className={`${styles.btn} ${styles.btnPrimary}`}
            onClick={() => onApply(currentColor)}
          >
            Aplicar
          </button>
        </div>
      </div>
    </div>
  );
}
