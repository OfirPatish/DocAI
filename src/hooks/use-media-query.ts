"use client";

import { useSyncExternalStore } from "react";

const subscribe = (query: string) => (callback: () => void) => {
  const mql = window.matchMedia(query);
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
};

const getSnapshot = (query: string): (() => boolean) => () =>
  window.matchMedia(query).matches;

const getServerSnapshot = () => false;

/**
 * Responds to CSS media queries. Returns true when the query matches.
 * SSR-safe: returns false on server, updates after hydration.
 */
export const useMediaQuery = (query: string): boolean => {
  return useSyncExternalStore(
    subscribe(query),
    getSnapshot(query),
    getServerSnapshot
  );
};
