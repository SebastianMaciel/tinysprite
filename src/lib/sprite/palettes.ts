import type { Color } from "@/types/sprite";
import { hexToColor } from "./color";

export interface NamedPalette {
  id: string;
  name: string;
  colors: Color[];
}

const COZY: NamedPalette = {
  id: "cozy",
  name: "cozy",
  colors: [
    hexToColor("#4a3b47"),
    hexToColor("#7a6a6e"),
    hexToColor("#d89ba0"),
    hexToColor("#8eaa7f"),
    hexToColor("#d8a888"),
    hexToColor("#a890c8"),
    hexToColor("#faf3e7"),
    hexToColor("#ffffff"),
  ],
};

const PICO_8: NamedPalette = {
  id: "pico-8",
  name: "pico-8",
  colors: [
    hexToColor("#000000"),
    hexToColor("#1d2b53"),
    hexToColor("#7e2553"),
    hexToColor("#008751"),
    hexToColor("#ab5236"),
    hexToColor("#5f574f"),
    hexToColor("#c2c3c7"),
    hexToColor("#fff1e8"),
    hexToColor("#ff004d"),
    hexToColor("#ffa300"),
    hexToColor("#ffec27"),
    hexToColor("#00e436"),
    hexToColor("#29adff"),
    hexToColor("#83769c"),
    hexToColor("#ff77a8"),
    hexToColor("#ffccaa"),
  ],
};

export const DEFAULT_PALETTES: NamedPalette[] = [COZY, PICO_8];

export const DEFAULT_ACTIVE_COLOR: Color = COZY.colors[2];
