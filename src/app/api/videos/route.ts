import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createVideoSchema = z.object({
  filename: z.string(),
  originalName: z.string(),
  filePath: z.string(),
  fileSize: z.number(),
  duration: z.number().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  mimeType: z.string().default('video/mp4'),
  thumbnailPath: z.string().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || 'default-user'

    // Auto-heal: un-stick any video that has been in PROCESSING for > 2 minutes
    try {
      const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000)
      await prisma.video.updateMany({
        where: {
          userId,
          status: 'PROCESSING',
          updatedAt: { lt: twoMinutesAgo },
        },
        data: { status: 'READY' },
      })
    } catch {}

    const videos = await prisma.video.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(videos)
  } catch (error) {
    console.error('Error fetching videos:', error)
    return NextResponse.json({ error: 'Failed to fetch videos' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = createVideoSchema.parse(body)

    const userId = 'default-user'

    const video = await prisma.video.create({
      data: {
        ...validated,
        userId,
      },
    })

    return NextResponse.json(video, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error('Error creating video:', error)
    return NextResponse.json({ error: 'Failed to create video' }, { status: 500 })
  }
}