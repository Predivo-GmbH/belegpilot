import { useState, useCallback } from 'react'
import { CloudUpload, File, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { useProfile } from '@/hooks/useProfile'
import { useQueryClient } from '@tanstack/react-query'
import { usePageTitle } from '@/hooks/usePageTitle'
import { toast } from 'sonner'

const ACCEPTED_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'image/tiff']
const MAX_FILE_SIZE = 20 * 1024 * 1024 // 20MB

interface UploadFile {
  id: string
  file: File
  status: 'pending' | 'uploading' | 'processing' | 'done' | 'error'
  progress: number
  error?: string
}

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 200)
}

export default function Upload() {
  usePageTitle('Upload')
  const [files, setFiles] = useState<UploadFile[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const { user } = useAuth()
  const { data: profile } = useProfile()
  const queryClient = useQueryClient()

  const addFiles = useCallback((newFiles: FileList | File[]) => {
    const all = Array.from(newFiles)
    const rejected = all.filter((f) => !ACCEPTED_TYPES.includes(f.type) || f.size > MAX_FILE_SIZE)
    if (rejected.length > 0) {
      toast.error(`${rejected.length} Datei(en) abgelehnt — ungültiges Format oder zu gross`)
    }
    const validFiles: UploadFile[] = all
      .filter((f) => ACCEPTED_TYPES.includes(f.type) && f.size <= MAX_FILE_SIZE)
      .map((f) => ({
        id: crypto.randomUUID(),
        file: f,
        status: 'pending' as const,
        progress: 0,
      }))

    setFiles((prev) => [...prev, ...validFiles])
  }, [])

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id))
  }

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)
      if (e.dataTransfer.files.length > 0) {
        addFiles(e.dataTransfer.files)
      }
    },
    [addFiles],
  )

  const uploadSingleFile = async (uploadFile: UploadFile) => {
    const orgId = profile?.organization_id
    if (!orgId || !user) return

    // Update status to uploading
    setFiles((prev) => prev.map((f) => f.id === uploadFile.id ? { ...f, status: 'uploading' as const, progress: 30 } : f))

    try {
      // Upload to Supabase Storage
      const filePath = `${orgId}/${Date.now()}-${sanitizeFilename(uploadFile.file.name)}`
      const { error: storageError } = await supabase.storage
        .from('documents')
        .upload(filePath, uploadFile.file)

      if (storageError) throw storageError

      setFiles((prev) => prev.map((f) => f.id === uploadFile.id ? { ...f, progress: 60 } : f))

      // Create document record
      const { error: dbError } = await supabase.from('documents').insert({
        organization_id: orgId,
        file_name: uploadFile.file.name,
        file_path: filePath,
        file_type: uploadFile.file.type,
        file_size: uploadFile.file.size,
        status: 'processing',
      })

      if (dbError) throw dbError

      setFiles((prev) => prev.map((f) => f.id === uploadFile.id ? { ...f, status: 'done' as const, progress: 100 } : f))
      toast.success(`${uploadFile.file.name} erfolgreich hochgeladen`)

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['documents'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
      queryClient.invalidateQueries({ queryKey: ['recent-documents'] })
    } catch (err) {
      setFiles((prev) => prev.map((f) =>
        f.id === uploadFile.id
          ? { ...f, status: 'error' as const, error: err instanceof Error ? err.message : 'Upload fehlgeschlagen' }
          : f,
      ))
      toast.error(`Fehler bei ${uploadFile.file.name}`)
    }
  }

  const handleUploadAll = async () => {
    const pending = files.filter((f) => f.status === 'pending')
    await Promise.allSettled(pending.map((f) => uploadSingleFile(f)))
  }

  const pendingCount = files.filter((f) => f.status === 'pending').length

  return (
    <AppLayout
      title="Dokument hochladen"
      subtitle="Laden Sie Belege, Rechnungen und Kontoauszüge hoch zur automatischen Verarbeitung."
      action={
        pendingCount > 0 ? (
          <button
            onClick={handleUploadAll}
            className="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-accent-hover"
          >
            <CloudUpload className="h-4 w-4" />
            {pendingCount} Datei{pendingCount > 1 ? 'en' : ''} hochladen
          </button>
        ) : null
      }
    >
      {/* Drop zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragOver(true)
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        className={cn(
          'flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 transition-colors',
          isDragOver
            ? 'border-primary bg-accent'
            : 'border-border bg-card hover:border-primary/50',
        )}
      >
        <CloudUpload className={cn('h-10 w-10', isDragOver ? 'text-primary' : 'text-ink-muted')} />
        <p className="mt-3 text-sm font-medium text-foreground">
          Dateien hierher ziehen oder klicken zum Auswählen
        </p>
        <p className="mt-1 text-xs text-ink-muted">
          PDF, JPG, PNG, TIFF — max. 20 MB pro Datei
        </p>
        <label className="mt-4 cursor-pointer">
          <span className="inline-flex h-8 items-center rounded-md border border-border bg-card px-3 text-sm font-medium text-foreground hover:bg-muted">
            Dateien auswählen
          </span>
          <input
            type="file"
            multiple
            accept={ACCEPTED_TYPES.join(',')}
            className="hidden"
            onChange={(e) => {
              if (e.target.files) addFiles(e.target.files)
              e.target.value = ''
            }}
          />
        </label>
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div className="mt-6 space-y-2">
          <h2 className="text-sm font-medium text-foreground">Letzte Uploads</h2>
          <div className="divide-y divide-border rounded-lg border border-border bg-card">
            {files.map((f) => (
              <div key={f.id} className="flex items-center gap-3 px-4 py-3">
                <File className="h-4 w-4 shrink-0 text-ink-muted" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-foreground" title={f.file.name}>{f.file.name}</p>
                  <p className="text-xs text-ink-muted">
                    {(f.file.size / 1024).toFixed(0)} KB
                    {f.error && <span className="ml-2 text-status-error">{f.error}</span>}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {f.status === 'pending' && (
                    <span className="text-xs text-ink-muted">Bereit</span>
                  )}
                  {f.status === 'uploading' && (
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  )}
                  {f.status === 'processing' && (
                    <Loader2 className="h-4 w-4 animate-spin text-status-warning" />
                  )}
                  {f.status === 'done' && (
                    <CheckCircle className="h-4 w-4 text-status-success" />
                  )}
                  {f.status === 'error' && (
                    <AlertCircle className="h-4 w-4 text-status-error" />
                  )}
                  {f.status === 'pending' && (
                    <button onClick={() => removeFile(f.id)} aria-label="Datei entfernen" className="text-ink-muted hover:text-foreground">
                      <X className="h-4 w-4" aria-hidden="true" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </AppLayout>
  )
}
