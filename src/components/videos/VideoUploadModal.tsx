'use client'

import { useState, useRef } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Progress } from '@/components/ui/Progress'
import { Upload, CheckCircle, AlertCircle, Film } from 'lucide-react'
import { formatFileSize } from '@/lib/utils'

interface Video {
  id: string
  filename: string
  originalName: string
  filePath: string
  fileSize: number
  duration: number | null
  width: number | null
  height: number | null
  thumbnailPath: string | null
  createdAt: string
}

interface VideoUploadModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (video: Video) => void
}

export function VideoUploadModal({ isOpen, onClose, onSuccess }: VideoUploadModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setError('')
      setSuccess(false)
      setProgress(0)
    }
  }

  const handleUpload = async () => {
    if (!file) {
      setError('Please choose a video file first.')
      return
    }

    setUploading(true)
    setError('')
    setProgress(0)

    try {
      const formData = new FormData()
      formData.append('video', file)

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest()

        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const percentComplete = Math.round((event.loaded / event.total) * 100)
            setProgress(percentComplete)
          }
        })

        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const response = JSON.parse(xhr.responseText)
              setSuccess(true)
              onSuccess(response)
              resolve()
            } catch {
              reject(new Error('Invalid response from server'))
            }
          } else {
            try {
              const response = JSON.parse(xhr.responseText)
              reject(new Error(response.error || 'Upload failed'))
            } catch {
              reject(new Error('Upload failed with status ' + xhr.status))
            }
          }
        })

        xhr.addEventListener('error', () => reject(new Error('Network error during upload')))
        xhr.addEventListener('abort', () => reject(new Error('Upload aborted')))

        xhr.open('POST', '/api/upload')
        xhr.send(formData)
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleCancel = () => {
    setFile(null)
    setProgress(0)
    setError('')
    setSuccess(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCancel}
      title="Upload Video"
      description="Select an MP4, WebM, or MOV video file (max 500MB)"
      size="lg"
    >
      <div className="space-y-4" onClick={(e) => e.stopPropagation()}>
        {!success ? (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Video File
              </label>

              <label
                htmlFor="video-file-upload-input"
                className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 cursor-pointer hover:border-primary-500 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                {file ? (
                  <div className="flex flex-col items-center text-center">
                    <Film className="h-10 w-10 text-primary-600 mb-2" />
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate max-w-xs">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatFileSize(file.size)} &bull; Click to choose another
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-center">
                    <Upload className="h-10 w-10 text-gray-400 mb-2" />
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                      Click to browse and choose a video file
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Supports MP4, WebM, MKV, MOV (max 500MB)
                    </p>
                  </div>
                )}
              </label>

              <input
                id="video-file-upload-input"
                ref={fileInputRef}
                type="file"
                accept="video/mp4,video/webm,video/quicktime,video/x-matroska,.mp4,.webm,.mov,.mkv"
                onChange={handleFileChange}
                disabled={uploading}
                className="hidden"
              />
            </div>

            {error && (
              <div className="p-3 rounded-md bg-red-50 text-red-600 text-sm dark:bg-red-900/30 dark:text-red-400 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {uploading && (
              <div className="space-y-2">
                <Progress value={progress} label="Uploading..." showValue />
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                  {progress}% complete
                </p>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button type="button" variant="outline" onClick={handleCancel} disabled={uploading}>
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleUpload}
                disabled={uploading || !file}
                isLoading={uploading}
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center py-4">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Upload Complete!</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Your video has been uploaded successfully and is ready to use.
            </p>
            <Button type="button" onClick={handleCancel}>
              Done
            </Button>
          </div>
        )}
      </div>
    </Modal>
  )
}
