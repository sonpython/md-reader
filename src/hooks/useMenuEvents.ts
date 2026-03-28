import { useEffect } from 'react'
import { useEditorStore } from '../store/editorStore'
import { useFileSystem } from './useFileSystem'

export const useMenuEvents = () => {
  const { toggleSidebar, togglePreview, toggleTheme, toggleSearch, closeTab, activeTabId, tabs, previewOpen } = useEditorStore()
  const { openFile, openFolder, saveFile, saveFileAs, newFile, exportPdf, openFileByPath } = useFileSystem()

  useEffect(() => {
    const cleanups: (() => void)[] = []

    cleanups.push(window.electron.onMenuEvent('menu:new-file', newFile))
    cleanups.push(window.electron.onMenuEvent('menu:open-file', openFile))
    cleanups.push(window.electron.onMenuEvent('menu:open-folder', openFolder))
    cleanups.push(window.electron.onMenuEvent('menu:save', saveFile))
    cleanups.push(window.electron.onMenuEvent('menu:save-as', saveFileAs))
    cleanups.push(window.electron.onMenuEvent('menu:toggle-sidebar', toggleSidebar))
    cleanups.push(window.electron.onMenuEvent('menu:toggle-preview', togglePreview))
    cleanups.push(window.electron.onMenuEvent('menu:toggle-theme', toggleTheme))
    cleanups.push(window.electron.onMenuEvent('menu:find', toggleSearch))
    cleanups.push(window.electron.onMenuEvent('menu:replace', toggleSearch))
    cleanups.push(window.electron.onMenuEvent('menu:close-tab', () => {
      if (activeTabId) closeTab(activeTabId)
    }))
    cleanups.push(window.electron.onMenuEvent('menu:export-pdf', async () => {
      const activeTab = tabs.find(t => t.id === activeTabId)
      if (activeTab && previewOpen) {
        const previewElement = document.getElementById('markdown-preview')
        if (previewElement) {
          const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="UTF-8">
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px; line-height: 1.6; }
                pre { background: #f4f4f4; padding: 16px; border-radius: 4px; overflow-x: auto; }
                code { background: #f4f4f4; padding: 2px 6px; border-radius: 3px; }
                blockquote { border-left: 4px solid #ddd; margin: 0; padding-left: 16px; color: #666; }
                table { border-collapse: collapse; width: 100%; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background: #f4f4f4; }
                img { max-width: 100%; }
              </style>
            </head>
            <body>${previewElement.innerHTML}</body>
            </html>
          `
          await exportPdf(htmlContent)
        }
      }
    }))

    // Handle file open from OS (double-click on .md file)
    cleanups.push(window.electron.onFileOpenFromOS((filePath) => {
      openFileByPath(filePath)
    }))

    return () => {
      cleanups.forEach(cleanup => cleanup())
    }
  }, [
    openFile, openFolder, saveFile, saveFileAs, newFile, exportPdf,
    toggleSidebar, togglePreview, toggleTheme, toggleSearch,
    closeTab, activeTabId, tabs, previewOpen, openFileByPath
  ])
}
