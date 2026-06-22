import type { SerializedEditorState } from "@/lib/sprite/serialize";
import { SERIALIZATION_VERSION } from "@/lib/sprite/serialize";

const STORAGE_KEY = "tinysprite-editor:v1";

export function loadEditorState(): SerializedEditorState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      (parsed as { v?: number }).v !== SERIALIZATION_VERSION
    ) {
      return null;
    }
    return parsed as SerializedEditorState;
  } catch {
    return null;
  }
}

export function saveEditorState(state: SerializedEditorState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn("TinySprite: failed to persist editor state", e);
  }
}

export function clearEditorState(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
