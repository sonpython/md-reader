import { useCallback, useMemo } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { markdown, markdownLanguage } from '@codemirror/lang-markdown'
import { languages } from '@codemirror/language-data'
import { EditorView } from '@codemirror/view'
import { useEditorStore } from '../../store/editorStore'

// Custom theme for better gutter separation and no underlines
const editorTheme = EditorView.theme({
  '&': {
    height: '100%'
  },
  '.cm-gutters': {
    backgroundColor: 'var(--editor-sidebar)',
    borderRight: '1px solid var(--editor-border)',
    paddingRight: '4px'
  },
  '.cm-lineNumbers .cm-gutterElement': {
    padding: '0 12px 0 16px',
    minWidth: '3em',
    textAlign: 'right'
  },
  '.cm-content': {
    padding: '0 24px'
  },
  '.cm-line': {
    padding: '0'
  },
  // Remove underline from headings
  '.ͼ1c': {
    textDecoration: 'none !important'
  },
  '.cm-header': {
    textDecoration: 'none !important'
  },
  '.cm-header-1, .cm-header-2, .cm-header-3, .cm-header-4, .cm-header-5, .cm-header-6': {
    textDecoration: 'none !important'
  }
})

export const MarkdownEditor = () => {
  const { tabs, activeTabId, theme } = useEditorStore()
  const updateTabContent = useEditorStore((state) => state.updateTabContent)

  const activeTab = tabs.find(t => t.id === activeTabId)

  const onChange = useCallback((value: string) => {
    if (activeTabId) {
      updateTabContent(activeTabId, value)
    }
  }, [activeTabId, updateTabContent])

  const extensions = useMemo(() => [
    markdown({ base: markdownLanguage, codeLanguages: languages }),
    EditorView.lineWrapping,
    editorTheme
  ], [])

  if (!activeTab) {
    return (
      <div className="h-full flex items-center justify-center text-editor-text/50">
        <div className="text-center">
          <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-lg mb-2">No file open</p>
          <p className="text-sm">Open a file or create a new one to start editing</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-auto">
      <CodeMirror
        value={activeTab.content}
        onChange={onChange}
        extensions={extensions}
        theme={theme === 'dark' ? 'dark' : 'light'}
        className="h-full text-base"
        basicSetup={{
          lineNumbers: true,
          highlightActiveLineGutter: true,
          highlightSpecialChars: true,
          history: true,
          foldGutter: true,
          drawSelection: true,
          dropCursor: true,
          allowMultipleSelections: true,
          indentOnInput: true,
          syntaxHighlighting: true,
          bracketMatching: true,
          closeBrackets: true,
          autocompletion: true,
          rectangularSelection: true,
          crosshairCursor: false,
          highlightActiveLine: true,
          highlightSelectionMatches: true,
          closeBracketsKeymap: true,
          defaultKeymap: true,
          searchKeymap: true,
          historyKeymap: true,
          foldKeymap: true,
          completionKeymap: true,
          lintKeymap: true
        }}
      />
    </div>
  )
}
