import { useState } from 'react'
import { useEditorStore } from '../../store/editorStore'
import clsx from 'clsx'

export const SearchReplace = () => {
  const { searchOpen, toggleSearch, tabs, activeTabId, updateTabContent } = useEditorStore()
  const [searchText, setSearchText] = useState('')
  const [replaceText, setReplaceText] = useState('')
  const [matchCase, setMatchCase] = useState(false)
  const [useRegex, setUseRegex] = useState(false)
  const [showReplace, setShowReplace] = useState(false)

  const activeTab = tabs.find(t => t.id === activeTabId)

  if (!searchOpen || !activeTab) return null

  const getMatches = () => {
    if (!searchText) return 0
    try {
      const flags = matchCase ? 'g' : 'gi'
      const pattern = useRegex ? searchText : searchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const regex = new RegExp(pattern, flags)
      const matches = activeTab.content.match(regex)
      return matches ? matches.length : 0
    } catch {
      return 0
    }
  }

  const handleReplace = () => {
    if (!searchText || !activeTabId) return
    try {
      const flags = matchCase ? '' : 'i'
      const pattern = useRegex ? searchText : searchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const regex = new RegExp(pattern, flags)
      const newContent = activeTab.content.replace(regex, replaceText)
      updateTabContent(activeTabId, newContent)
    } catch {
      // Invalid regex
    }
  }

  const handleReplaceAll = () => {
    if (!searchText || !activeTabId) return
    try {
      const flags = matchCase ? 'g' : 'gi'
      const pattern = useRegex ? searchText : searchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const regex = new RegExp(pattern, flags)
      const newContent = activeTab.content.replace(regex, replaceText)
      updateTabContent(activeTabId, newContent)
    } catch {
      // Invalid regex
    }
  }

  const matchCount = getMatches()

  return (
    <div className="border-b border-editor-border bg-editor-sidebar p-2">
      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowReplace(!showReplace)}
          className="p-1 hover:bg-editor-active rounded"
        >
          <svg
            className={clsx('w-4 h-4 transition-transform', showReplace && 'rotate-90')}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <div className="flex-1 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search..."
              className="flex-1 bg-editor-bg border border-editor-border rounded px-2 py-1 text-sm focus:outline-none focus:border-editor-accent"
              autoFocus
            />
            <span className="text-xs text-editor-text/50 min-w-[60px]">
              {searchText ? `${matchCount} found` : ''}
            </span>
          </div>

          {showReplace && (
            <div className="flex items-center gap-2 ml-5">
              <input
                type="text"
                value={replaceText}
                onChange={(e) => setReplaceText(e.target.value)}
                placeholder="Replace with..."
                className="flex-1 bg-editor-bg border border-editor-border rounded px-2 py-1 text-sm focus:outline-none focus:border-editor-accent"
              />
              <button
                onClick={handleReplace}
                className="px-2 py-1 text-xs bg-editor-active hover:bg-editor-border rounded"
                disabled={!searchText}
              >
                Replace
              </button>
              <button
                onClick={handleReplaceAll}
                className="px-2 py-1 text-xs bg-editor-active hover:bg-editor-border rounded"
                disabled={!searchText}
              >
                Replace All
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setMatchCase(!matchCase)}
            className={clsx(
              'px-2 py-1 text-xs rounded',
              matchCase ? 'bg-editor-accent text-white' : 'hover:bg-editor-active'
            )}
            title="Match Case"
          >
            Aa
          </button>
          <button
            onClick={() => setUseRegex(!useRegex)}
            className={clsx(
              'px-2 py-1 text-xs rounded',
              useRegex ? 'bg-editor-accent text-white' : 'hover:bg-editor-active'
            )}
            title="Use Regex"
          >
            .*
          </button>
          <button
            onClick={toggleSearch}
            className="p-1 hover:bg-editor-active rounded"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
