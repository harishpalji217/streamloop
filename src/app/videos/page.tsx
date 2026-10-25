'use client'

import { useState, useEffect } from 'react'
import { MainLayout } from '@/components/layout/MainLayout'
import { VideoGrid } from '@/components/videos/VideoGrid'
import { VideoUploadModal } from '@/components/videos/VideoUploadModal'
import { Button } from '@/components/ui/Button'
import { Upload } from 'lucide-react'

interface Video {
  id: string
  filename: string
  originalName: string
  filePath: string
  fileSize: number
  duration: number | null
  width: number | null
  height: number | null
  status?: string
  thumbnailPath: string | null
  createdAt: string
}

export default function VideosPage() {
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [showUploadModal, setShowUploadModal] = useState(false)

  const fetchVideos = async (showLoadingState = false) => {
    if (showLoadingState) setLoading(true)
    try {
      const res = await fetch('/api/videos')
      const data = await res.json()
      if (Array.isArray(data)) {
        setVideos(data)
      }
    } catch (error) {
      console.error('Failed to fetch videos:', error)
    } finally {
      if (showLoadingState) setLoading(false)
    }
  }

  useEffect(() => {
    fetchVideos(true)
  }, [])

  // Auto-refresh while any video is being processed in the background
  useEffect(() => {
    const hasProcessing = videos.some((v) => v.status === 'PROCESSING')
    if (!hasProcessing) return

    const timer = setInterval(() => {
      fetchVideos(false)
    }, 3000)

    return () => clearInterval(timer)
  }, [videos])

  const handleVideoUploaded = (newVideo: Video) => {
    setVideos((prev) => [newVideo, ...prev])
    setShowUploadModal(false)
  }

  const handleVideoDeleted = (videoId: string) => {
    setVideos((prev) => prev.filter((v) => v.id !== videoId))
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Video Library</h1>
            <p className="mt-1 text-gray-500 dark:text-gray-400">Manage your pre-recorded videos for streaming</p>
          </div>
          <Button onClick={() => setShowUploadModal(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Upload Video
          </Button>
        </div>

        <VideoGrid
          videos={videos}
          loading={loading}
          onDelete={handleVideoDeleted}
          onRefresh={() => fetchVideos(false)}
        />

        <VideoUploadModal
          isOpen={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          onSuccess={handleVideoUploaded}
        />
      </div>
    </MainLayout>
  )
}
