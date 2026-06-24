import { useEffect } from 'react'
import { useFileSystem } from './useFileSystem'

// Only open markdown/PDF files dropped onto the window
const isSupported = (name: string) => /\.(md|markdown|pdf)$/i.test(name)

/**
 * Window-level drag-and-drop: dropping a .md/.markdown/.pdf file opens it as a tab.
 * Routing (markdown vs PDF) is handled by openFileByPath via the file extension.
 */
export const useFileDrop = () => {
  const { openFileByPath } = useFileSystem()

  useEffect(() => {
    // preventDefault on dragover is required to enable the drop event
    const onDragOver = (e: DragEvent) => e.preventDefault()

    const onDrop = (e: DragEvent) => {
      e.preventDefault()
      const files = e.dataTransfer?.files
      if (!files) return
      for (const file of Array.from(files)) {
        // Electron exposes the absolute path on dropped File objects
        const filePath = (file as File & { path?: string }).path
        if (filePath && isSupported(file.name)) {
          openFileByPath(filePath)
        }
      }
    }

    window.addEventListener('dragover', onDragOver)
    window.addEventListener('drop', onDrop)
    return () => {
      window.removeEventListener('dragover', onDragOver)
      window.removeEventListener('drop', onDrop)
    }
  }, [openFileByPath])
}
