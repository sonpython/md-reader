import { create } from 'zustand'
import { Tab, FileNode, EditorState } from '../types'

// LocalStorage keys
const STORAGE_KEYS = {
  LAST_FOLDER: 'md-reader-last-folder',
  THEME: 'md-reader-theme',
  AUTO_SAVE: 'md-reader-auto-save'
}

// Load persisted state
const loadPersistedState = () => {
  try {
    const lastFolder = localStorage.getItem(STORAGE_KEYS.LAST_FOLDER)
    const theme = localStorage.getItem(STORAGE_KEYS.THEME) as 'light' | 'dark' | null
    const autoSave = localStorage.getItem(STORAGE_KEYS.AUTO_SAVE)

    return {
      lastFolder: lastFolder || null,
      theme: theme || 'dark',
      autoSaveEnabled: autoSave !== null ? autoSave === 'true' : true
    }
  } catch {
    return { lastFolder: null, theme: 'dark' as const, autoSaveEnabled: true }
  }
}

interface EditorActions {
  // Tab actions
  addTab: (tab: Omit<Tab, 'id'>) => void
  closeTab: (tabId: string) => void
  setActiveTab: (tabId: string) => void
  updateTabContent: (tabId: string, content: string) => void
  markTabSaved: (tabId: string, filePath?: string) => void

  // UI actions
  toggleSidebar: () => void
  togglePreview: () => void
  toggleEditor: () => void
  toggleTheme: () => void
  toggleSearch: () => void
  toggleAutoSave: () => void

  // File tree actions
  setCurrentFolder: (folder: string | null) => void
  setFileTree: (tree: FileNode[]) => void

  // External file update (reload without marking modified)
  reloadTabContent: (filePath: string, content: string) => void

  // Persistence
  getLastFolder: () => string | null
}

const generateId = () => Math.random().toString(36).substring(2, 9)

const persisted = loadPersistedState()

export const useEditorStore = create<EditorState & EditorActions>((set, get) => ({
  // Initial state
  tabs: [],
  activeTabId: null,
  sidebarOpen: true,
  previewOpen: true,
  editorOpen: true,
  theme: persisted.theme,
  currentFolder: null,
  fileTree: [],
  searchOpen: false,
  autoSaveEnabled: persisted.autoSaveEnabled,

  // Tab actions
  addTab: (tab) => {
    const existingTab = get().tabs.find(t => t.filePath === tab.filePath && tab.filePath !== null)
    if (existingTab) {
      set({ activeTabId: existingTab.id })
      return
    }

    const newTab: Tab = {
      ...tab,
      id: generateId()
    }
    set((state) => ({
      tabs: [...state.tabs, newTab],
      activeTabId: newTab.id
    }))
  },

  closeTab: (tabId) => {
    const state = get()
    const tabIndex = state.tabs.findIndex(t => t.id === tabId)
    const newTabs = state.tabs.filter(t => t.id !== tabId)

    let newActiveId = state.activeTabId
    if (state.activeTabId === tabId) {
      if (newTabs.length === 0) {
        newActiveId = null
      } else if (tabIndex >= newTabs.length) {
        newActiveId = newTabs[newTabs.length - 1].id
      } else {
        newActiveId = newTabs[tabIndex].id
      }
    }

    set({
      tabs: newTabs,
      activeTabId: newActiveId
    })
  },

  setActiveTab: (tabId) => set({ activeTabId: tabId }),

  updateTabContent: (tabId, content) => {
    set((state) => ({
      tabs: state.tabs.map(tab =>
        tab.id === tabId
          ? { ...tab, content, isModified: true }
          : tab
      )
    }))
  },

  markTabSaved: (tabId, filePath) => {
    set((state) => ({
      tabs: state.tabs.map(tab =>
        tab.id === tabId
          ? {
              ...tab,
              isModified: false,
              filePath: filePath ?? tab.filePath,
              fileName: filePath ? filePath.split('/').pop() || tab.fileName : tab.fileName
            }
          : tab
      )
    }))
  },

  // UI actions
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  togglePreview: () => set((state) => {
    // Guard: prevent both panels from being closed
    if (state.previewOpen && !state.editorOpen) return state
    return { previewOpen: !state.previewOpen }
  }),
  toggleEditor: () => set((state) => {
    // Guard: prevent both panels from being closed
    if (state.editorOpen && !state.previewOpen) return state
    return { editorOpen: !state.editorOpen }
  }),
  toggleTheme: () => {
    set((state) => {
      const newTheme = state.theme === 'dark' ? 'light' : 'dark'
      // Update both dark and light classes
      document.documentElement.classList.remove('dark', 'light')
      document.documentElement.classList.add(newTheme)
      // Persist theme
      localStorage.setItem(STORAGE_KEYS.THEME, newTheme)
      return { theme: newTheme }
    })
  },
  toggleSearch: () => set((state) => ({ searchOpen: !state.searchOpen })),
  toggleAutoSave: () => {
    set((state) => {
      const newValue = !state.autoSaveEnabled
      // Persist auto-save setting
      localStorage.setItem(STORAGE_KEYS.AUTO_SAVE, String(newValue))
      return { autoSaveEnabled: newValue }
    })
  },

  // File tree actions
  setCurrentFolder: (folder) => {
    // Persist last folder
    if (folder) {
      localStorage.setItem(STORAGE_KEYS.LAST_FOLDER, folder)
    }
    set({ currentFolder: folder })
  },
  setFileTree: (tree) => set({ fileTree: tree }),

  // Reload tab content from external change (only if not modified by user)
  reloadTabContent: (filePath, content) => {
    set((state) => ({
      tabs: state.tabs.map(tab =>
        tab.filePath === filePath && !tab.isModified
          ? { ...tab, content }
          : tab
      )
    }))
  },

  // Persistence
  getLastFolder: () => {
    try {
      return localStorage.getItem(STORAGE_KEYS.LAST_FOLDER)
    } catch {
      return null
    }
  }
}))
