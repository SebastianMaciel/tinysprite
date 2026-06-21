export function isMacPlatform(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Mac|iPhone|iPad/i.test(navigator.userAgent);
}

const MODIFIER_TOKENS = new Set(["mod", "shift", "alt"]);

interface ParsedCombo {
  needsMod: boolean;
  needsShift: boolean;
  needsAlt: boolean;
  key: string;
}

function parseCombo(combo: string): ParsedCombo {
  const parts = combo.toLowerCase().split("+").map((p) => p.trim());
  const key = parts.find((p) => !MODIFIER_TOKENS.has(p)) ?? "";
  return {
    needsMod: parts.includes("mod"),
    needsShift: parts.includes("shift"),
    needsAlt: parts.includes("alt"),
    key,
  };
}

export function matchesCombo(combo: string, e: KeyboardEvent): boolean {
  const { needsMod, needsShift, needsAlt, key } = parseCombo(combo);
  const modActive = isMacPlatform() ? e.metaKey : e.ctrlKey;
  if (modActive !== needsMod) return false;
  if (e.shiftKey !== needsShift) return false;
  if (e.altKey !== needsAlt) return false;
  return e.key.toLowerCase() === key;
}

export function formatCombo(combo: string, mac?: boolean): string {
  const { needsMod, needsShift, needsAlt, key } = parseCombo(combo);
  const isMac = mac ?? isMacPlatform();
  const parts: string[] = [];
  if (needsMod) parts.push(isMac ? "⌘" : "Ctrl");
  if (needsShift) parts.push(isMac ? "⇧" : "Shift");
  if (needsAlt) parts.push(isMac ? "⌥" : "Alt");
  const keyDisplay = key.length === 1 ? key.toUpperCase() : key;
  parts.push(keyDisplay);
  return parts.join(isMac ? "" : "+");
}
