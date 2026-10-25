'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Play, Square, Loader2, AlertCircle, CheckCircle, Radio } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Slot {
  id: string
  name: string
  streamKey: string
  video: any
  isActive: boolean
  loopEnabled: boolean
}

interface StreamControlsProps {
  slot: Slot
  onUpdate: (slot: Slot) => void
}

export function StreamControls({ slot, onUpdate }: StreamControlsProps) {
  const [streaming, setStreaming] = useState(false)
  const [streamStatus, setStreamStatus] = useState<'idle' | 'starting' | 'running' | 'stopping' | 'error'>('idle')
  const [error, setError] = useState('')

  useEffect(() => {
    checkStreamStatus()
  }, [slot.id])

  const checkStreamStatus = async () => {
    try {
      const res = await fetch(`/api/stream?slotId=${slot.id}`)
      const data = await res.json()
      if (data.isStreaming) {
        setStreaming(true)
        setStreamStatus('running')
      } else {
        setStreaming(false)
        setStreamStatus('idle')
      }
    } catch (error) {
      console.error('Failed to check stream status:', error)
    }
  }

  const startStream = async () => {
    if (!slot.video) {
      setError('Please select a video first')
      return
    }
    if (!slot.streamKey) {
      setError('Please configure a stream key first')
      return
    }

    setStreamStatus('starting')
    setError('')

    try {
      const res = await fetch('/api/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slotId: slot.id }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to start stream')
      }

      setStreaming(true)
      setStreamStatus('running')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start stream')
      setStreamStatus('error')
      setStreaming(false)
    }
  }

  const stopStream = async () => {
    setStreamStatus('stopping')
    setError('')

    try {
      await fetch(`/api/stream?slotId=${slot.id}`, {
        method: 'DELETE',
      })

      setStreaming(false)
      setStreamStatus('idle')
      setError('')
    } catch (err) {
      setStreaming(false)
      setStreamStatus('idle')
    }
  }

  const getStatusConfig = () => {
    switch (streamStatus) {
      case 'starting':
        return { label: 'Starting...', icon: <Loader2 className="h-4 w-4 animate-spin" />, color: 'text-yellow-600' }
      case 'running':
        return { label: 'Live', icon: <Radio className="h-4 w-4 text-red-500 animate-pulse" />, color: 'text-red-600' }
      case 'stopping':
        return { label: 'Stopping...', icon: <Loader2 className="h-4 w-4 animate-spin" />, color: 'text-yellow-600' }
      case 'error':
        return { label: 'Stopped / Error', icon: <AlertCircle className="h-4 w-4 text-gray-500" />, color: 'text-gray-600' }
      default:
        return { label: 'Idle', icon: <Radio className="h-4 w-4 text-gray-400" />, color: 'text-gray-500' }
    }
  }

  const statusConfig = getStatusConfig()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Stream Controls</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Indicator */}
        <div className="flex items-center gap-3 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
          <div className={cn('flex items-center gap-2', statusConfig.color)}>
            {statusConfig.icon}
            <span className="font-medium">{statusConfig.label}</span>
          </div>
          {streaming && (
            <Badge variant="outline" className="ml-auto text-xs" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
              Streaming to YouTube
            </Badge>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-3 rounded-md bg-red-50 text-red-600 text-sm dark:bg-red-900/30 dark:text-red-400 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Control Buttons */}
        <div className="flex gap-3">
          <Button
            type="button"
            onClick={startStream}
            disabled={streaming || streamStatus === 'starting' || !slot.video || !slot.streamKey}
            className="flex-1"
            size="lg"
            isLoading={streamStatus === 'starting'}
          >
            <Play className="h-4 w-4 mr-2" />
            Start Stream
          </Button>

          <Button
            type="button"
            onClick={stopStream}
            disabled={!streaming && streamStatus !== 'running'}
            variant="destructive"
            className="flex-1"
            size="lg"
            isLoading={streamStatus === 'stopping'}
          >
            <Square className="h-4 w-4 mr-2" />
            Stop Stream
          </Button>
        </div>

        {/* Stream Info */}
        {streaming && (
          <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 space-y-2">
            <p className="text-sm font-medium text-gray-900 dark:text-white">Stream Details</p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-500 dark:text-gray-400">Slot:</span>
                <span className="ml-2 font-mono">{slot.name}</span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Video:</span>
                <span className="ml-2 truncate block">{slot.video?.originalName || 'N/A'}</span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Platform:</span>
                <span className="ml-2 capitalize">YouTube</span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Loop:</span>
                <span className="ml-2">{slot.loopEnabled ? 'Enabled' : 'Disabled'}</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
