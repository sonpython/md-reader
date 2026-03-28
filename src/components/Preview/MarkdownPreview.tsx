import { useEffect, useRef, useCallback } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism'
import mermaid from 'mermaid'
import { useEditorStore } from '../../store/editorStore'
import './preview.css'

// Initialize mermaid
mermaid.initialize({
  startOnLoad: false,
  theme: 'dark',
  securityLevel: 'loose',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
})

// Mermaid component
const MermaidDiagram = ({ code }: { code: string }) => {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const renderDiagram = async () => {
      if (containerRef.current && code) {
        try {
          const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`
          const { svg } = await mermaid.render(id, code)
          if (containerRef.current) {
            containerRef.current.innerHTML = svg
          }
        } catch (error) {
          if (containerRef.current) {
            containerRef.current.innerHTML = `<pre class="mermaid-error">Mermaid Error: ${error}</pre>`
          }
        }
      }
    }
    renderDiagram()
  }, [code])

  return <div ref={containerRef} className="mermaid-container" />
}

// Code block component
const CodeBlock = ({
  language,
  code,
  isDark
}: {
  language: string
  code: string
  isDark: boolean
}) => {
  const copyToClipboard = useCallback(() => {
    navigator.clipboard.writeText(code)
  }, [code])

  // Handle Mermaid diagrams
  if (language === 'mermaid' || language === 'mmd') {
    return <MermaidDiagram code={code} />
  }

  return (
    <div className="code-block-wrapper">
      <div className="code-block-header">
        <span className="code-language">{language || 'text'}</span>
        <button onClick={copyToClipboard} className="copy-button" title="Copy code">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
        </button>
      </div>
      <SyntaxHighlighter
        style={isDark ? oneDark : oneLight}
        language={language || 'text'}
        PreTag="div"
        customStyle={{
          margin: 0,
          borderRadius: '0 0 6px 6px',
          fontSize: '14px',
          lineHeight: '1.5'
        }}
        showLineNumbers={code.split('\n').length > 3}
        lineNumberStyle={{
          minWidth: '3em',
          paddingRight: '1em',
          color: isDark ? '#6e7681' : '#8c959f',
          userSelect: 'none'
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  )
}

export const MarkdownPreview = () => {
  const { tabs, activeTabId, theme } = useEditorStore()
  const activeTab = tabs.find(t => t.id === activeTabId)
  const isDark = theme === 'dark'

  // Update mermaid theme when theme changes
  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: isDark ? 'dark' : 'default',
      securityLevel: 'loose',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    })
  }, [isDark])

  if (!activeTab) {
    return (
      <div className="h-full flex items-center justify-center text-editor-text/50">
        <p>No preview available</p>
      </div>
    )
  }

  return (
    <div
      id="markdown-preview"
      className="markdown-preview h-full overflow-auto"
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ node, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '')
            const language = match ? match[1] : ''
            const code = String(children).replace(/\n$/, '')

            // Check if it's a code block (has language) or inline code
            const isInline = !className && !code.includes('\n')

            if (isInline) {
              return (
                <code className="inline-code" {...props}>
                  {children}
                </code>
              )
            }

            return (
              <CodeBlock
                language={language}
                code={code}
                isDark={isDark}
              />
            )
          },
          input: ({ node, ...props }) => {
            if (props.type === 'checkbox') {
              return (
                <input
                  {...props}
                  disabled
                  className="checkbox"
                />
              )
            }
            return <input {...props} />
          }
        }}
      >
        {activeTab.content}
      </ReactMarkdown>
    </div>
  )
}
