import { create } from "zustand";

interface mobileSidebarToggle {
  mobileOpen: boolean;
  toggleMobileOpen: () => void;
}

export const useMobileSidebarToggle = create<mobileSidebarToggle>((set) => ({
  mobileOpen: false,
  toggleMobileOpen: () =>
    set((state) => {
      return { mobileOpen: !state.mobileOpen };
    }),
}));
