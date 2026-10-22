import { useLayoutEffect, useRef, useState } from "react";

/**
 * Applies `dir="ltr"` only while the element is overflowing, so CSS ellipsis
 * appears on the right. When the text fits, direction stays inherited (RTL).
 */
export function useLtrEllipsisWhenTruncated(enabled: boolean, contentKey?: string) {
  const ref = useRef<HTMLParagraphElement>(null);
  const [dir, setDir] = useState<"ltr" | undefined>();

  useLayoutEffect(() => {
    if (!enabled) {
      setDir(undefined);
      return;
    }

    const el = ref.current;
    if (!el) return;

    const update = () => {
      setDir(el.scrollWidth > el.clientWidth + 1 ? "ltr" : undefined);
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [enabled, contentKey]);

  return { ref, dir };
}
