'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Switch } from '@/components/ui/Switch'
import { Button } from '@/components/ui/Button'
import { format } from 'date-fns'
import { Save, Loader2 } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface Slot {
  id: string
  name: string
  streamKey: string
  platform: string
  expiresAt: string
  isActive: boolean
  loopEnabled: boolean
  scheduledStart: string | null
  scheduledEnd: string | null
  videoId: string | null
}

interface SlotDetailFormProps {
  slot: Slot
  onUpdate: (slot: Slot) => void
}

export function SlotDetailForm({ slot, onUpdate }: SlotDetailFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    name: slot.name,
    streamKey: slot.streamKey,
    platform: slot.platform,
    expiresAt: slot.expiresAt ? format(new Date(slot.expiresAt), "yyyy-MM-dd'T'HH:mm") : '',
    loopEnabled: slot.loopEnabled,
    scheduledStart: slot.scheduledStart ? format(new Date(slot.scheduledStart), "yyyy-MM-dd'T'HH:mm") : '',
    scheduledEnd: slot.scheduledEnd ? format(new Date(slot.scheduledEnd), "yyyy-MM-dd'T'HH:mm") : '',
    isActive: slot.isActive,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const payload = {
        ...formData,
        expiresAt: formData.expiresAt ? new Date(formData.expiresAt).toISOString() : formData.expiresAt,
        scheduledStart: formData.scheduledStart ? new Date(formData.scheduledStart).toISOString() : null,
        scheduledEnd: formData.scheduledEnd ? new Date(formData.scheduledEnd).toISOString() : null,
      }

      const res = await fetch(`/api/slots/${slot.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error?.[0]?.message || 'Failed to update slot')
      }

      const updated = await res.json()
      onUpdate(updated)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update slot')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Slot Configuration</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-md bg-red-50 text-red-600 text-sm dark:bg-red-900/30 dark:text-red-400">
              {error}
            </div>
          )}

          <Input
            label="Slot Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <Input
            label="Stream Key"
            type="password"
            placeholder="Paste your YouTube Live stream key"
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

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Expires At"
              type="datetime-local"
              value={formData.expiresAt}
              onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
              required
            />
            <Input
              label="Scheduled Start (Optional)"
              type="datetime-local"
              value={formData.scheduledStart}
              onChange={(e) => setFormData({ ...formData, scheduledStart: e.target.value })}
            />
          </div>

          <Input
            label="Scheduled End (Optional)"
            type="datetime-local"
            value={formData.scheduledEnd}
            onChange={(e) => setFormData({ ...formData, scheduledEnd: e.target.value })}
          />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Slot Active</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Enable or disable this slot</p>
              </div>
              <Switch
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Loop Video</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Automatically restart video when it ends</p>
              </div>
              <Switch
                checked={formData.loopEnabled}
                onChange={(e) => setFormData({ ...formData, loopEnabled: e.target.checked })}
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button type="submit" disabled={loading} isLoading={loading}>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}