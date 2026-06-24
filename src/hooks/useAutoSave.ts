import { useEffect, useRef } from 'react'
import { useEditorStore } from '../store/editorStore'

export const useAutoSave = () => {
  const { tabs, activeTabId, autoSaveEnabled } = useEditorStore()
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!autoSaveEnabled || !activeTabId) return

    const activeTab = tabs.find(t => t.id === activeTabId)
    // PDF tabs are read-only — never auto-save
    if (!activeTab || activeTab.type === 'pdf' || !activeTab.filePath || !activeTab.isModified) return

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(async () => {
      if (activeTab.filePath) {
        const result = await window.electron.saveFile(activeTab.filePath, activeTab.content)
        if (result.success) {
          useEditorStore.getState().markTabSaved(activeTab.id)
        }
      }
    }, 2000)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [tabs, activeTabId, autoSaveEnabled])
}
