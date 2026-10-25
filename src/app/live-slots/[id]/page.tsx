'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { MainLayout } from '@/components/layout/MainLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Switch } from '@/components/ui/Switch'
import { Badge } from '@/components/ui/Badge'
import { VideoSelector } from '@/components/slots/VideoSelector'
import { StreamControls } from '@/components/slots/StreamControls'
import { ArrowLeft, Save, Loader2, Trash2 } from 'lucide-react'

interface Slot {
  id: string
  name: string
  streamKey: string
  platform: string
  expiresAt: string
  isActive: boolean
  loopEnabled: boolean
  videoId: string | null
  video: any
  streamSessions: any[]
  createdAt: string
  updatedAt: string
}

export default function SlotDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [slot, setSlot] = useState<Slot | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [formData, setFormData] = useState({
    name: '',
    streamKey: '',
    platform: 'youtube',
    expiresAt: '',
    isActive: false,
    loopEnabled: true,
  })

  useEffect(() => {
    if (params.id) fetchSlot()
  }, [params.id])

  const fetchSlot = async () => {
    try {
      const res = await fetch(`/api/slots/${params.id}`)
      if (!res.ok) throw new Error('Slot not found')
      const data = await res.json()
      setSlot(data)
      setFormData({
        name: data.name,
        streamKey: data.streamKey || '',
        platform: data.platform,
        expiresAt: data.expiresAt ? new Date(data.expiresAt).toISOString().slice(0, 16) : '',
        isActive: data.isActive,
        loopEnabled: data.loopEnabled,
      })
    } catch (err) {
      setError('Failed to load slot')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const res = await fetch(`/api/slots/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to save')
      }

      const updated = await res.json()
      setSlot((prev) => prev ? { ...prev, ...updated } : null)
      setSuccess('Slot saved successfully!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this slot?')) return

    try {
      const res = await fetch(`/api/slots/${params.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      router.push('/live-slots')
    } catch (err) {
      setError('Failed to delete slot')
    }
  }

  const handleVideoSelect = async (videoId: string) => {
    try {
      const res = await fetch(`/api/slots/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoId }),
      })

      if (!res.ok) throw new Error('Failed to link video')
      await fetchSlot()
    } catch (err) {
      setError('Failed to link video to slot')
    }
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
        </div>
      </MainLayout>
    )
  }

  if (!slot) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Slot not found</h2>
          <Button onClick={() => router.push('/live-slots')} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Live Slots
          </Button>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => router.push('/live-slots')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{slot.name}</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">ID: {slot.id}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={slot.isActive ? 'default' : 'secondary'}>
              {slot.isActive ? 'Active' : 'Inactive'}
            </Badge>
            <Button variant="destructive" size="sm" onClick={handleDelete}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="p-3 rounded-md bg-red-50 text-red-600 text-sm dark:bg-red-900/30 dark:text-red-400">
            {error}
          </div>
        )}
        {success && (
          <div className="p-3 rounded-md bg-green-50 text-green-600 text-sm dark:bg-green-900/30 dark:text-green-400">
            {success}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left Column - Settings */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Slot Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  label="Slot Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />

                <Input
                  label="Stream Key"
                  type="password"
                  placeholder="Paste your YouTube stream key"
                  value={formData.streamKey}
                  onChange={(e) => setFormData({ ...formData, streamKey: e.target.value })}
                  helperText="Get this from YouTube Studio > Go Live > Stream Settings"
                />

                <Select
                  label="Platform"
                  value={formData.platform}
                  onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                  options={[
                    { value: 'youtube', label: 'YouTube Live' },
                    { value: 'twitch', label: 'Twitch' },
                    { value: 'facebook', label: 'Facebook Live' },
                    { value: 'custom', label: 'Custom RTMP' },
                  ]}
                />

                <Input
                  label="Expires At"
                  type="datetime-local"
                  value={formData.expiresAt}
                  onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                />

                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Active</p>
                    <p className="text-sm text-gray-500">Enable this slot for streaming</p>
                  </div>
                  <Switch
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  />
                </div>

                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Loop Video</p>
                    <p className="text-sm text-gray-500">Restart video automatically when it ends</p>
                  </div>
                  <Switch
                    checked={formData.loopEnabled}
                    onChange={(e) => setFormData({ ...formData, loopEnabled: e.target.checked })}
                  />
                </div>

                <Button onClick={handleSave} disabled={saving} isLoading={saving} className="w-full">
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Video & Stream */}
          <div className="space-y-6">
            <VideoSelector
              slotId={slot.id}
              currentVideo={slot.video}
              onVideoSelect={handleVideoSelect}
            />

            <StreamControls
              slot={slot}
              onUpdate={(updated) => setSlot((prev) => prev ? { ...prev, ...updated } : null)}
            />
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
