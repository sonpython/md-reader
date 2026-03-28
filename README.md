# MD Reader

A feature-rich Markdown editor desktop application built with Electron and React.

## Features

- **Multi-tab editor** with syntax highlighting, code folding, line numbers, bracket matching
- **Live preview** with GitHub Flavored Markdown, Mermaid diagrams, code copy buttons
- **File explorer** sidebar with tree view, markdown-only filtering, expand/collapse all
- **Search & Replace** with regex support, case-sensitive toggle, match counter
- **File watching** — auto-refreshes file tree and reloads open files on external changes
- **Auto-save** with 2-second debounce (configurable on/off)
- **Dark/Light theme** toggle (VS Code-inspired, persisted)
- **PDF export** with print styling
- **Cross-platform** — macOS, Windows, Linux
- **OS file association** — opens `.md`, `.markdown`, `.mdown`, `.mkd`, `.txt` files

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Desktop | Electron 28 |
| UI | React 18 + TypeScript 5 |
| Editor | CodeMirror 6 |
| Preview | react-markdown + remark-gfm + mermaid 11 |
| State | Zustand |
| Styling | Tailwind CSS 3 |
| Build | Vite 5 |
| File Watching | chokidar |

## Getting Started

### Prerequisites

- Node.js >= 18
- npm

### Install

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

Outputs platform-specific packages to `release/` directory:
- **macOS** — DMG, ZIP (arm64/x64)
- **Windows** — NSIS installer, ZIP
- **Linux** — AppImage, DEB

## Keyboard Shortcuts

| Action | macOS | Windows/Linux |
|--------|-------|---------------|
| New File | Cmd+N | Ctrl+N |
| Open File | Cmd+O | Ctrl+O |
| Open Folder | Cmd+Shift+O | Ctrl+Shift+O |
| Save | Cmd+S | Ctrl+S |
| Save As | Cmd+Shift+S | Ctrl+Shift+S |
| Find | Cmd+F | Ctrl+F |
| Replace | Cmd+H | Ctrl+H |
| Toggle Sidebar | Cmd+B | Ctrl+B |
| Toggle Preview | Cmd+Shift+P | Ctrl+Shift+P |
| Close Tab | Cmd+W | Ctrl+W |

## Project Structure

```
src/
  components/
    Editor/       # MarkdownEditor, TabBar, SearchReplace
    Preview/      # MarkdownPreview
    Sidebar/      # FileExplorer
    Layout/       # Header, StatusBar
  hooks/          # useMenuEvents, useFileSystem, useAutoSave, useFileWatcher
  store/          # Zustand store (editorStore)
  types/          # TypeScript type definitions

electron/
  main.ts         # Electron main process + IPC handlers
  preload.ts      # Context-isolated IPC bridge
  file-watcher.ts # chokidar-based filesystem watcher
```

## License

MIT
