import { createPortal } from "react-dom";

type BlurBackdropProps = {
  isOpen: boolean;
};

/** Same look as HeroUI's `Modal.Backdrop variant="blur"`, for overlays that have no backdrop (e.g. Popover). */
export function BlurBackdrop({ isOpen }: BlurBackdropProps) {
  if (!isOpen) return null;

  return createPortal(
    <div
      aria-hidden
      className="animate-fade-in pointer-events-none fixed inset-0 z-[calc(var(--z-index-overlay)-1)] bg-backdrop backdrop-blur-md"
    />,
    document.body,
  );
}
