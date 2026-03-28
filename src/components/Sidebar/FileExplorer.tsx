import { useState, useEffect, useMemo, useCallback } from 'react'
import { useEditorStore } from '../../store/editorStore'
import { useFileSystem } from '../../hooks/useFileSystem'
import { FileNode } from '../../types'
import clsx from 'clsx'

interface FileExplorerProps {
  isCollapsed: boolean
  onToggleCollapse: () => void
}

// Check if a file is markdown
const isMarkdownFile = (name: string) => /\.(md|markdown)$/i.test(name)

// Check if directory contains any markdown files (recursively)
const hasMarkdownFiles = (node: FileNode): boolean => {
  if (!node.isDirectory) return isMarkdownFile(node.name)
  if (!node.children) return false
  return node.children.some(child => hasMarkdownFiles(child))
}

// Filter and sort tree: only MD files and folders containing MD files
// Files first, then folders, both sorted alphabetically
const filterAndSortTree = (nodes: FileNode[]): FileNode[] => {
  const filtered = nodes
    .filter(node => {
      if (!node.isDirectory) return isMarkdownFile(node.name)
      return hasMarkdownFiles(node)
    })
    .map(node => {
      if (node.isDirectory && node.children) {
        return { ...node, children: filterAndSortTree(node.children) }
      }
      return node
    })

  // Sort: files first, then folders, alphabetically within each group
  return filtered.sort((a, b) => {
    if (!a.isDirectory && b.isDirectory) return -1
    if (a.isDirectory && !b.isDirectory) return 1
    return a.name.localeCompare(b.name)
  })
}

interface FileTreeItemProps {
  node: FileNode
  depth: number
  expandedPaths: Set<string>
  toggleExpand: (path: string) => void
}

