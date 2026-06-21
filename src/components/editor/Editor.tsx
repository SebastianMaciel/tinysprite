"use client";

import { useCallback, useMemo, useState } from "react";
import { createSprite } from "@/lib/sprite/create";
import { useCanvasView } from "@/hooks/useCanvasView";
import { useHotkeys } from "@/hooks/useHotkeys";
import { Toolbar } from "./Toolbar";
import { SpriteCanvas } from "./SpriteCanvas";
import styles from "./Editor.module.css";

const HOTKEY_FIT = "f";
const HOTKEY_GRID = "g";

export function Editor() {
  const sprite = useMemo(() => createSprite(16, 16, "scratch"), []);
  const [showGrid, setShowGrid] = useState(true);

  const {
    containerRef,
    containerSize,
    dpr,
    view,
    isSpaceDown,
    canPan,
    zoomAtCursor,
    panBy,
    resetView,
  } = useCanvasView(sprite.width, sprite.height);

  const toggleGrid = useCallback(() => setShowGrid((v) => !v), []);

  const hotkeys = useMemo(
    () => ({
      [HOTKEY_FIT]: resetView,
      [HOTKEY_GRID]: toggleGrid,
    }),
    [resetView, toggleGrid],
  );
  useHotkeys(hotkeys);

  return (
    <div className={styles.editor}>
      <Toolbar
        spriteWidth={sprite.width}
        spriteHeight={sprite.height}
        zoom={view.zoom}
        showGrid={showGrid}
        isPanMode={isSpaceDown && canPan}
        fitHotkey={HOTKEY_FIT}
        gridHotkey={HOTKEY_GRID}
        onToggleGrid={toggleGrid}
        onResetView={resetView}
      />
      <main className={styles.stage} ref={containerRef}>
        <SpriteCanvas
          sprite={sprite}
          view={view}
          dpr={dpr}
          containerSize={containerSize}
          showGrid={showGrid}
          isSpaceDown={isSpaceDown}
          canPan={canPan}
          onWheel={zoomAtCursor}
          onPan={panBy}
        />
      </main>
      <footer className={styles.hint}>
        scroll para zoom · space + drag para pan · grid visible desde 4×
      </footer>
    </div>
  );
}
