import { create } from 'zustand';

interface UIState {
  isOnline: boolean;
  pendingSyncCount: number;
  sidebarOpen: boolean;
  selectedSiteId: string | null;
  selectedPeriod: 'today' | 'week' | 'month';

  setOnline: (online: boolean) => void;
  setPendingSyncCount: (count: number) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setSelectedSiteId: (id: string | null) => void;
  setSelectedSite: (id: string | null) => void;
  setSelectedPeriod: (period: 'today' | 'week' | 'month') => void;
}

export const useUIStore = create<UIState>((set) => ({
  isOnline: navigator.onLine,
  pendingSyncCount: 0,
  sidebarOpen: true,
  selectedSiteId: null,
  selectedPeriod: 'today',

  setOnline: (isOnline) => set({ isOnline }),
  setPendingSyncCount: (pendingSyncCount) => set({ pendingSyncCount }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  setSelectedSiteId: (selectedSiteId) => set({ selectedSiteId }),
  setSelectedSite: (selectedSiteId) => set({ selectedSiteId }),
  setSelectedPeriod: (selectedPeriod) => set({ selectedPeriod }),
}));
