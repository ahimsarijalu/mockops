import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ServerConfig } from '../types/server'

interface ServerStoreState {
  servers: ServerConfig[]
  activeServerId: string | null
  addServer: (server: ServerConfig) => void
  updateServer: (id: string, patch: Partial<ServerConfig>) => void
  removeServer: (id: string) => void
  setActiveServer: (id: string) => void
}

export const useServerStore = create<ServerStoreState>()(
  persist(
    (set) => ({
      servers: [],
      activeServerId: null,
      addServer: (server) =>
        set((state) => ({
          servers: [...state.servers, server],
          activeServerId: state.activeServerId ?? server.id,
        })),
      updateServer: (id, patch) =>
        set((state) => ({
          servers: state.servers.map((s) => (s.id === id ? { ...s, ...patch } : s)),
        })),
      removeServer: (id) =>
        set((state) => {
          const servers = state.servers.filter((s) => s.id !== id)
          const activeServerId =
            state.activeServerId === id ? (servers[0]?.id ?? null) : state.activeServerId
          return { servers, activeServerId }
        }),
      setActiveServer: (id) => set({ activeServerId: id }),
    }),
    { name: 'mockops-servers' },
  ),
)

export function useActiveServer(): ServerConfig | null {
  return useServerStore((state) => state.servers.find((s) => s.id === state.activeServerId) ?? null)
}
