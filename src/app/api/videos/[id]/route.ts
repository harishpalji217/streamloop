import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import fs from 'fs/promises'
import path from 'path'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const video = await prisma.video.findUnique({ where: { id } })

    if (!video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 })
    }

    try {
      const filePath = path.join(process.cwd(), 'public', video.filePath)
      await fs.unlink(filePath)
      if (video.thumbnailPath) {
        const thumbPath = path.join(process.cwd(), 'public', video.thumbnailPath)
        await fs.unlink(thumbPath).catch(() => {})
      }
    } catch (fileErr) {
      console.warn('Failed to delete file:', fileErr)
    }

    await prisma.video.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting video:', error)
    return NextResponse.json({ error: 'Failed to delete video' }, { status: 500 })
  }
}
