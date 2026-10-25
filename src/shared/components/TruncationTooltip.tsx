import { Tooltip } from "@heroui/react";
import type { ReactNode } from "react";

type TruncationTooltipProps = {
  /** The full value, shown in the tooltip on hover. */
  content: ReactNode;
  children: ReactNode;
};

/** Wraps a card value so hovering it shows the full value in a HeroUI tooltip, whether or not it is cut off. */
export function TruncationTooltip({ content, children }: TruncationTooltipProps) {
  return (
    <Tooltip delay={300}>
      <Tooltip.Trigger className="block max-w-full min-w-0">{children}</Tooltip.Trigger>
      <Tooltip.Content>{content}</Tooltip.Content>
    </Tooltip>
  );
}
