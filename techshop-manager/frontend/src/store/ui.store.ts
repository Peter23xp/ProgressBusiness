import { create } from 'zustand';

interface UIState {
  isOnline: boolean;
  pendingSyncCount: number;
  sidebarOpen: boolean;
  selectedSiteId: string | null;

  setOnline: (online: boolean) => void;
  setPendingSyncCount: (count: number) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setSelectedSiteId: (id: string | null) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isOnline: navigator.onLine,
  pendingSyncCount: 0,
  sidebarOpen: true,
  selectedSiteId: null,

  setOnline: (isOnline) => set({ isOnline }),
  setPendingSyncCount: (pendingSyncCount) => set({ pendingSyncCount }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  setSelectedSiteId: (selectedSiteId) => set({ selectedSiteId }),
}));
