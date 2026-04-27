import { useState } from 'react'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'
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

// Vertical resize handle: 1px line that highlights on hover/drag
const RESIZE_HANDLE_CLASS = clsx(
  'w-px bg-editor-border transition-all relative',
  'hover:bg-editor-accent hover:w-0.5',
  'data-[resize-handle-state=drag]:bg-editor-accent data-[resize-handle-state=drag]:w-0.5'
)

function App() {
  const { sidebarOpen, previewOpen, editorOpen } = useEditorStore()
  const [explorerCollapsed, setExplorerCollapsed] = useState(false)

  useMenuEvents()
  useAutoSave()
  useFileWatcher()

  const sidebarResizable = sidebarOpen && !explorerCollapsed

  return (
    <div className="h-screen flex flex-col bg-editor-bg text-editor-text overflow-hidden">
      <Header />

      <div className="flex-1 flex overflow-hidden">
        {/* Collapsed sidebar: fixed-width, rendered outside PanelGroup */}
        {sidebarOpen && explorerCollapsed && (
          <aside className="w-10 bg-editor-sidebar border-r border-editor-border overflow-hidden flex flex-col">
            <FileExplorer
              isCollapsed
              onToggleCollapse={() => setExplorerCollapsed(false)}
            />
          </aside>
        )}

        <PanelGroup direction="horizontal" autoSaveId="md-reader-main-v1" className="flex-1">
          {sidebarResizable && (
            <>
              <Panel id="sidebar" order={1} defaultSize={20} minSize={12} maxSize={40}>
                <aside className="h-full bg-editor-sidebar border-r border-editor-border overflow-hidden flex flex-col">
                  <FileExplorer
                    isCollapsed={false}
                    onToggleCollapse={() => setExplorerCollapsed(true)}
                  />
                </aside>
              </Panel>
              <PanelResizeHandle className={RESIZE_HANDLE_CLASS} />
            </>
          )}

          <Panel id="main" order={2}>
            <main className="h-full flex flex-col overflow-hidden">
              <TabBar />
              <SearchReplace />

              <div className="flex-1 overflow-hidden">
                <PanelGroup direction="horizontal" autoSaveId="md-reader-content-v1">
                  {editorOpen && (
                    <Panel id="editor" order={1} minSize={20}>
                      <div className="h-full overflow-hidden">
                        <MarkdownEditor />
                      </div>
                    </Panel>
                  )}
                  {editorOpen && previewOpen && (
                    <PanelResizeHandle className={RESIZE_HANDLE_CLASS} />
                  )}
                  {previewOpen && (
                    <Panel id="preview" order={2} minSize={20}>
                      <div className="h-full overflow-hidden bg-editor-sidebar">
                        <MarkdownPreview />
                      </div>
                    </Panel>
                  )}
                </PanelGroup>
              </div>
            </main>
          </Panel>
        </PanelGroup>
      </div>

      <StatusBar />
    </div>
  )
}

export default App
