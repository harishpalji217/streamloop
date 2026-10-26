'use client'

import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Switch } from '@/components/ui/Switch'
import { format } from 'date-fns'

interface AddSlotModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function AddSlotModal({ isOpen, onClose, onSuccess }: AddSlotModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    streamKey: '',
    platform: 'youtube',
    expiresAt: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), "yyyy-MM-dd'T'HH:mm"),
    loopEnabled: true,
    scheduledStart: '',
    scheduledEnd: '',
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

      const res = await fetch('/api/slots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error?.[0]?.message || 'Failed to create slot')
      }

      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create slot')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Slot"
      description="Configure a new streaming slot for YouTube Live"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-md bg-red-50 text-red-600 text-sm dark:bg-red-900/30 dark:text-red-400">
            {error}
          </div>
        )}

        <Input
          label="Slot Name"
          placeholder="My Live Stream"
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

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading} isLoading={loading}>
            Create Slot
          </Button>
        </div>
      </form>
    </Modal>
  )
}