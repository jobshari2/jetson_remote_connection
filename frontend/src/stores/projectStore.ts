import { create } from 'zustand'
import type { Project, ProjectFile } from '../types'

interface ProjectStore {
  projects: Project[]
  currentProject: Project | null
  files: ProjectFile[]
  loading: boolean
  fetchProjects: () => Promise<void>
  createProject: (name: string, description: string, runtime: string) => Promise<Project | null>
  deleteProject: (id: string) => Promise<void>
  duplicateProject: (id: string) => Promise<void>
  setCurrentProject: (project: Project | null) => void
  fetchFiles: (projectId: string, path?: string) => Promise<void>
}

const BASE = '/api'

export const useProjectStore = create<ProjectStore>((set, get) => ({
  projects: [],
  currentProject: null,
  files: [],
  loading: false,

  fetchProjects: async () => {
    set({ loading: true })
    try {
      const res = await fetch(`${BASE}/projects`)
      const projects = await res.json()
      set({ projects, loading: false })
    } catch {
      set({ loading: false })
    }
  },

  createProject: async (name, description, runtime) => {
    try {
      const res = await fetch(`${BASE}/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, runtime }),
      })
      const project = await res.json()
      await get().fetchProjects()
      return project
    } catch {
      return null
    }
  },

  deleteProject: async (id) => {
    await fetch(`${BASE}/projects/${id}`, { method: 'DELETE' })
    await get().fetchProjects()
    if (get().currentProject?.id === id) {
      set({ currentProject: null, files: [] })
    }
  },

  duplicateProject: async (id) => {
    await fetch(`${BASE}/projects/${id}/duplicate`, { method: 'POST' })
    await get().fetchProjects()
  },

  setCurrentProject: (project) => set({ currentProject: project }),

  fetchFiles: async (projectId, path = '') => {
    try {
      const res = await fetch(`${BASE}/projects/${projectId}/files?path=${encodeURIComponent(path)}`)
      const files = await res.json()
      set({ files })
    } catch {
      set({ files: [] })
    }
  },
}))
