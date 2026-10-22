import type { ReactNode } from "react";

type AgendaCardStackProps = {
  /** Total agendas in this assembly. */
  agendaCount: number;
  /** Zero-based index of the active agenda. */
  agendaIndex: number;
  children: ReactNode;
};

/**
 * Figma sheets, item 1 first. Shown from `sm` up; hidden on mobile.
 */
const SHEETS = [
  { width: 250, height: 575, angle: -2 },
  { width: 250, height: 550, angle: -4 },
  { width: 250, height: 535, angle: -6 },
  { width: 250, height: 520, angle: -8 },
  { width: 250, height: 505, angle: -10 },
] as const;

const SHEET_RADIUS_PX = 10;

function visibleCount(count: number) {
  return Math.min(Math.max(0, count), SHEETS.length);
}

function Sheet({ depth, side }: { depth: number; side: "start" | "end" }) {
  const sheet = SHEETS[depth - 1];
  if (!sheet) return null;
  const fromLeft = side === "end";

  return (
    <span
      aria-hidden
      className="pointer-events-none absolute bg-[#0485F7] opacity-10 mix-blend-multiply"
      style={{
        width: sheet.width,
        height: sheet.height,
        bottom: 0,
        borderRadius: SHEET_RADIUS_PX,
        transform: `rotate(${fromLeft ? sheet.angle : -sheet.angle}deg)`,
        transformOrigin: fromLeft ? "left bottom" : "right bottom",
        zIndex: SHEETS.length - depth,
        ...(fromLeft ? { left: 0 } : { right: 0 }),
      }}
    />
  );
}

/**
 * Agenda deck. Fan sheets only on desktop; mobile is a plain sized wrapper.
 */
export function AgendaCardStack({ agendaCount, agendaIndex, children }: AgendaCardStackProps) {
  const ahead = visibleCount(agendaCount - agendaIndex - 1);
  const behind = visibleCount(agendaIndex);

  return (
    <div className="relative h-[min(724px,calc(100dvh-11rem))] w-full max-w-none shrink overflow-visible sm:h-[608px] sm:max-w-[468px]">
      <div className="pointer-events-none absolute inset-0 hidden overflow-visible sm:block">
        {Array.from({ length: ahead }, (_, index) => (
          <Sheet key={`next-${ahead - index}`} depth={ahead - index} side="start" />
        ))}
        {Array.from({ length: behind }, (_, index) => (
          <Sheet key={`prev-${behind - index}`} depth={behind - index} side="end" />
        ))}
      </div>

      <div className="relative z-10 h-full  w-full">{children}</div>
    </div>
  );
}
