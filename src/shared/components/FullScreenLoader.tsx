import { BrandAvatar } from "./BrandAvatar";

/**
 * Covers the whole viewport while the app boots or prepares the pages the user is about to open.
 * Looks the same as the static splash in index.html (that file defines the boot-* classes), so the swap is invisible.
 */
export function FullScreenLoader() {
  return (
    <div aria-busy="true" aria-live="polite" className="boot-loader" role="status">
      <BrandAvatar />
      <span className="boot-spinner" />
      <span className="sr-only">در حال آماده‌سازی…</span>
    </div>
  );
}
