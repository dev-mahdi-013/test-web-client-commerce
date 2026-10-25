import { useLayoutEffect, useRef, useState } from "react";

function isOverflowing(el: HTMLElement) {
  return el.scrollWidth > el.clientWidth + 1;
}

/**
 * For a single-line truncated element: while the text is cut off and `ltrWhenTruncated` is set,
 * `dir` is "ltr" so the ellipsis sits on the right.
 */
export function useTruncation<T extends HTMLElement>(ltrWhenTruncated: boolean, contentKey?: string) {
  const ref = useRef<T>(null);
  const [dir, setDir] = useState<"ltr" | undefined>();

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || !ltrWhenTruncated) {
      setDir(undefined);
      return;
    }

    const update = () => setDir(isOverflowing(el) ? "ltr" : undefined);

    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [ltrWhenTruncated, contentKey]);

  return { ref, dir };
}
