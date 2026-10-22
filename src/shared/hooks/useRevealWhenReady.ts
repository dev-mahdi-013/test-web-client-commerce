import { useEffect, useRef } from "react";
import { revealOnStackedLayout } from "@/lib/scroll";

/**
 * Scrolls to a section once the content for the requested item has rendered.
 * `readyId` is the id whose content is currently on screen, or null while it is still loading.
 */
export function useRevealWhenReady<T extends HTMLElement>(readyId: string | null) {
  const ref = useRef<T>(null);
  const pendingId = useRef<string | null>(null);

  useEffect(() => {
    if (pendingId.current === null || pendingId.current !== readyId) return;
    pendingId.current = null;
    revealOnStackedLayout(ref.current);
  }, [readyId]);

  const requestReveal = (id: string) => {
    if (id === readyId) {
      revealOnStackedLayout(ref.current);
      return;
    }
    pendingId.current = id;
  };

  return { ref, requestReveal };
}
