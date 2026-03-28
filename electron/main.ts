import { app, BrowserWindow, ipcMain, dialog, Menu } from 'electron'
import path from 'path'
import fs from 'fs'
import { initFileWatcher, startFolderWatcher, watchFile, unwatchFile, markSavedByApp, cleanup as cleanupWatchers } from './file-watcher'

let mainWindow: BrowserWindow | null = null
let fileToOpen: string | null = null

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    },
    titleBarStyle: 'hiddenInset',
    frame: process.platform === 'darwin' ? true : true
  })

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL)
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  // Initialize file watcher for open tab content changes
  initFileWatcher(mainWindow)

  createMenu()
}

const createMenu = () => {
  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: 'File',
      submenu: [
        {
          label: 'New File',
          accelerator: 'CmdOrCtrl+N',
          click: () => mainWindow?.webContents.send('menu:new-file')
        },
        {
          label: 'Open File...',
          accelerator: 'CmdOrCtrl+O',
          click: () => mainWindow?.webContents.send('menu:open-file')
        },
        {
          label: 'Open Folder...',
          accelerator: 'CmdOrCtrl+Shift+O',
          click: () => mainWindow?.webContents.send('menu:open-folder')
        },
        { type: 'separator' },
        {
          label: 'Save',
          accelerator: 'CmdOrCtrl+S',
          click: () => mainWindow?.webContents.send('menu:save')
        },
        {
          label: 'Save As...',
          accelerator: 'CmdOrCtrl+Shift+S',
          click: () => mainWindow?.webContents.send('menu:save-as')
        },
        { type: 'separator' },
        {
          label: 'Export PDF',
          click: () => mainWindow?.webContents.send('menu:export-pdf')
        },
        { type: 'separator' },
        { role: 'quit' }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { type: 'separator' },
        {
          label: 'Find',
          accelerator: 'CmdOrCtrl+F',
          click: () => mainWindow?.webContents.send('menu:find')
        },
        {
          label: 'Replace',
          accelerator: 'CmdOrCtrl+H',
          click: () => mainWindow?.webContents.send('menu:replace')
        }
      ]
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Toggle Sidebar',
          accelerator: 'CmdOrCtrl+B',
          click: () => mainWindow?.webContents.send('menu:toggle-sidebar')
        },
        {
          label: 'Toggle Preview',
          accelerator: 'CmdOrCtrl+Shift+P',
          click: () => mainWindow?.webContents.send('menu:toggle-preview')
        },
        { type: 'separator' },
        {
          label: 'Toggle Dark Mode',
          click: () => mainWindow?.webContents.send('menu:toggle-theme')
        },
        { type: 'separator' },
        { role: 'reload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'close' },
        {
          label: 'Close Tab',
          accelerator: 'CmdOrCtrl+W',
          click: () => mainWindow?.webContents.send('menu:close-tab')
        }
      ]
    }
  ]

  if (process.platform === 'darwin') {
    template.unshift({
      label: app.getName(),
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    })
  }

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

