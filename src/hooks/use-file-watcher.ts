import { useEffect, useMemo, useRef } from 'react'
import { useEditorStore } from '../store/editorStore'

/**
 * Listens for filesystem changes via Electron IPC:
 * - Folder changes (add/remove files) → refresh file tree
 * - File content changes → reload tab content if no unsaved edits
 * - File deletions → currently no-op (tab stays open)
 *
 * Also manages watch/unwatch for individual open files.
 */
export const useFileWatcher = () => {
  const currentFolder = useEditorStore((s) => s.currentFolder)
  const setFileTree = useEditorStore((s) => s.setFileTree)
  const reloadTabContent = useEditorStore((s) => s.reloadTabContent)
  const tabs = useEditorStore((s) => s.tabs)

  // Derive file paths only — avoids re-running watch/unwatch on every content change
  const tabFilePaths = useMemo(
    () => tabs.map(t => t.filePath).filter((p): p is string => p !== null).sort().join('\n'),
    [tabs]
  )

  // Track which files we're currently watching to avoid redundant calls
  const watchedFilesRef = useRef<Set<string>>(new Set())

  // Start folder watcher when currentFolder changes
  useEffect(() => {
    if (currentFolder) {
      window.electron.startFolderWatcher(currentFolder)
    }
  }, [currentFolder])

  // Listen for folder tree changes → re-read directory
  useEffect(() => {
    const cleanup = window.electron.onFolderChanged(async () => {
      const folder = useEditorStore.getState().currentFolder
      if (!folder) return
      const tree = await window.electron.readDirectory(folder)
      setFileTree(tree)
    })
    return cleanup
  }, [setFileTree])

  // Listen for individual file content changes → reload tab
  useEffect(() => {
    const cleanup = window.electron.onFileChanged(async (filePath: string) => {
      const state = useEditorStore.getState()
      const tab = state.tabs.find(t => t.filePath === filePath)
      if (!tab || tab.isModified) return // don't overwrite unsaved user edits

      const result = await window.electron.readFile(filePath)
      if (result.success && result.content !== undefined) {
        reloadTabContent(filePath, result.content)
      }
    })
    return cleanup
  }, [reloadTabContent])

  // Listen for file deletions (currently tab stays open with stale content)
  useEffect(() => {
    const cleanup = window.electron.onFileDeleted((_filePath: string) => {
      // Future: could mark tab as deleted or show notification
    })
    return cleanup
  }, [])

  // Watch/unwatch files as tabs open/close (keyed on file paths only, not content)
  useEffect(() => {
    const currentPaths = new Set(tabFilePaths ? tabFilePaths.split('\n') : [])

    // Watch newly opened files
    currentPaths.forEach(p => {
      if (!watchedFilesRef.current.has(p)) {
        window.electron.watchFile(p)
      }
    })

    // Unwatch closed files
    watchedFilesRef.current.forEach(p => {
      if (!currentPaths.has(p)) {
        window.electron.unwatchFile(p)
      }
    })

    watchedFilesRef.current = currentPaths
  }, [tabFilePaths])
}
