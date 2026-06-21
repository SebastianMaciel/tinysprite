"use client";

import type { Color } from "@/types/sprite";
import { colorToCss, colorToHex, isTransparent } from "@/lib/sprite/color";
import styles from "./ColorSwatch.module.css";

interface Props {
  color: Color;
  selected?: boolean;
  onClick: () => void;
  label?: string;
}

export function ColorSwatch({ color, selected, onClick, label }: Props) {
  const transparent = isTransparent(color);
  const accessibleLabel = label ?? (transparent ? "Transparente" : colorToHex(color));
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${styles.swatch} ${selected ? styles.selected : ""} ${transparent ? styles.transparent : ""}`}
      style={transparent ? undefined : { background: colorToCss(color) }}
      aria-label={accessibleLabel}
      aria-pressed={selected}
      title={accessibleLabel}
    />
  );
}