// IPC Handlers
ipcMain.handle('file:open-dialog', async () => {
  const result = await dialog.showOpenDialog(mainWindow!, {
    properties: ['openFile'],
    filters: [
      { name: 'Markdown', extensions: ['md', 'markdown', 'txt'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  })

  if (result.canceled || result.filePaths.length === 0) {
    return null
  }

  const filePath = result.filePaths[0]
  const content = fs.readFileSync(filePath, 'utf-8')
  return { path: filePath, content }
})

ipcMain.handle('file:open-folder-dialog', async () => {
  const result = await dialog.showOpenDialog(mainWindow!, {
    properties: ['openDirectory']
  })

  if (result.canceled || result.filePaths.length === 0) {
    return null
  }

  return result.filePaths[0]
})

ipcMain.handle('file:read', async (_, filePath: string) => {
  try {
    const content = fs.readFileSync(filePath, 'utf-8')
    return { success: true, content }
  } catch (error) {
    return { success: false, error: String(error) }
  }
})

ipcMain.handle('file:save', async (_, filePath: string, content: string) => {
  try {
    markSavedByApp(filePath)
    fs.writeFileSync(filePath, content, 'utf-8')
    return { success: true }
  } catch (error) {
    return { success: false, error: String(error) }
  }
})

ipcMain.handle('file:save-dialog', async (_, content: string) => {
  const result = await dialog.showSaveDialog(mainWindow!, {
    filters: [
      { name: 'Markdown', extensions: ['md'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  })

  if (result.canceled || !result.filePath) {
    return null
  }

  markSavedByApp(result.filePath)
  fs.writeFileSync(result.filePath, content, 'utf-8')
  return result.filePath
})

interface FileNode {
  name: string
  path: string
  isDirectory: boolean
  children?: FileNode[]
}

ipcMain.handle('file:read-dir', async (_, dirPath: string): Promise<FileNode[]> => {
  const readDirectory = (dir: string): FileNode[] => {
    const items = fs.readdirSync(dir, { withFileTypes: true })

    return items
      .filter(item => !item.name.startsWith('.'))
      .map(item => {
        const itemPath = path.join(dir, item.name)
        const node: FileNode = {
          name: item.name,
          path: itemPath,
          isDirectory: item.isDirectory()
        }

        if (item.isDirectory()) {
          try {
            node.children = readDirectory(itemPath)
          } catch {
            node.children = []
          }
        }

        return node
      })
      .sort((a, b) => {
        if (a.isDirectory && !b.isDirectory) return -1
        if (!a.isDirectory && b.isDirectory) return 1
        return a.name.localeCompare(b.name)
      })
  }

  try {
    return readDirectory(dirPath)
  } catch {
    return []
  }
})

ipcMain.handle('file:export-pdf', async (_, htmlContent: string) => {
  const result = await dialog.showSaveDialog(mainWindow!, {
    filters: [{ name: 'PDF', extensions: ['pdf'] }]
  })

  if (result.canceled || !result.filePath) {
    return { success: false }
  }

  const pdfWindow = new BrowserWindow({
    show: false,
    webPreferences: {
      contextIsolation: true
    }
  })

  await pdfWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`)

  const pdfData = await pdfWindow.webContents.printToPDF({
    marginType: 1,
    printBackground: true
  })

  fs.writeFileSync(result.filePath, pdfData)
  pdfWindow.close()

  return { success: true, path: result.filePath }
})

// --- Watcher IPC handlers ---
ipcMain.handle('watcher:start-folder', async (_, folderPath: string) => {
  if (mainWindow) startFolderWatcher(folderPath, mainWindow)
})

ipcMain.handle('watcher:watch-file', async (_, filePath: string) => {
  watchFile(filePath)
})

ipcMain.handle('watcher:unwatch-file', async (_, filePath: string) => {
  unwatchFile(filePath)
})

// Handle file open from OS (macOS)
app.on('open-file', (event, filePath) => {
  event.preventDefault()

  if (mainWindow) {
    // App is already running, send file to renderer
    mainWindow.webContents.send('file:open-from-os', filePath)
    mainWindow.focus()
  } else {
    // App is starting, store file path to open after window is ready
    fileToOpen = filePath
  }
})

// Handle file open from command line arguments (Windows/Linux)
const handleCommandLineArgs = (argv: string[]) => {
  // Find .md file in arguments
  const mdFile = argv.find(arg =>
    arg.endsWith('.md') ||
    arg.endsWith('.markdown') ||
    arg.endsWith('.mdown') ||
    arg.endsWith('.mkd')
  )

  if (mdFile && fs.existsSync(mdFile)) {
    if (mainWindow) {
      mainWindow.webContents.send('file:open-from-os', mdFile)
      mainWindow.focus()
    } else {
      fileToOpen = mdFile
    }
  }
}

app.whenReady().then(() => {
  createWindow()

  // Check command line arguments
  handleCommandLineArgs(process.argv)

  // When window is ready, open the file if one was specified
  mainWindow?.webContents.on('did-finish-load', () => {
    if (fileToOpen) {
      mainWindow?.webContents.send('file:open-from-os', fileToOpen)
      fileToOpen = null
    }
  })
})

// Handle second instance (Windows)
const gotTheLock = app.requestSingleInstanceLock()
if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', (event, argv) => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
      handleCommandLineArgs(argv)
    }
  })
}

app.on('window-all-closed', () => {
  cleanupWatchers()
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})
