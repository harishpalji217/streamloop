'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Plus, Upload, RotateCcw } from 'lucide-react'

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Link href="/live-slots/new" className="block">
          <Button className="w-full justify-start gap-3" variant="default">
            <Plus className="h-5 w-5" />
            <span>Add New Slot</span>
          </Button>
        </Link>
        <Link href="/videos" className="block">
          <Button className="w-full justify-start gap-3" variant="outline">
            <Upload className="h-5 w-5" />
            <span>Upload Video</span>
          </Button>
        </Link>
        <Link href="/live-slots" className="block">
          <Button className="w-full justify-start gap-3" variant="outline">
            <RotateCcw className="h-5 w-5" />
            <span>Renew Expired Slots</span>
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}