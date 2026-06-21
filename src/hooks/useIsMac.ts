"use client";

import { useSyncExternalStore } from "react";
import { isMacPlatform } from "@/lib/hotkeys";

const subscribe = () => () => {};
const getServerSnapshot = () => false;

/**
 * Hydration-safe Mac detection. Returns false during SSR and the first
 * client paint so server-rendered HTML matches; after hydration the
 * actual platform value is reported, triggering a re-render where the
 * keycap can swap from "Ctrl+Z" to "⌘Z" without warnings.
 */
export function useIsMac(): boolean {
  return useSyncExternalStore(subscribe, isMacPlatform, getServerSnapshot);
}
