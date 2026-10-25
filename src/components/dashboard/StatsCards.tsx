'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Radio, Video, UserCheck, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatsData {
  activeSlots: number
  totalSlots: number
  totalVideos: number
  totalStorage: number
  recentSessions: number
}

export function StatsCards() {
  const [stats, setStats] = useState<StatsData>({
    activeSlots: 0,
    totalSlots: 0,
    totalVideos: 0,
    totalStorage: 0,
    recentSessions: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const [slotsRes, videosRes, sessionsRes] = await Promise.all([
          fetch('/api/slots'),
          fetch('/api/videos'),
          fetch('/api/stream/sessions?limit=5'),
        ])

        const slots = await slotsRes.json()
        const videos = await videosRes.json()
        const sessions = await sessionsRes.json()

        setStats({
          activeSlots: slots.filter((s: any) => s.isActive).length,
          totalSlots: slots.length,
          totalVideos: videos.length,
          totalStorage: videos.reduce((acc: number, v: any) => acc + v.fileSize, 0),
          recentSessions: sessions.length,
        })
      } catch (error) {
        console.error('Failed to fetch stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const cards = [
    {
      title: 'Active Slots',
      value: loading ? '—' : stats.activeSlots,
      subtitle: `${stats.totalSlots} total slots`,
      icon: Radio,
      color: 'text-primary-600 bg-primary-100 dark:bg-primary-900/30 dark:text-primary-400',
      href: '/live-slots',
    },
    {
      title: 'Videos',
      value: loading ? '—' : stats.totalVideos,
      subtitle: `${formatFileSize(stats.totalStorage)} total`,
      icon: Video,
      color: 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400',
      href: '/videos',
    },
    {
      title: 'Recent Streams',
      value: loading ? '—' : stats.recentSessions,
      subtitle: 'Last 5 sessions',
      icon: TrendingUp,
      color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400',
      href: '/live-slots',
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((card) => (
        <Link key={card.title} href={card.href} className="block">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{card.title}</p>
                  <p className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">{card.value}</p>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{card.subtitle}</p>
                </div>
                <div className={cn('p-3 rounded-xl', card.color)}>
                  <card.icon className="h-6 w-6" aria-hidden="true" />
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}