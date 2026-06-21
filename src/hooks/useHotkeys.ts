"use client";

import { useEffect } from "react";
import { matchesCombo } from "@/lib/hotkeys";

export type HotkeyMap = Record<string, () => void>;

function isEditableTarget(t: EventTarget | null): boolean {
  if (!(t instanceof HTMLElement)) return false;
  const tag = t.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || t.isContentEditable;
}

export function useHotkeys(bindings: HotkeyMap): void {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (isEditableTarget(e.target)) return;
      for (const combo of Object.keys(bindings)) {
        if (matchesCombo(combo, e)) {
          e.preventDefault();
          bindings[combo]();
          return;
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [bindings]);
}
