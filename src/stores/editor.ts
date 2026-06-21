"use client";

import { create } from "zustand";
import type { Color, Sprite } from "@/types/sprite";
import { activeFrame, createSprite } from "@/lib/sprite/create";
import {
  paintPixel as drawPixel,
  paintLine as drawLine,
} from "@/lib/sprite/draw";
import {
  DEFAULT_ACTIVE_COLOR,
  DEFAULT_PALETTES,
  type NamedPalette,
} from "@/lib/sprite/palettes";

const HISTORY_LIMIT = 100;

export interface EditorState {
  sprite: Sprite;
  palettes: NamedPalette[];
  customColors: Color[];
  activeColor: Color;
  history: Uint32Array[];
  historyIndex: number;
  strokeActive: boolean;
  strokeDirty: boolean;

  setActiveColor: (c: Color) => void;
  addCustomColor: (c: Color) => void;
  beginStroke: () => void;
  endStroke: () => void;
  paintAt: (x: number, y: number) => void;
  paintFromTo: (x0: number, y0: number, x1: number, y1: number) => void;
  undo: () => void;
  redo: () => void;
}

function initialState() {
  const sprite = createSprite(16, 16, "scratch");
  const initialPixels = new Uint32Array(activeFrame(sprite).layers[0].pixels);
  return {
    sprite,
    palettes: DEFAULT_PALETTES,
    customColors: [] as Color[],
    activeColor: DEFAULT_ACTIVE_COLOR,
    history: [initialPixels],
    historyIndex: 0,
    strokeActive: false,
    strokeDirty: false,
  };
}

export const useEditorStore = create<EditorState>((set) => ({
  ...initialState(),

  setActiveColor: (c) => set({ activeColor: c }),

  addCustomColor: (c) =>
    set((s) =>
      s.customColors.includes(c)
        ? { activeColor: c }
        : { customColors: [...s.customColors, c], activeColor: c },
    ),

  beginStroke: () => set({ strokeActive: true, strokeDirty: false }),

  endStroke: () =>
    set((s) => {
      if (!s.strokeActive) return {};
      if (!s.strokeDirty) return { strokeActive: false };
      const layer = activeFrame(s.sprite).layers[0];
      const snap = new Uint32Array(layer.pixels);
      const head = s.history.slice(0, s.historyIndex + 1);
      const next = [...head, snap];
      const capped =
        next.length > HISTORY_LIMIT ? next.slice(-HISTORY_LIMIT) : next;
      return {
        history: capped,
        historyIndex: capped.length - 1,
        strokeActive: false,
        strokeDirty: false,
      };
    }),

  paintAt: (x, y) =>
    set((s) => {
      const layer = activeFrame(s.sprite).layers[0];
      if (!drawPixel(layer.pixels, s.sprite.width, s.sprite.height, x, y, s.activeColor)) {
        return {};
      }
      return { sprite: { ...s.sprite }, strokeDirty: true };
    }),

  paintFromTo: (x0, y0, x1, y1) =>
    set((s) => {
      const layer = activeFrame(s.sprite).layers[0];
      if (
        !drawLine(layer.pixels, s.sprite.width, s.sprite.height, x0, y0, x1, y1, s.activeColor)
      ) {
        return {};
      }
      return { sprite: { ...s.sprite }, strokeDirty: true };
    }),

  undo: () =>
    set((s) => {
      if (s.strokeActive || s.historyIndex <= 0) return {};
      const idx = s.historyIndex - 1;
      const layer = activeFrame(s.sprite).layers[0];
      layer.pixels.set(s.history[idx]);
      return { historyIndex: idx, sprite: { ...s.sprite } };
    }),

  redo: () =>
    set((s) => {
      if (s.strokeActive || s.historyIndex >= s.history.length - 1) return {};
      const idx = s.historyIndex + 1;
      const layer = activeFrame(s.sprite).layers[0];
      layer.pixels.set(s.history[idx]);
      return { historyIndex: idx, sprite: { ...s.sprite } };
    }),
}));

export const selectCanUndo = (s: EditorState) => s.historyIndex > 0;
export const selectCanRedo = (s: EditorState) =>
  s.historyIndex < s.history.length - 1;
