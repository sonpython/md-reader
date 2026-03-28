import { useCallback } from 'react'
import { useEditorStore } from '../store/editorStore'

export const useFileSystem = () => {
  const { addTab, updateTabContent, markTabSaved, setCurrentFolder, setFileTree, tabs, activeTabId } = useEditorStore()

  const openFile = useCallback(async () => {
    const result = await window.electron.openFileDialog()
    if (result) {
      addTab({
        filePath: result.path,
        fileName: result.path.split('/').pop() || 'Untitled',
        content: result.content,
        isModified: false
      })
    }
  }, [addTab])

  const openFileByPath = useCallback(async (filePath: string) => {
    const result = await window.electron.readFile(filePath)
    if (result.success && result.content !== undefined) {
      addTab({
        filePath,
        fileName: filePath.split('/').pop() || 'Untitled',
        content: result.content,
        isModified: false
      })
    }
  }, [addTab])

  const openFolder = useCallback(async () => {
    const folderPath = await window.electron.openFolderDialog()
    if (folderPath) {
      setCurrentFolder(folderPath)
      const tree = await window.electron.readDirectory(folderPath)
      setFileTree(tree)
    }
  }, [setCurrentFolder, setFileTree])

  const saveFile = useCallback(async () => {
    const activeTab = tabs.find(t => t.id === activeTabId)
    if (!activeTab) return

    if (activeTab.filePath) {
      const result = await window.electron.saveFile(activeTab.filePath, activeTab.content)
      if (result.success) {
        markTabSaved(activeTab.id)
      }
    } else {
      await saveFileAs()
    }
  }, [tabs, activeTabId, markTabSaved])

  const saveFileAs = useCallback(async () => {
    const activeTab = tabs.find(t => t.id === activeTabId)
    if (!activeTab) return

    const filePath = await window.electron.saveFileDialog(activeTab.content)
    if (filePath) {
      markTabSaved(activeTab.id, filePath)
    }
  }, [tabs, activeTabId, markTabSaved])

  const newFile = useCallback(() => {
    addTab({
      filePath: null,
      fileName: 'Untitled.md',
      content: '',
      isModified: false
    })
  }, [addTab])

  const exportPdf = useCallback(async (htmlContent: string) => {
    await window.electron.exportPdf(htmlContent)
  }, [])

  return {
    openFile,
    openFileByPath,
    openFolder,
    saveFile,
    saveFileAs,
    newFile,
    exportPdf,
    updateTabContent
  }
}
