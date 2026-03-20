import { useState, useCallback } from 'react'
import { Upload, FileText, X } from 'lucide-react'
import type { FileUpload as FileUploadType } from '../../hooks/useIntakeForm'

interface FileUploadProps {
  files: FileUploadType[]
  onUpload: (file: File) => void
  disabled?: boolean
}

export default function FileUpload({ files, onUpload, disabled }: FileUploadProps) {
  const [dragOver, setDragOver] = useState(false)

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragOver(false)
      if (disabled) return
      const file = e.dataTransfer.files[0]
      if (file && file.type === 'application/pdf') {
        onUpload(file)
      }
    },
    [onUpload, disabled]
  )

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) {
        onUpload(file)
      }
      e.target.value = ''
    },
    [onUpload]
  )

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-neutral-700">
        Upload Methods / Protocols (PDF)
      </label>

      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragOver
            ? 'border-uidaho-gold bg-yellow-50'
            : 'border-neutral-300 hover:border-neutral-400'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        onClick={() => {
          if (!disabled) document.getElementById('pdf-upload')?.click()
        }}
      >
        <Upload className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
        <p className="text-sm text-neutral-600">
          Drag & drop a PDF here, or <span className="text-uidaho-gold font-medium">browse</span>
        </p>
        <p className="text-xs text-neutral-400 mt-1">PDF files up to 50MB</p>
        <input
          id="pdf-upload"
          type="file"
          accept="application/pdf"
          onChange={handleFileInput}
          className="hidden"
          disabled={disabled}
        />
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file) => (
            <div
              key={file.id}
              className="flex items-center gap-3 p-3 bg-neutral-50 rounded-md border border-neutral-200"
            >
              <FileText className="w-5 h-5 text-red-500 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-neutral-900 truncate">
                  {file.original_filename}
                </p>
                <p className="text-xs text-neutral-500">{formatSize(file.file_size)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
