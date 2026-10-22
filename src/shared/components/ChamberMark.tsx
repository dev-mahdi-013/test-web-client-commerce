import chamberMarkUrl from "@/assets/images/card/chamber-mark.svg";
import { cn } from "@/lib/cn";

type ChamberMarkProps = {
  className?: string;
};

export function ChamberMark({ className }: ChamberMarkProps) {
  return (
    <img
      alt=""
      aria-hidden
      className={cn("shrink-0 drop-shadow-[1px_8px_6px_rgb(0_0_0/0.06)]", className)}
      draggable={false}
      src={chamberMarkUrl}
    />
  );
}
