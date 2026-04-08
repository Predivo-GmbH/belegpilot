import { useState, useEffect, useRef, useCallback } from 'react'
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Loader2 } from 'lucide-react'
import * as pdfjsLib from 'pdfjs-dist'
import PdfjsWorker from 'pdfjs-dist/build/pdf.worker.mjs?url'

pdfjsLib.GlobalWorkerOptions.workerSrc = PdfjsWorker

interface PdfViewerProps {
  url: string
  className?: string
}

export function PdfViewer({ url, className }: PdfViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [pdf, setPdf] = useState<pdfjsLib.PDFDocumentProxy | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [scale, setScale] = useState(1)
  const [loadError, setLoadError] = useState<string | null>(null)
  const renderTaskRef = useRef<pdfjsLib.RenderTask | null>(null)

  useEffect(() => {
    let cancelled = false
    const loadingTask = pdfjsLib.getDocument(url)
    loadingTask.promise
      .then((doc) => {
        if (!cancelled) {
          setPdf(doc)
          setTotalPages(doc.numPages)
        }
      })
      .catch((err) => {
        if (!cancelled) {
          console.error('PDF load error:', err)
          setLoadError('PDF konnte nicht geladen werden.')
        }
      })
    return () => {
      cancelled = true
      loadingTask.destroy()
    }
  }, [url])

  const renderPage = useCallback(async () => {
    if (!pdf || !canvasRef.current || !containerRef.current) return

    if (renderTaskRef.current) {
      renderTaskRef.current.cancel()
      renderTaskRef.current = null
    }

    const page = await pdf.getPage(currentPage)
    const container = containerRef.current
    const containerWidth = container.clientWidth - 32 // padding

    // Calculate scale to fit width
    const unscaledViewport = page.getViewport({ scale: 1 })
    const fitScale = containerWidth / unscaledViewport.width
    const effectiveScale = fitScale * scale

    const viewport = page.getViewport({ scale: effectiveScale })
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const dpr = window.devicePixelRatio || 1

    canvas.width = viewport.width * dpr
    canvas.height = viewport.height * dpr
    canvas.style.width = `${viewport.width}px`
    canvas.style.height = `${viewport.height}px`
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    const renderTask = page.render({ canvasContext: ctx, viewport, canvas })
    renderTaskRef.current = renderTask
    try {
      await renderTask.promise
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'RenderingCancelledException') {
        // render cancelled — ignore
      } else {
        throw error
      }
    }
  }, [pdf, currentPage, scale])

  useEffect(() => {
    renderPage()
  }, [renderPage])

  // Re-render on window resize
  useEffect(() => {
    const handleResize = () => renderPage()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [renderPage])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault()
        setCurrentPage((p) => Math.max(1, p - 1))
        break
      case 'ArrowRight':
        e.preventDefault()
        setCurrentPage((p) => Math.min(totalPages, p + 1))
        break
      case '+':
      case '=':
        e.preventDefault()
        setScale((s) => Math.min(3, s + 0.25))
        break
      case '-':
        e.preventDefault()
        setScale((s) => Math.max(0.5, s - 0.25))
        break
    }
  }, [totalPages])

  if (loadError) {
    return (
      <div className={className} ref={containerRef}>
        <div className="flex h-full items-center justify-center text-sm text-ink-muted">
          {loadError}
        </div>
      </div>
    )
  }

  if (!pdf) {
    return (
      <div className={className} ref={containerRef}>
        <div className="flex h-full items-center justify-center" role="status" aria-live="polite">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="sr-only">PDF wird geladen...</span>
        </div>
      </div>
    )
  }

  return (
    <div className={className} ref={containerRef} tabIndex={0} onKeyDown={handleKeyDown}>
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-border bg-background/80 px-3 py-1.5 text-sm backdrop-blur">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage <= 1}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded p-1 hover:bg-muted disabled:opacity-50"
            aria-label="Vorherige Seite"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="min-w-[4rem] text-center tabular-nums text-ink-secondary">
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage >= totalPages}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded p-1 hover:bg-muted disabled:opacity-50"
            aria-label="Nächste Seite"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setScale((s) => Math.max(0.5, s - 0.25))}
            disabled={scale <= 0.5}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded p-1 hover:bg-muted disabled:opacity-50"
            aria-label="Verkleinern"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <span className="w-12 text-center tabular-nums text-ink-secondary">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={() => setScale((s) => Math.min(3, s + 0.25))}
            disabled={scale >= 3}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded p-1 hover:bg-muted disabled:opacity-50"
            aria-label="Vergrößern"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
        </div>
      </div>
      {/* Canvas */}
      <div className="flex-1 overflow-auto p-4">
        <canvas
          ref={canvasRef}
          className="mx-auto max-w-full shadow-md"
          role="img"
          aria-label={`PDF-Dokument, Seite ${currentPage} von ${totalPages}`}
        />
      </div>
    </div>
  )
}
