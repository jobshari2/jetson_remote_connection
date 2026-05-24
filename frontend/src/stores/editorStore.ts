import { create } from 'zustand'

interface EditorStore {
  openFiles: { path: string; content: string }[]
  activeFile: string | null
  openFile: (path: string, content: string) => void
  closeFile: (path: string) => void
  setActiveFile: (path: string | null) => void
  updateFileContent: (path: string, content: string) => void
}

export const useEditorStore = create<EditorStore>((set, get) => ({
  openFiles: [],
  activeFile: null,

  openFile: (path, content) => {
    const exists = get().openFiles.find(f => f.path === path)
    if (!exists) {
      set(state => ({ openFiles: [...state.openFiles, { path, content }], activeFile: path }))
    } else {
      set({ activeFile: path })
    }
  },

  closeFile: (path) => {
    set(state => {
      const files = state.openFiles.filter(f => f.path !== path)
      const activeFile = state.activeFile === path
        ? (files.length > 0 ? files[files.length - 1].path : null)
        : state.activeFile
      return { openFiles: files, activeFile }
    })
  },

  setActiveFile: (path) => set({ activeFile: path }),

  updateFileContent: (path, content) => {
    set(state => ({
      openFiles: state.openFiles.map(f => f.path === path ? { ...f, content } : f),
    }))
  },
}))
