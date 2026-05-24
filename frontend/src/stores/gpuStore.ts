import { create } from 'zustand'
import type { GPUMetrics } from '../types'

interface GPUStore {
  metrics: GPUMetrics | null
  available: boolean
  loading: boolean
  fetchMetrics: () => Promise<void>
  fetchStatus: () => Promise<void>
}

const BASE = '/api'

export const useGPUStore = create<GPUStore>((set) => ({
  metrics: null,
  available: false,
  loading: false,

  fetchMetrics: async () => {
    try {
      const res = await fetch(`${BASE}/gpu/metrics`)
      const metrics = await res.json()
      set({ metrics })
    } catch {
      set({ metrics: null })
    }
  },

  fetchStatus: async () => {
    set({ loading: true })
    try {
      const res = await fetch(`${BASE}/gpu/status`)
      const data = await res.json()
      set({ available: data.available, loading: false })
    } catch {
      set({ available: false, loading: false })
    }
  },
}))
