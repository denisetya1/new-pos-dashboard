import { create } from "zustand";

interface sidebarToggle {
  collapsed: boolean;
  toggleCollapse: () => void;
}

export const useSidebarToggle = create<sidebarToggle>((set) => ({
  collapsed: false,
  toggleCollapse: () => set((state) => ({ collapsed: !state.collapsed })),
}));
