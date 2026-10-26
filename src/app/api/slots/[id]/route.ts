import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { streamingManager } from '@/lib/streaming'
import { z } from 'zod'

function parseDate(val: string | null | undefined): Date | null {
  if (!val || val.trim() === '') return null
  const d = new Date(val)
  if (isNaN(d.getTime())) return null
  return d
}

const updateSlotSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  streamKey: z.string().optional(),
  platform: z.string().optional(),
  expiresAt: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
  loopEnabled: z.boolean().optional(),
  scheduledStart: z.string().optional().nullable(),
  scheduledEnd: z.string().optional().nullable(),
  videoId: z.string().optional().nullable(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const slot = await prisma.liveSlot.findUnique({
      where: { id },
      include: {
        video: true,
        streamSessions: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    })

    if (!slot) {
      return NextResponse.json({ error: 'Slot not found' }, { status: 404 })
    }

    return NextResponse.json(slot)
  } catch (error) {
    console.error('Error fetching slot:', error)
    return NextResponse.json({ error: 'Failed to fetch slot' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const validated = updateSlotSchema.parse(body)

    const updateData: any = { ...validated }

    if (validated.expiresAt !== undefined) {
      updateData.expiresAt = parseDate(validated.expiresAt)
    }
    if (validated.scheduledStart !== undefined) {
      updateData.scheduledStart = parseDate(validated.scheduledStart)
    }
    if (validated.scheduledEnd !== undefined) {
      updateData.scheduledEnd = parseDate(validated.scheduledEnd)
    }

    const slot = await prisma.liveSlot.update({
      where: { id },
      data: updateData,
      include: { video: true },
    })

    return NextResponse.json(slot)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error('Error updating slot:', error)
    return NextResponse.json({ error: 'Failed to update slot' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    // Stop running stream if any
    try {
      await streamingManager.stopStream(id)
    } catch {}

    // Delete associated stream sessions first to avoid foreign key constraints
    await prisma.streamSession.deleteMany({ where: { slotId: id } }).catch(() => {})
    await prisma.liveSlot.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting slot:', error)
    return NextResponse.json({ error: 'Failed to delete slot' }, { status: 500 })
  }
}
