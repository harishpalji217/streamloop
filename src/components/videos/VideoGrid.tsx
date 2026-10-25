'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { formatFileSize, formatDuration, formatDate, cn } from '@/lib/utils'
import { Video, Trash2, Play, ExternalLink, Upload, Zap } from 'lucide-react'

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

interface VideoGridProps {
  videos: Video[]
  loading: boolean
  onDelete: (id: string) => void
}

export function VideoGrid({ videos, loading, onDelete }: VideoGridProps) {
  const [optimizingId, setOptimizingId] = useState<string | null>(null)

  const handleOptimize = async (id: string) => {
    setOptimizingId(id)
    try {
      const res = await fetch(`/api/videos/${id}/optimize`, {
        method: 'POST',
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to optimize video')
      }
      alert('⚡ Video successfully optimized for YouTube Live with 2.0s keyframes!')
      window.location.reload()
    } catch (error) {
      console.error('Optimization error:', error)
      alert(error instanceof Error ? error.message : 'Optimization failed')
    } finally {
      setOptimizingId(null)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this video? This action cannot be undone.')) {
      return
    }

    try {
      const res = await fetch(`/api/videos/${id}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        throw new Error('Failed to delete video')
      }

      onDelete(id)
    } catch (error) {
      console.error('Failed to delete video:', error)
      alert('Failed to delete video')
    }
  }

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg mb-3" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-1" />
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
          </div>
        ))}
      </div>
    )
  }

  if (videos.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800 p-12 text-center">
        <Video className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No videos yet</h3>
        <p className="text-gray-500 dark:text-gray-400 mb-6">Upload your first video to get started</p>
        <Button onClick={() => (document.querySelector('[data-upload-trigger]') as HTMLElement | null)?.click()}>
          <Upload className="h-4 w-4 mr-2" />
          Upload Video
        </Button>
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {videos.map((video) => (
        <div
          key={video.id}
          className="group rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800 overflow-hidden transition-shadow hover:shadow-lg"
        >
          {/* Thumbnail */}
          <div className="relative aspect-video overflow-hidden bg-gray-100 dark:bg-gray-700">
            {video.thumbnailPath ? (
              <img
                src={video.thumbnailPath}
                alt={video.originalName}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Video className="h-12 w-12 text-gray-400" />
              </div>
            )}

            {/* Overlay */}
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Button variant="default" size="icon" className="h-12 w-12">
                <Play className="h-6 w-6" />
              </Button>
            </div>

            {/* Duration badge */}
            {video.duration && (
              <div className="absolute bottom-2 right-2 px-2 py-1 rounded bg-black/70 text-white text-xs font-mono">
                {formatDuration(video.duration)}
              </div>
            )}
          </div>

          {/* Video Info */}
          <div className="p-3 space-y-2">
            <p className="font-medium text-gray-900 dark:text-white truncate" title={video.originalName}>
              {video.originalName}
            </p>

            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>{formatFileSize(video.fileSize)}</span>
              {video.width && video.height && (
                <span>{video.width}x{video.height}</span>
              )}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
              <span className="text-xs text-gray-400 dark:text-gray-500">
                {formatDate(video.createdAt)}
              </span>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 px-2 text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400"
                  onClick={() => handleOptimize(video.id)}
                  isLoading={optimizingId === video.id}
                  title="Optimize with 2.0s keyframes for YouTube"
                >
                  <Zap className="h-3 w-3 mr-1" />
                  YouTube Fix
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-red-600 hover:text-red-700"
                  onClick={() => handleDelete(video.id)}
                  aria-label="Delete video"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}