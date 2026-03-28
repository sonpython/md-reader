import { useEditorStore } from '../../store/editorStore'
import { useFileSystem } from '../../hooks/useFileSystem'
import clsx from 'clsx'

export const Header = () => {
  const { sidebarOpen, previewOpen, theme, autoSaveEnabled, toggleSidebar, togglePreview, toggleTheme, toggleAutoSave } = useEditorStore()
  const { newFile, openFile, openFolder, saveFile } = useFileSystem()

  return (
    <header className="h-10 bg-editor-sidebar border-b border-editor-border flex items-center justify-between px-4 pl-20 select-none app-drag">
      <div className="flex items-center gap-2 app-no-drag">
        <button
          onClick={toggleSidebar}
          className={clsx(
            'p-1.5 rounded hover:bg-editor-active transition-colors',
            sidebarOpen && 'bg-editor-active'
          )}
          title="Toggle Sidebar (Cmd+B)"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
          </svg>
        </button>

        <div className="h-4 w-px bg-editor-border mx-1" />

        <button
          onClick={newFile}
          className="p-1.5 rounded hover:bg-editor-active transition-colors"
          title="New File (Cmd+N)"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>

        <button
          onClick={openFile}
          className="p-1.5 rounded hover:bg-editor-active transition-colors"
          title="Open File (Cmd+O)"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
          </svg>
        </button>

        <button
          onClick={openFolder}
          className="p-1.5 rounded hover:bg-editor-active transition-colors"
          title="Open Folder (Cmd+Shift+O)"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
        </button>

        <button
          onClick={saveFile}
          className="p-1.5 rounded hover:bg-editor-active transition-colors"
          title="Save (Cmd+S)"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
          </svg>
        </button>
      </div>

      <div className="text-sm font-medium text-editor-text/70">
        MD Reader
      </div>

      <div className="flex items-center gap-2 app-no-drag">
        <button
          onClick={toggleAutoSave}
          className={clsx(
            'px-2 py-1 rounded text-xs transition-colors',
            autoSaveEnabled ? 'bg-green-600/20 text-green-400' : 'bg-editor-active text-editor-text/50'
          )}
          title="Toggle Auto-save"
        >
          {autoSaveEnabled ? 'Auto-save ON' : 'Auto-save OFF'}
        </button>

        <div className="h-4 w-px bg-editor-border mx-1" />

        <button
          onClick={togglePreview}
          className={clsx(
            'p-1.5 rounded hover:bg-editor-active transition-colors',
            previewOpen && 'bg-editor-active'
          )}
          title="Toggle Preview (Cmd+Shift+P)"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </button>

        <button
          onClick={toggleTheme}
          className="p-1.5 rounded hover:bg-editor-active transition-colors"
          title="Toggle Theme"
        >
          {theme === 'dark' ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>
      </div>
    </header>
  )
}