const FileTreeItem = ({ node, depth, expandedPaths, toggleExpand }: FileTreeItemProps) => {
  const { openFileByPath } = useFileSystem()
  const isExpanded = expandedPaths.has(node.path)

  const handleClick = () => {
    if (node.isDirectory) {
      toggleExpand(node.path)
    } else {
      openFileByPath(node.path)
    }
  }

  return (
    <div>
      <button
        onClick={handleClick}
        className={clsx(
          'w-full text-left px-2 py-1 hover:bg-editor-active flex items-center gap-2 text-sm transition-colors'
        )}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
      >
        {node.isDirectory ? (
          <>
            <svg
              className={clsx('w-4 h-4 transition-transform flex-shrink-0', isExpanded && 'rotate-90')}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <svg className="w-4 h-4 text-yellow-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
          </>
        ) : (
          <>
            <span className="w-4 flex-shrink-0" />
            <svg className="w-4 h-4 text-blue-400 flex-shrink-0" viewBox="0 0 24 24" fill="none">
              <path
                d="M14 3v4a1 1 0 001 1h4M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8l-5-5z"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path d="M9 13h6M9 17h4" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
            </svg>
          </>
        )}
        <span className="truncate">{node.name}</span>
      </button>

      {node.isDirectory && isExpanded && node.children && (
        <div>
          {node.children.map((child) => (
            <FileTreeItem
              key={child.path}
              node={child}
              depth={depth + 1}
              expandedPaths={expandedPaths}
              toggleExpand={toggleExpand}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export const FileExplorer = ({ isCollapsed, onToggleCollapse }: FileExplorerProps) => {
  const { fileTree, currentFolder, setCurrentFolder, setFileTree, getLastFolder } = useEditorStore()
  const { openFolder } = useFileSystem()
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set())

  // Filter tree to only show MD files and relevant folders
  const filteredTree = useMemo(() => filterAndSortTree(fileTree), [fileTree])

  // Load last folder on mount
  useEffect(() => {
    const loadLastFolder = async () => {
      const lastFolder = getLastFolder()
      if (lastFolder && !currentFolder) {
        try {
          const tree = await window.electron.readDirectory(lastFolder)
          setCurrentFolder(lastFolder)
          setFileTree(tree)
        } catch {
          // Folder might not exist anymore
        }
      }
    }
    loadLastFolder()
  }, [])

  const toggleExpand = useCallback((path: string) => {
    setExpandedPaths(prev => {
      const next = new Set(prev)
      if (next.has(path)) {
        next.delete(path)
      } else {
        next.add(path)
      }
      return next
    })
  }, [])

  // Get all folder paths recursively
  const getAllFolderPaths = useCallback((nodes: FileNode[]): string[] => {
    const paths: string[] = []
    const traverse = (items: FileNode[]) => {
      for (const item of items) {
        if (item.isDirectory) {
          paths.push(item.path)
          if (item.children) traverse(item.children)
        }
      }
    }
    traverse(nodes)
    return paths
  }, [])

  const expandAll = useCallback(() => {
    const allPaths = getAllFolderPaths(filteredTree)
    setExpandedPaths(new Set(allPaths))
  }, [filteredTree, getAllFolderPaths])

  const collapseAll = useCallback(() => {
    setExpandedPaths(new Set())
  }, [])

  // Count MD files
  const mdFileCount = useMemo(() => {
    let count = 0
    const countFiles = (nodes: FileNode[]) => {
      for (const node of nodes) {
        if (!node.isDirectory) count++
        else if (node.children) countFiles(node.children)
      }
    }
    countFiles(filteredTree)
    return count
  }, [filteredTree])

  // Collapsed state - show only toggle button
  if (isCollapsed) {
    return (
      <div className="h-full flex flex-col items-center py-2">
        <button
          onClick={onToggleCollapse}
          className="p-1.5 hover:bg-editor-active rounded transition-colors"
          title="Expand Explorer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    )
  }

  if (!currentFolder) {
    return (
      <div className="h-full flex flex-col">
        {/* Header with toggle */}
        <div className="flex items-center gap-1 p-2 border-b border-editor-border">
          <button
            onClick={onToggleCollapse}
            className="p-1 hover:bg-editor-active rounded transition-colors"
            title="Collapse Explorer"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="text-xs text-editor-text/50 uppercase tracking-wide">
            Explorer
          </span>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center text-editor-text/50 p-4">
          <svg className="w-12 h-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
          <p className="text-sm text-center mb-4">No folder opened</p>
          <button
            onClick={openFolder}
            className="px-4 py-2 bg-editor-accent hover:bg-editor-accent/80 rounded text-sm text-white transition-colors"
          >
            Open Folder
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header with toggle */}
      <div className="flex items-center justify-between p-2 border-b border-editor-border">
        <div className="flex items-center gap-1">
          <button
            onClick={onToggleCollapse}
            className="p-1 hover:bg-editor-active rounded transition-colors"
            title="Collapse Explorer"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="text-xs text-editor-text/50 uppercase tracking-wide">
            Explorer
          </span>
        </div>
        <div className="flex items-center gap-0.5">
          <button
            onClick={expandAll}
            className="p-1 hover:bg-editor-active rounded transition-colors"
            title="Expand All Folders"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
            </svg>
          </button>
          <button
            onClick={collapseAll}
            className="p-1 hover:bg-editor-active rounded transition-colors"
            title="Collapse All Folders"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>
          <button
            onClick={openFolder}
            className="p-1 hover:bg-editor-active rounded transition-colors"
            title="Open Different Folder"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Folder info */}
      <div className="px-2 py-1.5 text-xs border-b border-editor-border bg-editor-active/30">
        <div className="truncate text-editor-text/70 font-medium">{currentFolder.split('/').pop()}</div>
        <div className="text-editor-text/50">{mdFileCount} markdown files</div>
      </div>

      {/* File tree */}
      <div className="flex-1 overflow-auto py-1">
        {filteredTree.length === 0 ? (
          <div className="p-4 text-center text-editor-text/50 text-sm">
            No markdown files found
          </div>
        ) : (
          filteredTree.map((node) => (
            <FileTreeItem
              key={node.path}
              node={node}
              depth={0}
              expandedPaths={expandedPaths}
              toggleExpand={toggleExpand}
            />
          ))
        )}
      </div>
    </div>
  )
}
