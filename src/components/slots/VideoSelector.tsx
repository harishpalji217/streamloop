'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Progress } from '@/components/ui/Progress'
import { Upload, Video, Check, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface VideoItem {
  id: string
  filename: string
  originalName: string
  filePath: string
  fileSize: number
  duration: number | null
  thumbnailPath: string | null
  createdAt: string
}

interface VideoSelectorProps {
  slotId: string
  currentVideo: VideoItem | null
  onVideoSelect: (videoId: string) => void
}

function formatSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

export function VideoSelector({ slotId, currentVideo, onVideoSelect }: VideoSelectorProps) {
  const [videos, setVideos] = useState<VideoItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  useEffect(() => {
    fetchVideos()
  }, [])

  const fetchVideos = async () => {
    try {
      const res = await fetch('/api/videos')
      const data = await res.json()
      setVideos(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Failed to fetch videos:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async (file: File) => {
    setUploading(true)
    setUploadProgress(0)

    const formData = new FormData()
    formData.append('video', file)

    try {
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            setUploadProgress(Math.round((e.loaded / e.total) * 100))
          }
        })
        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve()
          } else {
            try {
              const resp = JSON.parse(xhr.responseText)
              reject(new Error(resp.error || 'Upload failed'))
            } catch {
              reject(new Error('Upload failed'))
            }
          }
        })
        xhr.addEventListener('error', () => reject(new Error('Network error')))
        xhr.open('POST', '/api/upload')
        xhr.send(formData)
      })

      await fetchVideos()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Video Selection</CardTitle>
            <Button size="sm" onClick={() => setShowModal(true)}>
              <Video className="h-4 w-4 mr-2" />
              {currentVideo ? 'Change Video' : 'Select Video'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {currentVideo ? (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
              <Check className="h-5 w-5 text-green-600" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 dark:text-white truncate">{currentVideo.originalName}</p>
                <p className="text-sm text-gray-500">{formatSize(currentVideo.fileSize)}</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500 dark:text-gray-400">
              <Video className="h-10 w-10 mx-auto mb-2 opacity-50" />
              <p>No video selected. Click &quot;Select Video&quot; to choose one.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Select or Upload Video" size="lg">
        <div className="space-y-4">
          {/* Upload Section */}
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center">
            {uploading ? (
              <div className="space-y-2">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary-600" />
                <Progress value={uploadProgress} label="Uploading..." showValue />
              </div>
            ) : (
              <>
                <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Upload a new video</p>
                <input
                  type="file"
                  accept="video/mp4,video/webm,video/quicktime"
                  className="hidden"
                  id="video-upload-input"
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (f) handleUpload(f)
                  }}
                />
                <Button size="sm" variant="outline" onClick={() => document.getElementById('video-upload-input')?.click()}>
                  Choose File
                </Button>
              </>
            )}
          </div>

          {/* Video List */}
          <div className="max-h-64 overflow-y-auto space-y-2">
            {loading ? (
              <div className="text-center py-4">
                <Loader2 className="h-6 w-6 animate-spin mx-auto" />
              </div>
            ) : videos.length === 0 ? (
              <p className="text-center text-gray-500 py-4">No videos uploaded yet</p>
            ) : (
              videos.map((video) => (
                <button
                  key={video.id}
                  onClick={() => {
                    onVideoSelect(video.id)
                    setShowModal(false)
                  }}
                  className={cn(
                    'w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-colors',
                    currentVideo?.id === video.id
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                  )}
                >
                  <Video className="h-8 w-8 text-gray-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white truncate">{video.originalName}</p>
                    <p className="text-xs text-gray-500">{formatSize(video.fileSize)}</p>
                  </div>
                  {currentVideo?.id === video.id && (
                    <Check className="h-5 w-5 text-primary-600 flex-shrink-0" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      </Modal>
    </>
  )
}
