'use client'

import React, { useRef, useState } from 'react'
import { Upload, Loader2, CheckCircle, X } from 'lucide-react'

type Props = {
  onUpload: (file: File) => Promise<void>
}

export default function UploadCV({ onUpload }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragActive, setDragActive] = useState(false)
  const [progress, setProgress] = useState<number | null>(null)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    const file = e.dataTransfer.files[0]
    if (!file) return
    await handleFile(file)
  }

  const handleFile = async (file: File) => {
    setProgress(0)
    setSuccess(false)
    setError(null)
    try {
      await onUpload(file)
      setProgress(100)
      setSuccess(true)
    } catch (err: any) {
      setError(err?.message || 'Errore durante upload')
      setProgress(null)
    }
  }

  return (
    <div
      className={`relative border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center transition-all ${dragActive ? 'border-primary-400 bg-primary-50' : 'border-gray-200 bg-white'}`}
      onDragOver={e => {
        e.preventDefault()
        setDragActive(true)
      }}
      onDragLeave={() => setDragActive(false)}
      onDrop={handleDrop}
    >
      <Upload className="h-8 w-8 text-primary-500 mb-2" />
      <p className="mb-2">Trascina qui il CV oppure</p>
      <button
        className="btn btn-sm btn-primary"
        onClick={() => inputRef.current?.click()}
        type="button"
      >
        Scegli file
      </button>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.doc,.docx"
        className="hidden"
        onChange={e => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
        }}
      />
      {progress !== null && (
        <div className="mt-3 w-full">
          <div className="h-2 w-full bg-gray-100 rounded">
            <div className="h-2 bg-primary-500 rounded transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}
      {success && <div className="flex items-center gap-1 text-green-600 mt-2"><CheckCircle className="h-4 w-4" /> Upload completato!</div>}
      {error && <div className="flex items-center gap-1 text-red-600 mt-2"><X className="h-4 w-4" /> {error}</div>}
    </div>
  )
}
