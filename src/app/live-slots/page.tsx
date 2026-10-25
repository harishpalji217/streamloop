'use client'

import { useState, useEffect } from 'react'
import { MainLayout } from '@/components/layout/MainLayout'
import { SlotsTable } from '@/components/slots/SlotsTable'
import { AddSlotModal } from '@/components/slots/AddSlotModal'
import { Button } from '@/components/ui/Button'
import { Plus } from 'lucide-react'

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

export default function LiveSlotsPage() {
  const [slots, setSlots] = useState<Slot[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)

  useEffect(() => {
    fetchSlots()
  }, [])

  const fetchSlots = async () => {
    try {
      const res = await fetch('/api/slots')
      const data = await res.json()
      setSlots(data)
    } catch (error) {
      console.error('Failed to fetch slots:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSlotCreated = () => {
    setShowAddModal(false)
    fetchSlots()
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Live Slots</h1>
            <p className="mt-1 text-gray-500 dark:text-gray-400">Manage your streaming slots and configurations</p>
          </div>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Slot
          </Button>
        </div>

        <SlotsTable slots={slots} loading={loading} onRefresh={fetchSlots} />

        <AddSlotModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} onSuccess={handleSlotCreated} />
      </div>
    </MainLayout>
  )
}