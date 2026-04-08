"use client";

import { useEffect, useRef } from "react";

const STORAGE_KEY = "lyra_admin_general";
const DEFAULT_INTERVAL = 30; // seconds

function getRefreshInterval(): number {
  if (typeof window === "undefined") return DEFAULT_INTERVAL;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return DEFAULT_INTERVAL;
    const parsed = JSON.parse(saved);
    const val = parseInt(parsed.autoRefresh);
    if (isNaN(val) || val < 5) return DEFAULT_INTERVAL;
    return Math.min(val, 300);
  } catch {
    return DEFAULT_INTERVAL;
  }
}

/**
 * Calls `callback` every N seconds based on the admin's saved auto-refresh interval.
 * Pass `enabled = false` to pause (e.g. when tab is not visible).
 */
export function useAutoRefresh(callback: () => void, enabled = true) {
  const callbackRef = useRef(callback);

  // Keep ref up to date so interval always calls latest callback
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!enabled) return;

    const interval = getRefreshInterval() * 1000;

    const id = setInterval(() => {
      // Only refresh if tab is visible
      if (document.visibilityState === "visible") {
        callbackRef.current();
      }
    }, interval);

    return () => clearInterval(id);
  }, [enabled]);
}