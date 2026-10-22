import { AddCircleIcon } from "@solar-icons/react/linear/add-circle";
import { cn } from "@/lib/cn";

type AddCardTileProps = {
  onPress: () => void;
  className?: string;
};

export function AddCardTile({ onPress, className }: AddCardTileProps) {
  return (
    <button
      aria-label="افزودن کارت"
      className={cn(
        "flex h-full min-h-[188px] w-full shrink-0 cursor-pointer flex-col items-center justify-center gap-2 rounded-[20px] border-2 border-dashed border-(--panel-border) text-sm text-muted transition-colors hover:bg-white/60",
        className,
      )}
      type="button"
      onClick={onPress}
    >
      <AddCircleIcon className="size-7" />
      افزودن کارت
    </button>
  );
}
