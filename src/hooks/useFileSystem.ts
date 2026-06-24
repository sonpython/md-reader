import { useCallback } from 'react'
import { useEditorStore } from '../store/editorStore'

// PDFs are binary — they get a separate tab that never touches the text pipeline
const isPdfPath = (p: string) => /\.pdf$/i.test(p)

export const useFileSystem = () => {
  const { addTab, updateTabContent, markTabSaved, setCurrentFolder, setFileTree, tabs, activeTabId } = useEditorStore()

  const openFile = useCallback(async () => {
    const result = await window.electron.openFileDialog()
    if (result) {
      const isPdf = isPdfPath(result.path)
      addTab({
        filePath: result.path,
        fileName: result.path.split('/').pop() || 'Untitled',
        // For PDFs the dialog returns empty content; the native viewer reads the file directly
        content: isPdf ? '' : result.content,
        isModified: false,
        type: isPdf ? 'pdf' : 'markdown'
      })
    }
  }, [addTab])

  const openFileByPath = useCallback(async (filePath: string) => {
    if (isPdfPath(filePath)) {
      addTab({
        filePath,
        fileName: filePath.split('/').pop() || 'Untitled',
        content: '',
        isModified: false,
        type: 'pdf'
      })
      return
    }

    const result = await window.electron.readFile(filePath)
    if (result.success && result.content !== undefined) {
      addTab({
        filePath,
        fileName: filePath.split('/').pop() || 'Untitled',
        content: result.content,
        isModified: false,
        type: 'markdown'
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
    if (!activeTab || activeTab.type === 'pdf') return // PDFs are read-only

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
    if (!activeTab || activeTab.type === 'pdf') return // PDFs are read-only

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
      isModified: false,
      type: 'markdown'
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
