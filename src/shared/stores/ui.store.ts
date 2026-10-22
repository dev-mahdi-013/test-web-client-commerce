import type { ReactNode } from "react";
import { create } from "zustand";

type UiState = {
  isMobileNavOpen: boolean;
  setMobileNavOpen: (isOpen: boolean) => void;
  /** Page-owned controls rendered next to the notification bell. */
  headerActions: ReactNode | null;
  setHeaderActions: (actions: ReactNode | null) => void;
};

export const useUiStore = create<UiState>()((set) => ({
  isMobileNavOpen: false,
  setMobileNavOpen: (isMobileNavOpen) => set({ isMobileNavOpen }),
  headerActions: null,
  setHeaderActions: (headerActions) => set({ headerActions }),
}));
