"use client";

import { useCallback, useSyncExternalStore } from "react";
import {
  applyThemeAttribute,
  getEffectiveTheme,
  setStoredTheme,
  type Theme,
} from "@/lib/theme";

const listeners = new Set<() => void>();

function notify() {
  for (const l of listeners) l();
}

function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  let mq: MediaQueryList | null = null;
  const onMq = () => cb();
  if (typeof window !== "undefined") {
    mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener?.("change", onMq);
  }
  return () => {
    listeners.delete(cb);
    if (mq) mq.removeEventListener?.("change", onMq);
  };
}

function getServerSnapshot(): Theme {
  return "light";
}

export interface UseThemeResult {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

export function useTheme(): UseThemeResult {
  const theme = useSyncExternalStore(subscribe, getEffectiveTheme, getServerSnapshot);

  const setTheme = useCallback((next: Theme) => {
    setStoredTheme(next);
    applyThemeAttribute(next);
    notify();
  }, []);

  const toggleTheme = useCallback(() => {
    const next: Theme = getEffectiveTheme() === "dark" ? "light" : "dark";
    setStoredTheme(next);
    applyThemeAttribute(next);
    notify();
  }, []);

  return { theme, toggleTheme, setTheme };
}
