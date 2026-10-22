import { cn } from "@/lib/cn";

type TruncatedTextProps = {
  value: string;
  /** Longest string shown before the text is cut. */
  maxChars: number;
  className?: string;
};

/** Shows at most `maxChars` characters and keeps the full text in the hover tooltip. */
export function TruncatedText({ value, maxChars, className }: TruncatedTextProps) {
  const isTruncated = value.length > maxChars;
  const displayValue = isTruncated ? `${value.slice(0, maxChars).trimEnd()}…` : value;

  return (
    <span className={cn("inline-block max-w-[160px] truncate", className)} title={isTruncated ? value : undefined}>
      {displayValue}
    </span>
  );
}
