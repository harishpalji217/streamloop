'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { formatDate, maskStreamKey } from '@/lib/utils'
import { Edit, Trash2 } from 'lucide-react'

interface Slot {
  id: string
  name: string
  streamKey: string
  platform: string
  expiresAt: string
  isActive: boolean
  loopEnabled: boolean
  video: any
  createdAt: string
}

interface SlotsTableProps {
  slots: Slot[]
  loading: boolean
  onRefresh: () => void
}

export function SlotsTable({ slots, loading, onRefresh }: SlotsTableProps) {
  const [activeStreamMap, setActiveStreamMap] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (slots.length === 0) return
    const checkAllStreams = async () => {
      const results: Record<string, boolean> = {}
      for (const slot of slots) {
        try {
          const res = await fetch(`/api/stream?slotId=${slot.id}`)
          const data = await res.json()
          results[slot.id] = !!data.isStreaming
        } catch {
          results[slot.id] = false
        }
      }
      setActiveStreamMap(results)
    }

    checkAllStreams()
    const timer = setInterval(checkAllStreams, 4000)
    return () => clearInterval(timer)
  }, [slots])

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return

    try {
      const res = await fetch(`/api/slots/${id}`, { method: 'DELETE' })
      if (res.ok) onRefresh()
    } catch (error) {
      console.error('Failed to delete slot:', error)
    }
  }

  const getStatusBadge = (slot: Slot) => {
    const now = new Date()
    const expiresAt = new Date(slot.expiresAt)
    const isExpired = expiresAt < now

    if (!slot.isActive) {
      return <Badge variant="secondary">Off</Badge>
    }
    if (isExpired) {
      return <Badge variant="destructive">Expired</Badge>
    }
    return <Badge variant="default">Active</Badge>
  }

  const getStreamStatusBadge = (slot: Slot) => {
    const isStreaming = activeStreamMap[slot.id]
    if (isStreaming) {
      return (
        <Badge variant="destructive" className="animate-pulse text-xs">
          Live
        </Badge>
      )
    }
    return <Badge variant="outline" className="text-xs">Idle</Badge>
  }

  if (loading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800 p-8 text-center text-gray-500">
        Loading slots...
      </div>
    )
  }

  if (slots.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800 p-12 text-center">
        <p className="text-gray-500 dark:text-gray-400 mb-4">No streaming slots configured</p>
        <Button onClick={onRefresh} variant="outline" size="sm">
          Refresh
        </Button>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-8">#</TableHead>
            <TableHead>Slot Name</TableHead>
            <TableHead>Platform</TableHead>
            <TableHead>Stream Key</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Stream Status</TableHead>
            <TableHead>Expires</TableHead>
            <TableHead className="w-32">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {slots.map((slot, index) => (
            <TableRow key={slot.id}>
              <TableCell className="font-mono text-gray-500">{index + 1}</TableCell>
              <TableCell>
                <div>
                  <Link href={`/live-slots/${slot.id}`} className="font-medium text-primary-600 hover:underline">
                    {slot.name}
                  </Link>
                  {slot.video && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-xs">
                      {slot.video.originalName}
                    </p>
                  )}
                </div>
              </TableCell>
              <TableCell className="capitalize">{slot.platform}</TableCell>
              <TableCell className="font-mono text-xs">{maskStreamKey(slot.streamKey)}</TableCell>
              <TableCell>{getStatusBadge(slot)}</TableCell>
              <TableCell>{getStreamStatusBadge(slot)}</TableCell>
              <TableCell className="text-sm">{formatDate(slot.expiresAt)}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Link href={`/live-slots/${slot.id}`}>
                    <Button variant="ghost" size="icon" title="Edit Slot">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(slot.id, slot.name)}
                    className="text-red-500 hover:text-red-700"
                    title="Delete Slot"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
