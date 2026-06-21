"use client";

import { useMemo, useState } from "react";
import { createSprite } from "@/lib/sprite/create";
import { useCanvasView } from "@/hooks/useCanvasView";
import { Toolbar } from "./Toolbar";
import { SpriteCanvas } from "./SpriteCanvas";
import styles from "./Editor.module.css";

export function Editor() {
  const sprite = useMemo(() => createSprite(16, 16, "scratch"), []);
  const [showGrid, setShowGrid] = useState(true);

  const {
    containerRef,
    containerSize,
    dpr,
    view,
    isSpaceDown,
    zoomAtCursor,
    panBy,
    resetView,
  } = useCanvasView(sprite.width, sprite.height);

  return (
    <div className={styles.editor}>
      <Toolbar
        spriteWidth={sprite.width}
        spriteHeight={sprite.height}
        zoom={view.zoom}
        showGrid={showGrid}
        onToggleGrid={() => setShowGrid((v) => !v)}
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
