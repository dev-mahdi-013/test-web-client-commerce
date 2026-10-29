import { useCallback, useSyncExternalStore } from "react";

const subscribe = (query: string, onChange: () => void) => {
  const mediaQueryList = window.matchMedia(query);
  mediaQueryList.addEventListener("change", onChange);

  return () => mediaQueryList.removeEventListener("change", onChange);
};

/**
 * Tracks a CSS media query so a page can render a dedicated layout per breakpoint
 * instead of hiding one of two trees in the DOM.
 */
export function useMediaQuery(query: string): boolean {
  const subscribeToQuery = useCallback((onChange: () => void) => subscribe(query, onChange), [query]);
  const getSnapshot = useCallback(() => window.matchMedia(query).matches, [query]);

  return useSyncExternalStore(subscribeToQuery, getSnapshot, () => false);
}
