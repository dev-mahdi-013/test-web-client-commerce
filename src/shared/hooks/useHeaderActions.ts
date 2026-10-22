import { useLayoutEffect, type ReactNode } from "react";
import { useUiStore } from "@/shared/stores/ui.store";

/** Mounts page actions beside the header bell and clears them on unmount. */
export function useHeaderActions(actions: ReactNode) {
  const setHeaderActions = useUiStore((state) => state.setHeaderActions);

  useLayoutEffect(() => {
    setHeaderActions(actions);
    return () => setHeaderActions(null);
  }, [actions, setHeaderActions]);
}
