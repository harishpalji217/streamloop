import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { optimizeVideo } from '@/lib/video-optimizer'
import { v4 as uuidv4 } from 'uuid'
import fs from 'fs/promises'
import { createWriteStream } from 'fs'
import { pipeline } from 'stream/promises'
import { Readable } from 'stream'
import path from 'path'

export const dynamic = 'force-dynamic'

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads')

async function ensureUploadDir() {
  try {
    await fs.access(UPLOAD_DIR)
  } catch {
    await fs.mkdir(UPLOAD_DIR, { recursive: true })
  }
}

function getVideoMetadata(filePath: string): Promise<{ duration: number; width: number; height: number }> {
  return new Promise((resolve) => {
    try {
      const ffmpeg = require('fluent-ffmpeg')
      ffmpeg.ffprobe(filePath, (err: any, metadata: any) => {
        if (err) {
          console.warn('ffprobe failed:', err.message)
          resolve({ duration: 0, width: 0, height: 0 })
          return
        }
        const videoStream = metadata.streams?.find((s: any) => s.codec_type === 'video')
        resolve({
          duration: metadata.format?.duration || 0,
          width: videoStream?.width || 0,
          height: videoStream?.height || 0,
        })
      })
    } catch {
      resolve({ duration: 0, width: 0, height: 0 })
    }
  })
}

export async function POST(request: NextRequest) {
  try {
    await ensureUploadDir()

    const rawFilename = request.headers.get('x-filename')
    const contentType = request.headers.get('content-type') || 'video/mp4'

    // Streamline path: zero-RAM binary streaming for large files
    if (rawFilename && request.body) {
      const originalName = decodeURIComponent(rawFilename)
      const fileExt = path.extname(originalName) || '.mp4'
      const filename = `${uuidv4()}${fileExt}`
      const filePath = path.join(UPLOAD_DIR, filename)
      const relativePath = `/uploads/${filename}`

      const writeStream = createWriteStream(filePath)
      const readableStream = Readable.fromWeb(request.body as any)
      await pipeline(readableStream, writeStream)

      const stat = await fs.stat(filePath)
      if (stat.size === 0) {
        await fs.unlink(filePath).catch(() => {})
        return NextResponse.json({ error: 'Uploaded file is empty' }, { status: 400 })
      }

      const metadata = await getVideoMetadata(filePath)

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

      const video = await prisma.video.create({
        data: {
          filename,
          originalName,
          filePath: relativePath,
          fileSize: stat.size,
          duration: metadata.duration,
          width: metadata.width,
          height: metadata.height,
          mimeType: contentType,
          status: 'READY',
          thumbnailPath: null,
          userId,
        },
      })

      return NextResponse.json(video, { status: 201 })
    }

    // Fallback: standard formData for smaller uploads or alternative clients
    const formData = await request.formData()
    const file = formData.get('video') as File

    if (!file) {
      return NextResponse.json({ error: 'No video file provided' }, { status: 400 })
    }

    const fileExt = path.extname(file.name) || '.mp4'
    const filename = `${uuidv4()}${fileExt}`
    const filePath = path.join(UPLOAD_DIR, filename)
    const relativePath = `/uploads/${filename}`

    const writeStream = createWriteStream(filePath)
    const readableStream = Readable.fromWeb(file.stream() as any)
    await pipeline(readableStream, writeStream)

    const metadata = await getVideoMetadata(filePath)

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

    const video = await prisma.video.create({
      data: {
        filename,
        originalName: file.name,
        filePath: relativePath,
        fileSize: file.size,
        duration: metadata.duration,
        width: metadata.width,
        height: metadata.height,
        mimeType: file.type,
        status: 'READY',
        thumbnailPath: null,
        userId,
      },
    })

    return NextResponse.json(video, { status: 201 })
  } catch (error) {
    console.error('Error uploading video:', error)
    return NextResponse.json(
      { error: 'Failed to upload video: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    )
  }
}
