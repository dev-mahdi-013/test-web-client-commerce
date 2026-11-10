import { MagnifierIcon } from "@solar-icons/react/linear/magnifier";
import { FieldError, Input, TextField } from "@heroui/react";
import { cn } from "@/lib/cn";

type SearchFieldProps = {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
  autoFocus?: boolean;
  errorMessage?: string | null;
  /** The compact muted field dialogs use instead of the white field of the list headers. */
  isMuted?: boolean;
  rounded?: "full" | "xl";
};

export function SearchField({
  value,
  onChange,
  className,
  placeholder = "جستجو",
  autoFocus,
  errorMessage,
  isMuted = false,
  rounded = "full",
}: SearchFieldProps) {
  return (
    <div className={cn("relative ", className)}>
      <TextField
        aria-label={placeholder}
        autoFocus={autoFocus}
        className="w-full"
        isInvalid={!!errorMessage}
        value={value}
        onChange={onChange}
      >
        <Input
          className={cn(
            rounded === "full" ? "rounded-full" : "rounded-xl",
            "ps-9 text-sm shadow-none",
            isMuted ? "h-9 bg-(--field-muted)" : "h-10 bg-white",
          )}
          placeholder={placeholder}
        />
        {/* Overlaid rather than stacked, so the hint never pushes the toolbar or the list down. */}
        <FieldError className="pointer-events-none absolute start-0 top-full z-20 mt-1 w-max max-w-full rounded-lg bg-white px-2 py-1 shadow-(--box-shadow)">
          {errorMessage}
        </FieldError>
      </TextField>
      <MagnifierIcon
        className={cn("pointer-events-none absolute start-3 size-4 -translate-y-1/2 text-muted", isMuted ? "top-[18px]" : "top-5")}
      />
    </div>
  );
}
