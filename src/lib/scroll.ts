/** Brings a section into view on layouts where it is stacked away from the control that changed it. */
export function revealOnStackedLayout(element: HTMLElement | null) {
  if (!element || window.matchMedia("(min-width: 96rem)").matches) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  element.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
}
