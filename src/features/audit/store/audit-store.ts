import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AuditEntry } from '../types/audit'

const MAX_ENTRIES = 500

interface AuditStoreState {
  entries: AuditEntry[]
  log: (entry: Omit<AuditEntry, 'id' | 'timestamp'>) => void
  clear: () => void
}

export const useAuditStore = create<AuditStoreState>()(
  persist(
    (set) => ({
      entries: [],
      log: (entry) =>
        set((state) => ({
          entries: [
            { ...entry, id: crypto.randomUUID(), timestamp: new Date().toISOString() },
            ...state.entries,
          ].slice(0, MAX_ENTRIES),
        })),
      clear: () => set({ entries: [] }),
    }),
    { name: 'mockops-audit' },
  ),
)
