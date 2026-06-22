"use client";

import { useEditorStore } from "@/stores/editor";
import { colorToCss, colorToHex, isTransparent } from "@/lib/sprite/color";
import { TRANSPARENT } from "@/types/sprite";
import { ColorSwatch } from "./ColorSwatch";
import styles from "./Sidebar.module.css";

interface Props {
  onOpenPicker: () => void;
}

export function Sidebar({ onOpenPicker }: Props) {
  const palettes = useEditorStore((s) => s.palettes);
  const customColors = useEditorStore((s) => s.customColors);
  const activeColor = useEditorStore((s) => s.activeColor);
  const setActiveColor = useEditorStore((s) => s.setActiveColor);

  const activeTransparent = isTransparent(activeColor);
  const activeHex = activeTransparent ? "TRANSP" : colorToHex(activeColor).toUpperCase();

  return (
    <aside className={styles.sidebar} aria-label="Palette">
      <div className={styles.scroll}>
        <div className={styles.active}>
          <div
            className={`${styles.activeSwatch} ${activeTransparent ? styles.activeTransparent : ""}`}
            style={activeTransparent ? undefined : { background: colorToCss(activeColor) }}
            aria-hidden="true"
          />
          <code className={styles.activeHex}>{activeHex}</code>
        </div>

        <section className={styles.section}>
          <div className={styles.grid}>
            <ColorSwatch
              color={TRANSPARENT}
              selected={activeTransparent}
              onClick={() => setActiveColor(TRANSPARENT)}
              label="Transparent (eraser)"
            />
          </div>
        </section>

        {palettes.map((palette) => (
          <section key={palette.id} className={styles.section}>
            <header className={styles.sectionHeader}>{palette.name}</header>
            <div className={styles.grid}>
              {palette.colors.map((c, i) => (
                <ColorSwatch
                  key={`${palette.id}-${i}`}
                  color={c}
                  selected={c === activeColor}
                  onClick={() => setActiveColor(c)}
                />
              ))}
            </div>
          </section>
        ))}

        {customColors.length > 0 && (
          <section className={styles.section}>
            <header className={styles.sectionHeader}>custom</header>
            <div className={styles.grid}>
              {customColors.map((c, i) => (
                <ColorSwatch
                  key={`custom-${i}`}
                  color={c}
                  selected={c === activeColor}
                  onClick={() => setActiveColor(c)}
                />
              ))}
            </div>
          </section>
        )}
      </div>

      <footer className={styles.footer}>
        <button
          type="button"
          className={styles.addBtn}
          onClick={onOpenPicker}
          aria-label="Add custom color"
          data-tooltip="Add custom color"
          data-tooltip-side="right"
        >
          +
        </button>
      </footer>
    </aside>
  );
}
