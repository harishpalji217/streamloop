'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Play, Square, AlertCircle, Clock } from 'lucide-react'
import { formatDate, getStatusColor } from '@/lib/utils'

interface StreamSession {
  id: string
  status: string
  startedAt: string | null
  stoppedAt: string | null
  errorMessage: string | null
  slot: {
    name: string
  }
}

export function RecentActivity() {
  const [sessions, setSessions] = useState<StreamSession[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchSessions() {
      try {
        const res = await fetch('/api/stream/sessions?limit=5')
        const data = await res.json()
        setSessions(data)
      } catch (error) {
        console.error('Failed to fetch sessions:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSessions()
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'RUNNING':
        return <Play className="h-4 w-4 text-green-500" />
      case 'STOPPED':
        return <Square className="h-4 w-4 text-gray-500" />
      case 'ERROR':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />
    }
  }

  return (
    <Card className="col-span-2 lg:col-span-1">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Recent Activity
          <Badge variant="outline" className="text-xs">{sessions.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-4 animate-pulse">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
              </div>
            ))
          ) : sessions.length === 0 ? (
            <div className="p-6 text-center text-gray-500 dark:text-gray-400">
              No recent streaming activity
            </div>
          ) : (
            sessions.map((session) => (
              <div key={session.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">{getStatusIcon(session.status)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {session.slot.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {session.startedAt ? `Started ${formatDate(session.startedAt)}` : 'Pending'}
                      {session.stoppedAt && ` • Stopped ${formatDate(session.stoppedAt)}`}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className={cn('text-xs', getStatusColor(session.status))}
                  >
                    {session.status}
                  </Badge>
                </div>
                {session.errorMessage && (
                  <p className="mt-2 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {session.errorMessage}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}

import { cn } from '@/lib/utils'