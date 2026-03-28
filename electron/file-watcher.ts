import chokidar from 'chokidar'
import path from 'path'
import { BrowserWindow } from 'electron'

// Watcher instances
let folderWatcher: chokidar.FSWatcher | null = null
let fileWatcher: chokidar.FSWatcher | null = null
let debounceTimer: NodeJS.Timeout | null = null

// Counter map: handles macOS double-event issue (chokidar fires multiple change events per write)
const recentlySavedFiles = new Map<string, number>()

/** Normalize path for consistent comparisons across platforms */
const normalizePath = (p: string) => path.resolve(p)

// --- Folder watching: detects file/dir add/remove in opened folder ---

export function startFolderWatcher(folderPath: string, window: BrowserWindow) {
  stopFolderWatcher()

  folderWatcher = chokidar.watch(folderPath, {
    ignored: /(^|[/\\])\./,  // ignore dotfiles
    persistent: true,
    ignoreInitial: true,
    depth: 10
  })

  const notifyFolderChanged = () => {
    if (debounceTimer) clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
      if (!window.isDestroyed()) {
        window.webContents.send('watcher:folder-changed')
      }
    }, 300)
  }

  folderWatcher.on('add', notifyFolderChanged)
  folderWatcher.on('unlink', notifyFolderChanged)
  folderWatcher.on('addDir', notifyFolderChanged)
  folderWatcher.on('unlinkDir', notifyFolderChanged)
}

export function stopFolderWatcher() {
  if (debounceTimer) clearTimeout(debounceTimer)
  folderWatcher?.close()
  folderWatcher = null
}

// --- File watching: detects content changes in open tabs ---

export function initFileWatcher(window: BrowserWindow) {
  if (fileWatcher) fileWatcher.close()

  fileWatcher = chokidar.watch([], {
    persistent: true,
    ignoreInitial: true
  })

  fileWatcher.on('change', (filePath: string) => {
    const normalized = normalizePath(filePath)
    // Skip events triggered by our own saves (counter handles macOS double-events)
    const count = recentlySavedFiles.get(normalized)
    if (count && count > 0) {
      if (count <= 1) {
        recentlySavedFiles.delete(normalized)
      } else {
        recentlySavedFiles.set(normalized, count - 1)
      }
      return
    }
    if (!window.isDestroyed()) {
      window.webContents.send('watcher:file-changed', filePath)
    }
  })

  fileWatcher.on('unlink', (filePath: string) => {
    if (!window.isDestroyed()) {
      window.webContents.send('watcher:file-deleted', filePath)
    }
  })
}

export function watchFile(filePath: string) {
  fileWatcher?.add(filePath)
}

export function unwatchFile(filePath: string) {
  fileWatcher?.unwatch(filePath)
}

/** Call before writing a file to prevent watcher from firing on our own save.
 *  Uses counter=2 to handle macOS double-event issue. */
export function markSavedByApp(filePath: string) {
  const normalized = normalizePath(filePath)
  recentlySavedFiles.set(normalized, 2) // 2 to absorb potential double-event
  // Auto-clear after 3s (longer than auto-save 2s debounce) in case watcher event never fires
  setTimeout(() => recentlySavedFiles.delete(normalized), 3000)
}

export function cleanup() {
  stopFolderWatcher()
  fileWatcher?.close()
  fileWatcher = null
  recentlySavedFiles.clear()
}
