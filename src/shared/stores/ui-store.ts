import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Theme = 'light' | 'dark' | 'system'

interface UiStoreState {
  theme: Theme
  sidebarCollapsed: boolean
  commandPaletteOpen: boolean
  setTheme: (theme: Theme) => void
  toggleSidebar: () => void
  setCommandPaletteOpen: (open: boolean) => void
}

export const useUiStore = create<UiStoreState>()(
  persist(
    (set) => ({
      theme: 'system',
      sidebarCollapsed: false,
      commandPaletteOpen: false,
      setTheme: (theme) => set({ theme }),
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
    }),
    { name: 'mockops-ui' },
  ),
)
