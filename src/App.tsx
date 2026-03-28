import { useState } from 'react'
import { useEditorStore } from './store/editorStore'
import { useMenuEvents } from './hooks/useMenuEvents'
import { useAutoSave } from './hooks/useAutoSave'
import { useFileWatcher } from './hooks/use-file-watcher'
import { Header } from './components/Layout/Header'
import { StatusBar } from './components/Layout/StatusBar'
import { FileExplorer } from './components/Sidebar/FileExplorer'
import { TabBar } from './components/Editor/TabBar'
import { MarkdownEditor } from './components/Editor/MarkdownEditor'
import { SearchReplace } from './components/Editor/SearchReplace'
import { MarkdownPreview } from './components/Preview/MarkdownPreview'
import clsx from 'clsx'

function App() {
  const { sidebarOpen, previewOpen } = useEditorStore()
  const [explorerCollapsed, setExplorerCollapsed] = useState(false)

  useMenuEvents()
  useAutoSave()
  useFileWatcher()

  return (
    <div className="h-screen flex flex-col bg-editor-bg text-editor-text overflow-hidden">
      <Header />

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        {sidebarOpen && (
          <aside
            className={clsx(
              'bg-editor-sidebar border-r border-editor-border transition-all duration-200 overflow-hidden flex flex-col',
              explorerCollapsed ? 'w-10' : 'w-64'
            )}
          >
            <FileExplorer
              isCollapsed={explorerCollapsed}
              onToggleCollapse={() => setExplorerCollapsed(!explorerCollapsed)}
            />
          </aside>
        )}

        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden">
          <TabBar />
          <SearchReplace />

          <div className="flex-1 flex overflow-hidden">
            {/* Editor */}
            <div
              className={clsx(
                'overflow-hidden transition-all duration-200',
                previewOpen ? 'w-1/2' : 'w-full'
              )}
            >
              <MarkdownEditor />
            </div>

            {/* Preview */}
            {previewOpen && (
              <>
                <div className="w-px bg-editor-border" />
                <div className="w-1/2 overflow-hidden bg-editor-sidebar">
                  <MarkdownPreview />
                </div>
              </>
            )}
          </div>
        </main>
      </div>

      <StatusBar />
    </div>
  )
}

export default App
