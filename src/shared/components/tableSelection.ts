/** HeroUI paints every cell, so the active row is highlighted on its cells rather than the row itself. */
export const selectableRowClassName = "cursor-pointer data-[selected=true]:*:bg-accent-soft";

/** Controlled single-select keys for HeroUI / React Aria menus (radio-style items). */
export function singleSelectedKeys(value: string | null | undefined) {
  return value ? new Set([value]) : new Set<string>();
}

export function singleSelectionProps(selectedId: string | null, onSelect: (id: string) => void) {
  return {
    selectionMode: "single" as const,
    selectionBehavior: "replace" as const,
    disallowEmptySelection: true,
    selectedKeys: singleSelectedKeys(selectedId),
    onSelectionChange: (keys: "all" | Set<string | number>) => {
      if (keys === "all") return;
      const [key] = keys;
      if (key !== undefined) onSelect(String(key));
    },
  };
}
