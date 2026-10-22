import { useLayoutEffect, useState, type RefObject } from "react";

type Placement = "bottom" | "top";

const OFFSET = 8;

export function useAutoPopoverPlacement(
  isOpen: boolean,
  triggerRef: RefObject<HTMLElement | null>,
  contentRef: RefObject<HTMLElement | null>,
) {
  const [placement, setPlacement] = useState<Placement>("bottom");
  const [maxHeight, setMaxHeight] = useState<number>();

  useLayoutEffect(() => {
    if (!isOpen) return;

    const updatePlacement = () => {
      const trigger = triggerRef.current;
      const content = contentRef.current;
      if (!trigger || !content) return;

      const viewport = window.visualViewport;
      const viewportTop = viewport?.offsetTop ?? 0;
      const viewportBottom = viewportTop + (viewport?.height ?? window.innerHeight);
      const triggerRect = trigger.getBoundingClientRect();
      const contentHeight = Math.max(content.scrollHeight, content.getBoundingClientRect().height);
      const spaceAbove = Math.max(0, triggerRect.top - viewportTop - OFFSET);
      const spaceBelow = Math.max(0, viewportBottom - triggerRect.bottom - OFFSET);
      const nextPlacement: Placement =
        spaceBelow >= contentHeight || spaceBelow >= spaceAbove ? "bottom" : "top";
      const availableSpace = nextPlacement === "bottom" ? spaceBelow : spaceAbove;

      setPlacement(nextPlacement);
      setMaxHeight(availableSpace);
    };

    updatePlacement();
    window.addEventListener("resize", updatePlacement);
    document.addEventListener("scroll", updatePlacement, true);
    window.visualViewport?.addEventListener("resize", updatePlacement);
    window.visualViewport?.addEventListener("scroll", updatePlacement);
    const resizeObserver = new ResizeObserver(updatePlacement);
    if (triggerRef.current) resizeObserver.observe(triggerRef.current);
    if (contentRef.current) resizeObserver.observe(contentRef.current);

    return () => {
      window.removeEventListener("resize", updatePlacement);
      document.removeEventListener("scroll", updatePlacement, true);
      window.visualViewport?.removeEventListener("resize", updatePlacement);
      window.visualViewport?.removeEventListener("scroll", updatePlacement);
      resizeObserver.disconnect();
    };
  }, [contentRef, isOpen, triggerRef]);

  return { maxHeight, placement };
}
