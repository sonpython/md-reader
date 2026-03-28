export interface FileNode {
  name: string
  path: string
  isDirectory: boolean
  children?: FileNode[]
}

export interface Tab {
  id: string
  filePath: string | null
  fileName: string
  content: string
  isModified: boolean
}

export interface EditorState {
  tabs: Tab[]
  activeTabId: string | null
  sidebarOpen: boolean
  previewOpen: boolean
  theme: 'light' | 'dark'
  currentFolder: string | null
  fileTree: FileNode[]
  searchOpen: boolean
  autoSaveEnabled: boolean
}

declare global {
  interface Window {
    electron: {
      openFileDialog: () => Promise<{ path: string; content: string } | null>
      openFolderDialog: () => Promise<string | null>
      readFile: (filePath: string) => Promise<{ success: boolean; content?: string; error?: string }>
      saveFile: (filePath: string, content: string) => Promise<{ success: boolean; error?: string }>
      saveFileDialog: (content: string) => Promise<string | null>
      readDirectory: (dirPath: string) => Promise<FileNode[]>
      exportPdf: (htmlContent: string) => Promise<{ success: boolean; path?: string }>
      onMenuEvent: (channel: string, callback: () => void) => () => void
      onFileOpenFromOS: (callback: (filePath: string) => void) => () => void
      // File watcher
      startFolderWatcher: (folderPath: string) => Promise<void>
      watchFile: (filePath: string) => Promise<void>
      unwatchFile: (filePath: string) => Promise<void>
      onFolderChanged: (callback: () => void) => () => void
      onFileChanged: (callback: (filePath: string) => void) => () => void
      onFileDeleted: (callback: (filePath: string) => void) => () => void
    }
  }
}
