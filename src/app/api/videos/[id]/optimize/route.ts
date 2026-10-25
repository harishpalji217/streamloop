import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { optimizeVideo } from '@/lib/video-optimizer'

export const dynamic = 'force-dynamic'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const video = await prisma.video.findUnique({
      where: { id: params.id },
    })

    if (!video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 })
    }

    // Trigger optimization
    await optimizeVideo(params.id)

    const updated = await prisma.video.findUnique({
      where: { id: params.id },
    })

    return NextResponse.json({
      success: true,
      message: 'Video optimization complete',
      video: updated,
    })
  } catch (error) {
    console.error('Error in optimize route:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Optimization failed' },
      { status: 500 }
    )
  }
}
