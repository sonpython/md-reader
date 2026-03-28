import { useEditorStore } from '../../store/editorStore'
import clsx from 'clsx'

export const TabBar = () => {
  const { tabs, activeTabId, setActiveTab, closeTab } = useEditorStore()

  if (tabs.length === 0) return null

  return (
    <div className="h-9 bg-editor-bg border-b border-editor-border flex items-end overflow-x-auto">
      {tabs.map((tab) => (
        <div
          key={tab.id}
          className={clsx(
            'flex items-center gap-2 px-3 py-1.5 border-r border-editor-border cursor-pointer group min-w-0',
            'hover:bg-editor-active transition-colors',
            activeTabId === tab.id
              ? 'bg-editor-sidebar border-t-2 border-t-editor-accent'
              : 'bg-editor-bg'
          )}
          onClick={() => setActiveTab(tab.id)}
        >
          <svg className="w-4 h-4 text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span className="text-sm truncate max-w-[120px]">
            {tab.isModified && <span className="text-editor-accent mr-1">●</span>}
            {tab.fileName}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation()
              closeTab(tab.id)
            }}
            className="ml-1 p-0.5 rounded hover:bg-editor-border opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  )
}
