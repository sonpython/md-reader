import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron'

export interface FileData {
  path: string
  content: string
}

export interface FileNode {
  name: string
  path: string
  isDirectory: boolean
  children?: FileNode[]
}

export interface ElectronAPI {
  openFileDialog: () => Promise<FileData | null>
  openFolderDialog: () => Promise<string | null>
  readFile: (filePath: string) => Promise<{ success: boolean; content?: string; error?: string }>
  saveFile: (filePath: string, content: string) => Promise<{ success: boolean; error?: string }>
  saveFileDialog: (content: string) => Promise<string | null>
  readDirectory: (dirPath: string) => Promise<FileNode[]>
  exportPdf: (htmlContent: string) => Promise<{ success: boolean; path?: string }>
  onMenuEvent: (channel: string, callback: () => void) => () => void
  onFileOpenFromOS: (callback: (filePath: string) => void) => () => void
  // File watcher methods
  startFolderWatcher: (folderPath: string) => Promise<void>
  watchFile: (filePath: string) => Promise<void>
  unwatchFile: (filePath: string) => Promise<void>
  onFolderChanged: (callback: () => void) => () => void
  onFileChanged: (callback: (filePath: string) => void) => () => void
  onFileDeleted: (callback: (filePath: string) => void) => () => void
}

const electronAPI: ElectronAPI = {
  openFileDialog: () => ipcRenderer.invoke('file:open-dialog'),
  openFolderDialog: () => ipcRenderer.invoke('file:open-folder-dialog'),
  readFile: (filePath: string) => ipcRenderer.invoke('file:read', filePath),
  saveFile: (filePath: string, content: string) => ipcRenderer.invoke('file:save', filePath, content),
  saveFileDialog: (content: string) => ipcRenderer.invoke('file:save-dialog', content),
  readDirectory: (dirPath: string) => ipcRenderer.invoke('file:read-dir', dirPath),
  exportPdf: (htmlContent: string) => ipcRenderer.invoke('file:export-pdf', htmlContent),
  onMenuEvent: (channel: string, callback: () => void) => {
    const handler = (_event: IpcRendererEvent) => callback()
    ipcRenderer.on(channel, handler)
    return () => ipcRenderer.removeListener(channel, handler)
  },
  onFileOpenFromOS: (callback: (filePath: string) => void) => {
    const handler = (_event: IpcRendererEvent, filePath: string) => callback(filePath)
    ipcRenderer.on('file:open-from-os', handler)
    return () => ipcRenderer.removeListener('file:open-from-os', handler)
  },
  // File watcher methods
  startFolderWatcher: (folderPath: string) => ipcRenderer.invoke('watcher:start-folder', folderPath),
  watchFile: (filePath: string) => ipcRenderer.invoke('watcher:watch-file', filePath),
  unwatchFile: (filePath: string) => ipcRenderer.invoke('watcher:unwatch-file', filePath),
  onFolderChanged: (callback: () => void) => {
    const handler = () => callback()
    ipcRenderer.on('watcher:folder-changed', handler)
    return () => ipcRenderer.removeListener('watcher:folder-changed', handler)
  },
  onFileChanged: (callback: (filePath: string) => void) => {
    const handler = (_event: IpcRendererEvent, filePath: string) => callback(filePath)
    ipcRenderer.on('watcher:file-changed', handler)
    return () => ipcRenderer.removeListener('watcher:file-changed', handler)
  },
  onFileDeleted: (callback: (filePath: string) => void) => {
    const handler = (_event: IpcRendererEvent, filePath: string) => callback(filePath)
    ipcRenderer.on('watcher:file-deleted', handler)
    return () => ipcRenderer.removeListener('watcher:file-deleted', handler)
  }
}

contextBridge.exposeInMainWorld('electron', electronAPI)
