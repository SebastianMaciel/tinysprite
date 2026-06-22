"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useEditorStore, selectCanUndo, selectCanRedo } from "@/stores/editor";
import { useCanvasView } from "@/hooks/useCanvasView";
import { useHotkeys } from "@/hooks/useHotkeys";
import { Modal } from "@/components/ui/Modal";
import { ColorPicker } from "./ColorPicker";
import { NewSpriteModal } from "./NewSpriteModal";
import { Toolbar } from "./Toolbar";
import { Sidebar } from "./Sidebar";
import { SpriteCanvas } from "./SpriteCanvas";
import styles from "./Editor.module.css";
import type { Color } from "@/types/sprite";

const HOTKEY_FIT = "f";
const HOTKEY_GRID = "g";
const HOTKEY_UNDO = "mod+z";
const HOTKEY_REDO = "mod+shift+z";
const HOTKEY_NEW = "mod+alt+n";

export function Editor() {
  const sprite = useEditorStore((s) => s.sprite);
  const beginStroke = useEditorStore((s) => s.beginStroke);
  const endStroke = useEditorStore((s) => s.endStroke);
  const paintAt = useEditorStore((s) => s.paintAt);
  const paintFromTo = useEditorStore((s) => s.paintFromTo);
  const undo = useEditorStore((s) => s.undo);
  const redo = useEditorStore((s) => s.redo);
  const canUndo = useEditorStore(selectCanUndo);
  const canRedo = useEditorStore(selectCanRedo);
  const activeColor = useEditorStore((s) => s.activeColor);
  const addCustomColor = useEditorStore((s) => s.addCustomColor);
  const newSprite = useEditorStore((s) => s.newSprite);
  const hydrateFromStorage = useEditorStore((s) => s.hydrateFromStorage);

  useEffect(() => {
    hydrateFromStorage();
  }, [hydrateFromStorage]);

  const [showGrid, setShowGrid] = useState(true);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [newOpen, setNewOpen] = useState(false);

  const handleApplyColor = useCallback(
    (c: Color) => {
      addCustomColor(c);
      setPickerOpen(false);
    },
    [addCustomColor],
  );

  const handleCreateSprite = useCallback(
    (w: number, h: number, name: string) => {
      newSprite(w, h, name);
      setNewOpen(false);
    },
    [newSprite],
  );

  const openNewModal = useCallback(() => setNewOpen(true), []);

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

  const handlePaintStart = useCallback(
    (x: number, y: number) => {
      beginStroke();
      paintAt(x, y);
    },
    [beginStroke, paintAt],
  );

  const handlePaintMove = useCallback(
    (fromX: number, fromY: number, toX: number, toY: number) => {
      paintFromTo(fromX, fromY, toX, toY);
    },
    [paintFromTo],
  );

  const hotkeys = useMemo(
    () => ({
      [HOTKEY_FIT]: resetView,
      [HOTKEY_GRID]: toggleGrid,
      [HOTKEY_UNDO]: undo,
      [HOTKEY_REDO]: redo,
      [HOTKEY_NEW]: openNewModal,
    }),
    [resetView, toggleGrid, undo, redo, openNewModal],
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
        undoHotkey={HOTKEY_UNDO}
        redoHotkey={HOTKEY_REDO}
        newHotkey={HOTKEY_NEW}
        canUndo={canUndo}
        canRedo={canRedo}
        onToggleGrid={toggleGrid}
        onResetView={resetView}
        onUndo={undo}
        onRedo={redo}
        onNew={openNewModal}
      />
      <div className={styles.body}>
        <Sidebar onOpenPicker={() => setPickerOpen(true)} />
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
            onPaintStart={handlePaintStart}
            onPaintMove={handlePaintMove}
            onPaintEnd={endStroke}
          />
        </main>
      </div>
      <footer className={styles.hint}>
        click + drag para pintar · scroll para zoom · space + drag para pan · ⌘Z para deshacer
      </footer>
      <Modal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        title="Nuevo color"
      >
        <ColorPicker
          initialColor={activeColor}
          onApply={handleApplyColor}
          onCancel={() => setPickerOpen(false)}
        />
      </Modal>
      <NewSpriteModal
        open={newOpen}
        onClose={() => setNewOpen(false)}
        onCreate={handleCreateSprite}
      />
    </div>
  );
}
