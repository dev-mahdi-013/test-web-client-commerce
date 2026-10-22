import type { ReactNode } from "react";

export function CardCarousel({ children }: { children: ReactNode }) {
  return (
    <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-3 *:w-full *:shrink-0 *:snap-center 2xl:max-h-[720px] 2xl:snap-none 2xl:flex-col 2xl:overflow-x-hidden 2xl:overflow-y-auto 2xl:pb-0">
      {children}
    </div>
  );
}
