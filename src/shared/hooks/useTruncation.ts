import { useLayoutEffect, useRef, useState } from "react";

function isOverflowing(el: HTMLElement) {
  return el.scrollWidth > el.clientWidth + 1;
}

/**
 * Tracks whether a single-line truncated element is cut off.
 * - `isTruncated` is true while the text is cut off, so a tooltip with the full text can be shown.
 * - `dir` is "ltr" while cut off (when `ltrWhenTruncated`), so the ellipsis sits on the right.
 */
export function useTruncation<T extends HTMLElement>(ltrWhenTruncated: boolean, contentKey?: string) {
  const ref = useRef<T>(null);
  const [isTruncated, setTruncated] = useState(false);
  const [dir, setDir] = useState<"ltr" | undefined>();

  // Re-check after every render, since the text may have changed without a resize.
  useLayoutEffect(() => {
    const el = ref.current;
    if (el) setTruncated(isOverflowing(el));
  });

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const update = () => {
      const overflowing = isOverflowing(el);
      setTruncated(overflowing);
      setDir(ltrWhenTruncated && overflowing ? "ltr" : undefined);
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [ltrWhenTruncated, contentKey]);

  return { ref, dir, isTruncated };
}
