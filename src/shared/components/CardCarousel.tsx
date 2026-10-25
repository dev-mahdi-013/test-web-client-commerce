import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type CardCarouselProps = {
  children: ReactNode;
  /**
   * Horizontal row where a slice of the next card is always visible, so it is clear the row scrolls:
   * one card + a peek in narrow panels, two cards + a peek once the panel is wide.
   */
  peek?: boolean;
  /** Layout from `2xl`, where the panel is a fixed side column: stacked scrolling list, or a 2-column grid. */
  wideLayout?: "column" | "grid";
};

const defaultClassName =
  "flex snap-x snap-mandatory gap-6 overflow-x-auto pb-3 *:w-full *:shrink-0 *:snap-center 2xl:max-h-[720px] 2xl:snap-none 2xl:flex-col 2xl:overflow-x-hidden 2xl:overflow-y-auto 2xl:pb-0";

// Card width = 400px, or the whole panel when that is narrower (from `2xl` the cards fill the fixed side column).
// As many cards as fit are shown, with a peek of the next one; on phones the row bleeds into the panel padding.
const peekClassName =
  "flex items-start snap-x snap-mandatory gap-4 overflow-x-auto pb-3 max-sm:-mx-3 max-sm:scroll-px-3 max-sm:px-3 *:w-[min(100%,25rem)] *:shrink-0 *:snap-start 2xl:snap-none 2xl:overflow-x-hidden 2xl:pb-0 2xl:*:w-full 2xl:*:min-w-0";

export function CardCarousel({ children, peek = false, wideLayout = "column" }: CardCarouselProps) {
  if (!peek) return <div className={defaultClassName}>{children}</div>;

  return (
    <div
      className={cn(
        peekClassName,
        wideLayout === "grid"
          ? "2xl:grid 2xl:grid-cols-2"
          : "2xl:max-h-[720px] 2xl:min-h-0 2xl:flex-1 2xl:flex-col 2xl:overflow-y-auto",
      )}
    >
      {children}
    </div>
  );
}
