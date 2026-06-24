interface PdfViewerProps {
  filePath: string
}

/**
 * Read-only PDF viewer. Embeds the file through the app-pdf:// protocol so Chromium's
 * built-in pdfium viewer renders it — zoom, scroll, text-search, selection and print
 * all come free from the native viewer. No editing, no text pipeline.
 *
 * `key={filePath}` forces a fresh iframe when switching between PDF tabs.
 */
export const PdfViewer = ({ filePath }: PdfViewerProps) => {
  const src = `app-pdf://open?path=${encodeURIComponent(filePath)}`

  return (
    <iframe
      key={filePath}
      src={src}
      title={filePath}
      className="w-full h-full border-0 bg-white"
    />
  )
}
