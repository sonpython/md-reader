import { useEditorStore } from '../../store/editorStore'

export const StatusBar = () => {
  const { tabs, activeTabId, autoSaveEnabled } = useEditorStore()
  const activeTab = tabs.find(t => t.id === activeTabId)

  const wordCount = activeTab?.content.split(/\s+/).filter(Boolean).length || 0
  const charCount = activeTab?.content.length || 0
  const lineCount = activeTab?.content.split('\n').length || 0

  return (
    <footer className="h-6 bg-neutral-500 flex items-center justify-between px-3 text-xs text-white select-none">
      <div className="flex items-center gap-4">
        {activeTab && (
          <>
            <span>
              {activeTab.isModified ? '●' : '○'} {activeTab.isModified ? 'Modified' : 'Saved'}
            </span>
            <span>Markdown</span>
          </>
        )}
      </div>

      <div className="flex items-center gap-4">
        {activeTab && (
          <>
            <span>{lineCount} lines</span>
            <span>{wordCount} words</span>
            <span>{charCount} chars</span>
          </>
        )}
        <span>{autoSaveEnabled ? 'Auto-save: On' : 'Auto-save: Off'}</span>
      </div>
    </footer>
  )
}
