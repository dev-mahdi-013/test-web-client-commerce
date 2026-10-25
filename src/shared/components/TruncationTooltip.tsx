import { Tooltip } from "@heroui/react";
import type { ReactNode } from "react";

type TruncationTooltipProps = {
  /** Shows the tooltip only while the wrapped text is cut off. */
  isTruncated: boolean;
  /** The full value, shown in the tooltip. */
  content: ReactNode;
  children: ReactNode;
};

/** Wraps a single-line truncated value so hovering it shows the full value in a HeroUI tooltip. */
export function TruncationTooltip({ isTruncated, content, children }: TruncationTooltipProps) {
  return (
    <Tooltip delay={300} isDisabled={!isTruncated}>
      <Tooltip.Trigger className="block max-w-full min-w-0">{children}</Tooltip.Trigger>
      <Tooltip.Content>{content}</Tooltip.Content>
    </Tooltip>
  );
}
