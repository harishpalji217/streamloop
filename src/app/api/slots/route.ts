import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createSlotSchema = z.object({
  name: z.string().min(1, 'Slot name is required').max(100),
  streamKey: z.string().optional().default(''),
  platform: z.string().default('youtube'),
  expiresAt: z.string().min(1, 'Expiration date is required'),
  loopEnabled: z.boolean().default(true),
  scheduledStart: z.string().optional().nullable(),
  scheduledEnd: z.string().optional().nullable(),
  videoId: z.string().optional().nullable(),
})

function parseDate(val: string | null | undefined): Date | null {
  if (!val || val.trim() === '') return null
  const d = new Date(val)
  if (isNaN(d.getTime())) return null
  return d
}

let initialBootChecked = false

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    const where: any = {}
    if (status === 'active') where.isActive = true
    if (status === 'expired') where.expiresAt = { lt: new Date() }

    let slots = await prisma.liveSlot.findMany({
      where,
      include: {
        video: {
          select: {
            id: true,
            filename: true,
            originalName: true,
            fileSize: true,
            duration: true,
            thumbnailPath: true,
          },
        },
        _count: {
          select: { streamSessions: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Auto-restore default slots only ONCE on initial server boot
    if (!initialBootChecked && slots.length === 0 && !status) {
      initialBootChecked = true
      try {
        const fs = await import('fs/promises')
        const path = await import('path')
        const seedPath = path.join(process.cwd(), 'src', 'data', 'default-slots.json')
        const raw = await fs.readFile(seedPath, 'utf8')
        const defaultSlots = JSON.parse(raw)

        const userId = 'default-user'
        let user = await prisma.user.findUnique({ where: { id: userId } })
        if (!user) {
          user = await prisma.user.create({
            data: { id: userId, email: 'admin@streamloop.local', name: 'Admin User' }
          })
        }

        for (const ds of defaultSlots) {
          await prisma.liveSlot.create({
            data: {
              name: ds.name,
              streamKey: ds.streamKey || '',
              platform: ds.platform || 'youtube',
              expiresAt: new Date(ds.expiresAt || Date.now() + 365 * 24 * 3600 * 1000),
              loopEnabled: ds.loopEnabled ?? true,
              userId,
            }
          })
        }

        slots = await prisma.liveSlot.findMany({
          where,
          include: {
            video: {
              select: {
                id: true,
                filename: true,
                originalName: true,
                fileSize: true,
                duration: true,
                thumbnailPath: true,
              },
            },
            _count: {
              select: { streamSessions: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        })
      } catch (err) {
        console.warn('Auto-restore default slots note:', err)
      }
    }

    return NextResponse.json(slots)
  } catch (error) {
    console.error('Error fetching slots:', error)
    return NextResponse.json({ error: 'Failed to fetch slots' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = createSlotSchema.parse(body)

    const userId = 'default-user'

    let user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) {
      user = await prisma.user.create({
        data: {
          id: userId,
          email: 'admin@streamloop.local',
          name: 'Admin User',
        },
      })
    }

    const expiresAt = parseDate(validated.expiresAt)
    if (!expiresAt) {
      return NextResponse.json({ error: 'Invalid expiration date' }, { status: 400 })
    }

    const slot = await prisma.liveSlot.create({
      data: {
        name: validated.name,
        streamKey: validated.streamKey || '',
        platform: validated.platform,
        expiresAt,
        loopEnabled: validated.loopEnabled,
        scheduledStart: parseDate(validated.scheduledStart),
        scheduledEnd: parseDate(validated.scheduledEnd),
        videoId: validated.videoId || null,
        userId,
      },
      include: {
        video: true,
      },
    })

    return NextResponse.json(slot, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0]?.message || 'Validation error' }, { status: 400 })
    }
    console.error('Error creating slot:', error)
    return NextResponse.json({ error: 'Failed to create slot' }, { status: 500 })
  }
}
