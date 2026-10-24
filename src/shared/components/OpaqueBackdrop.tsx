import { createPortal } from "react-dom";

type OpaqueBackdropProps = {
  isOpen: boolean;
};

/** Same look as HeroUI's opaque modal backdrop, for overlays without a built-in backdrop. */
export function OpaqueBackdrop({ isOpen }: OpaqueBackdropProps) {
  if (!isOpen) return null;

  return createPortal(
    <div
      aria-hidden
      className="animate-fade-in pointer-events-none fixed inset-0 z-[calc(var(--z-index-overlay)-1)] bg-backdrop"
    />,
    document.body,
  );
}
